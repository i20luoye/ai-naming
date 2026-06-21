/**
 * 埋点事件名称常量
 *
 * 设计原则：
 * - 事件名稳定、语义清晰
 * - 不记录敏感信息（完整出生年月日时、完整姓名、手机号、身份证、IP、LLM prompt 原文、raw AI output）
 * - payload 只记录非敏感摘要
 */

export const ANALYTICS_EVENTS = {
  /** 首页浏览 */
  HOME_VIEW: 'home_view',
  /** 点击开始起名 */
  START_NAMING_CLICK: 'start_naming_click',
  /** 提交出生信息 */
  BIRTH_INFO_SUBMIT: 'birth_info_submit',
  /** 八字结果页展示 */
  BAZI_RESULT_VIEW: 'bazi_result_view',
  /** 提交起名偏好 */
  PREFERENCE_SUBMIT: 'preference_submit',
  /** 起名生成成功 */
  NAMES_GENERATE_SUCCESS: 'names_generate_success',
  /** 起名生成失败 */
  NAMES_GENERATE_FAILED: 'names_generate_failed',
  /** 起名结果页展示 */
  RESULT_VIEW: 'result_view',
  /** 付费墙展示 */
  PAYWALL_VIEW: 'paywall_view',
  /** 点击解锁按钮 */
  UNLOCK_CLICK: 'unlock_click',
  /** 基础候选展示（knowledgeBacked=false） */
  BASIC_CANDIDATE_VIEW: 'basic_candidate_view',
  /** 知识库校验结果展示（knowledgeBacked=true） */
  KNOWLEDGE_BACKED_RESULT_VIEW: 'knowledge_backed_result_view',
  /** 校验警告展示 */
  VALIDATION_WARNING_VIEW: 'validation_warning_view',
  /** 提交测名 */
  TEST_NAME_SUBMIT: 'test_name_submit',
  /** 测名成功 */
  TEST_NAME_SUCCESS: 'test_name_success',
  /** 测名失败 */
  TEST_NAME_FAILED: 'test_name_failed',
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];
