/**
 * LLM 输出合规过滤模块
 * 对 AI 返回内容做后处理，过滤违规词汇
 */

// 合规黑名单：禁止出现的词汇（算命/改运/预测类）
const COMPLIANCE_BLACKLIST = [
  // 算命相关
  '算命', '算卦', '卜卦', '占卜', '卜算', '测字',
  // 改运相关
  '改运', '转运', '改命', '逆天改命', '化解', '破灾',
  // 运势预测
  '运势', '流年运势', '今年运势', '财运', '桃花', '事业运',
  '命中注定', '命理', '宿命',
  // 大师背书
  '大师', '师傅', '道长', '高人',
  // 其他违规
  '开光', '加持', '法事', '还愿', '许愿',
  '趋吉避凶', '消灾解难', '逢凶化吉',
];

// 替换映射：某些词用合规表述替换
const COMPLIANCE_REPLACEMENTS: Record<string, string> = {
  '命理': '传统命理学说',
  '命运': '人生发展',
  '命中注定': '顺其自然',
  '运势': '发展趋势',
  '改运': '调整',
  '转运': '转变',
};

/**
 * 过滤 LLM 输出中的违规词汇
 * @param text 原始文本
 * @returns 过滤后的文本
 */
export function filterCompliance(text: string): string {
  if (!text) return text;

  let filtered = text;

  // 先做替换
  for (const [word, replacement] of Object.entries(COMPLIANCE_REPLACEMENTS)) {
    filtered = filtered.replaceAll(word, replacement);
  }

  // 再移除剩余黑名单词汇
  for (const word of COMPLIANCE_BLACKLIST) {
    if (filtered.includes(word)) {
      filtered = filtered.replaceAll(word, '***');
    }
  }

  return filtered;
}

/**
 * 递归过滤对象中所有字符串值
 * @param obj 原始对象
 * @returns 过滤后的对象
 */
export function filterComplianceDeep<T>(obj: T): T {
  if (typeof obj === 'string') {
    return filterCompliance(obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => filterComplianceDeep(item)) as T;
  }

  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = filterComplianceDeep(value);
    }
    return result as T;
  }

  return obj;
}

/**
 * 检查文本是否包含违规词汇，返回违规词列表
 */
export function checkCompliance(text: string): string[] {
  const violations: string[] = [];
  for (const word of COMPLIANCE_BLACKLIST) {
    if (text.includes(word)) {
      violations.push(word);
    }
  }
  return violations;
}
