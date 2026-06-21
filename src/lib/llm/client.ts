import { getLlmConfig } from './preflight';

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface InvokeLlmOptions {
  model: string;
  temperature?: number;
  /** 单次请求超时（毫秒），默认 45000 */
  timeoutMs?: number;
  /** 是否启用快速模式（8s 超时，不重试），用于 Vercel 等有严格函数超时限制的环境 */
  fast?: boolean;
}

export interface InvokeLlmResult {
  content: string;
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
    code?: string;
    type?: string;
  };
}

/** LLM 单次请求超时（毫秒） */
const DEFAULT_TIMEOUT_MS = 45000;
/** generate-names 等对延迟敏感的场景使用更短超时（低于 Vercel 函数限制） */
const FAST_TIMEOUT_MS = 6000;
/** LLM 上游失败时的轻量重试次数（不含首次） */
const MAX_RETRIES = 1;

/**
 * 调用 LLM 单次请求（含 AbortController 超时控制）
 * 超时或上游 5xx 时抛出错误，由调用方决定是否重试
 */
async function invokeLlmOnce(
  messages: LlmMessage[],
  options: InvokeLlmOptions,
): Promise<InvokeLlmResult> {
  const config = getLlmConfig();
  if (!config.apiKey || !config.baseUrl) {
    throw new Error('LLM client is missing required configuration');
  }

  const timeoutMs = options.fast
    ? FAST_TIMEOUT_MS
    : options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = options.fast ? 0 : MAX_RETRIES;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model,
        messages,
        temperature: options.temperature,
      }),
      signal: controller.signal,
    });

    const payload = (await response.json().catch(() => ({}))) as ChatCompletionResponse;
    if (!response.ok) {
      const detail = payload.error?.message || response.statusText || 'LLM request failed';
      throw new Error(`LLM request failed: ${response.status} ${detail}`);
    }

    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('LLM response did not include message content');
    }

    return { content };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 调用 LLM，含 AbortController 超时 + 最多 1 次轻量重试
 * - 超时或上游 5xx 时自动重试 1 次
 * - 4xx（如 400/401/403）不重试
 * - 不暴露 API key / stack trace / raw prompt / raw AI output
 */
export async function invokeLlm(
  messages: LlmMessage[],
  options: InvokeLlmOptions,
): Promise<InvokeLlmResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await invokeLlmOnce(messages, options);
    } catch (error) {
      lastError = error as Error;
      const isAbort = (error as Error).name === 'AbortError';
      const isServerError = /LLM request failed: 5\d\d/.test((error as Error).message);

      // 超时或上游 5xx 才重试；4xx / 配置错误 / 解析错误不重试
      if (!isAbort && !isServerError) {
        break;
      }
      // 最后一次尝试失败后退出
      if (attempt === maxRetries) {
        break;
      }
      // 重试前短暂等待
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // 返回友好错误，不暴露 API key / stack trace / raw prompt
  const msg = lastError?.message || 'LLM request failed';
  if (msg.includes('AbortError') || msg.includes('aborted')) {
    throw new Error('LLM 请求超时，请稍后重试');
  }
  throw new Error('LLM 请求失败，请稍后重试');
}
