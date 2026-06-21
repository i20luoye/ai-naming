/**
 * 轻量埋点统一封装
 *
 * 隐私保护规则（硬约束）：
 * - 不记录完整出生年月日时（只记录 hasBirthTime: boolean, calendarType）
 * - 不记录完整姓名（只记录 surnameLength, givenNameLength）
 * - 不记录手机号、微信号、身份证、IP
 * - 不记录 LLM prompt 原文
 * - 不记录 raw AI output
 *
 * 实现规则：
 * - 生产环境可 console 静默或预留接口（当前静默，不发送第三方请求）
 * - 开发环境 console.debug 输出
 * - 不接数据库
 * - 不发真实第三方请求
 */

import { isProduction } from '@/lib/env/public-env';
import type { AnalyticsEventName } from './events';

/** 敏感字段名列表，用于自动过滤 */
const SENSITIVE_PAYLOAD_KEYS = [
  'birthDate',
  'birthTime',
  'fullName',
  'surname',
  'givenName',
  'phone',
  'wechat',
  'idCard',
  'ip',
  'rawPrompt',
  'rawAIOutput',
  'llmApiKey',
  'apiKey',
  'token',
  'password',
  'email',
] as const;

/** 过滤掉 payload 中的敏感字段 */
function sanitizePayload(payload: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (SENSITIVE_PAYLOAD_KEYS.includes(key as (typeof SENSITIVE_PAYLOAD_KEYS)[number])) {
      continue;
    }
    // 递归过滤嵌套对象
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizePayload(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * 统一埋点入口
 *
 * @param name 事件名称（使用 ANALYTICS_EVENTS 常量）
 * @param payload 非敏感摘要数据
 *
 * 安全保证：
 * - 自动过滤敏感字段（birthDate/birthTime/fullName/surname/givenName/phone/wechat/idCard/ip/rawPrompt/rawAIOutput/llmApiKey/apiKey/token/password/email）
 * - 生产环境静默（不发送第三方请求，不写 console）
 * - 开发环境 console.debug 输出
 */
export function trackEvent(
  name: AnalyticsEventName,
  payload: Record<string, unknown> = {},
): void {
  const sanitized = sanitizePayload(payload);

  if (isProduction()) {
    // 生产环境：当前静默，预留第三方统计接口
    // 未来接入第三方统计时，在此处调用，但仍需使用 sanitized payload
    return;
  }

  // 开发环境：console.debug 输出，方便调试
  console.debug('[analytics]', name, sanitized);
}

/**
 * 批量埋点（用于一次性发送多个事件）
 */
export function trackEvents(
  events: Array<{ name: AnalyticsEventName; payload?: Record<string, unknown> }>,
): void {
  for (const event of events) {
    trackEvent(event.name, event.payload || {});
  }
}
