export const LLM_REQUIRED_ENV_KEYS = [
  'LLM_API_KEY',
  'LLM_BASE_URL',
] as const;

export type LlmRequiredEnvKey = (typeof LLM_REQUIRED_ENV_KEYS)[number];

export interface LlmPreflightResult {
  ok: boolean;
  reason?: 'LLM_CREDENTIALS_MISSING';
  missingKeys?: LlmRequiredEnvKey[];
}

type EnvMap = Record<string, string | undefined>;

export function checkLlmPreflight(env: EnvMap = process.env): LlmPreflightResult {
  const missingKeys = LLM_REQUIRED_ENV_KEYS.filter((key) => !env[key]?.trim());

  if (missingKeys.length > 0) {
    return {
      ok: false,
      reason: 'LLM_CREDENTIALS_MISSING',
      missingKeys,
    };
  }

  return { ok: true };
}

export function getLlmConfig(env: EnvMap = process.env) {
  return {
    apiKey: env.LLM_API_KEY,
    baseUrl: env.LLM_BASE_URL,
  };
}

export function getLlmModel(env: EnvMap = process.env): string {
  return env.LLM_MODEL?.trim() || 'agnes-2.0-flash';
}
