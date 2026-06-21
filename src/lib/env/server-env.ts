/**
 * 服务端专用环境变量
 *
 * 安全规则：
 * - 此文件只能在服务端代码（API routes、Server Components、scripts）中导入
 * - 不得在客户端组件中导入
 * - LLM_API_KEY 等密钥只在此处读取，不会暴露到客户端 bundle
 */

/** 服务端专用环境变量 */
export interface ServerEnv {
  /** LLM API 密钥（仅服务端） */
  llmApiKey: string | undefined;
  /** LLM API 基础 URL */
  llmBaseUrl: string | undefined;
  /** LLM 模型名称 */
  llmModel: string;
}

/**
 * 读取服务端环境变量
 * 警告：此函数只能在服务端代码中调用
 */
export function getServerEnv(): ServerEnv {
  return {
    llmApiKey: process.env.LLM_API_KEY?.trim() || undefined,
    llmBaseUrl: process.env.LLM_BASE_URL?.trim() || undefined,
    llmModel: process.env.LLM_MODEL?.trim() || 'agnes-2.0-flash',
  };
}

/**
 * 判断 LLM 凭证是否已配置
 * 不暴露具体密钥值，只返回布尔值
 */
export function hasLlmCredentials(): boolean {
  const env = getServerEnv();
  return !!(env.llmApiKey && env.llmBaseUrl);
}
