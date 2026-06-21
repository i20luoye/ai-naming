import { getLlmConfig } from './preflight';

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface InvokeLlmOptions {
  model: string;
  temperature?: number;
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

export async function invokeLlm(
  messages: LlmMessage[],
  options: InvokeLlmOptions,
): Promise<InvokeLlmResult> {
  const config = getLlmConfig();
  if (!config.apiKey || !config.baseUrl) {
    throw new Error('LLM client is missing required configuration');
  }

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
  });

  const payload = await response.json().catch(() => ({})) as ChatCompletionResponse;
  if (!response.ok) {
    const detail = payload.error?.message || response.statusText || 'LLM request failed';
    throw new Error(`LLM request failed: ${response.status} ${detail}`);
  }

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('LLM response did not include message content');
  }

  return { content };
}
