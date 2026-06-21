/**
 * 环境变量完整性检查
 *
 * 用于：
 * - 构建时检查关键环境变量是否配置
 * - 运行时为 API 路由提供凭证缺失检测
 * - 为 sitemap/canonical 提供安全 fallback
 */

import { getPublicEnv } from './public-env';
import { getServerEnv } from './server-env';

/** 环境检查结果 */
export interface EnvCheckResult {
  /** 是否所有必需变量都已配置 */
  ok: boolean;
  /** 缺失的变量名列表（不含值） */
  missing: string[];
  /** 警告列表（不阻塞但需关注） */
  warnings: string[];
}

/** 客户端必需的公开环境变量 */
export const REQUIRED_PUBLIC_ENV_KEYS = ['NEXT_PUBLIC_SITE_URL'] as const;

/** 服务端必需的环境变量（用于 LLM 功能） */
export const REQUIRED_SERVER_ENV_KEYS = ['LLM_API_KEY', 'LLM_BASE_URL'] as const;

/**
 * 检查客户端公开环境变量
 * 可在客户端或服务端调用
 */
export function checkPublicEnv(): EnvCheckResult {
  const missing: string[] = [];
  const warnings: string[] = [];
  const publicEnv = getPublicEnv();

  if (!process.env.NEXT_PUBLIC_SITE_URL?.trim()) {
    warnings.push(
      'NEXT_PUBLIC_SITE_URL 未设置，sitemap/canonical 将回退到 localhost。生产环境必须设置此变量。',
    );
  }

  // 检测是否在生产环境硬编码 localhost
  if (publicEnv.appEnv === 'production' && publicEnv.siteUrl.includes('localhost')) {
    warnings.push(
      '生产环境检测到 localhost 作为 siteUrl，请设置 NEXT_PUBLIC_SITE_URL 为正式域名。',
    );
  }

  return {
    ok: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * 检查服务端环境变量
 * 只能在服务端调用
 */
export function checkServerEnv(): EnvCheckResult {
  const missing: string[] = [];
  const warnings: string[] = [];
  const serverEnv = getServerEnv();

  if (!serverEnv.llmApiKey) {
    missing.push('LLM_API_KEY');
  }
  if (!serverEnv.llmBaseUrl) {
    missing.push('LLM_BASE_URL');
  }

  return {
    ok: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * 完整环境检查（客户端 + 服务端）
 * 只能在服务端调用
 */
export function checkFullEnv(): EnvCheckResult {
  const publicCheck = checkPublicEnv();
  const serverCheck = checkServerEnv();

  return {
    ok: publicCheck.ok && serverCheck.ok,
    missing: [...publicCheck.missing, ...serverCheck.missing],
    warnings: [...publicCheck.warnings, ...serverCheck.warnings],
  };
}

/**
 * 获取 LLM 凭证缺失时的友好错误消息
 * 不暴露具体密钥信息
 */
export function getLlmCredentialsErrorMessage(): string {
  return 'AI 服务暂未配置，请稍后再试或联系管理员。';
}
