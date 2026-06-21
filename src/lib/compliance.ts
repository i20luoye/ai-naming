/**
 * LLM 输出合规过滤模块
 * 对 AI 返回内容做后处理，过滤违规词汇
 */

const COMPLIANCE_REPLACEMENTS: Record<string, string> = {
  命理: '传统姓名文化',
  命运: '人生发展',
  命中注定: '顺其自然',
  运势: '发展走势',
  流年运势: '阶段参考',
  今年运势: '阶段参考',
  财运: '财富观念',
  事业运: '职业发展参考',
  改运: '调整表达',
  转运: '转换表达',
  改命: '调整表达',
  大富大贵: '积极寓意',
};

const COMPLIANCE_BLOCK_TERMS = [
  '逆天改命', '趋吉避凶', '消灾解难', '逢凶化吉',
  '算命', '算卦', '卜卦', '占卜', '卜算', '测字',
  '化解', '破灾', '桃花', '宿命',
  '大师', '师傅', '道长', '高人',
  '开光', '加持', '法事', '还愿', '许愿',
];

const COMPLIANCE_BLACKLIST = [
  ...Object.keys(COMPLIANCE_REPLACEMENTS),
  ...COMPLIANCE_BLOCK_TERMS,
];

const BLOCK_REPLACEMENT = '文化参考';

/**
 * 过滤 LLM 输出中的违规词汇
 * @param text 原始文本
 * @returns 过滤后的文本
 */
export function filterCompliance(text: string): string {
  if (!text) return text;

  let filtered = text;

  const replacements = Object.entries(COMPLIANCE_REPLACEMENTS)
    .sort(([a], [b]) => b.length - a.length);
  const blockTerms = [...COMPLIANCE_BLOCK_TERMS].sort((a, b) => b.length - a.length);

  for (const [word, replacement] of replacements) {
    filtered = filtered.replaceAll(word, replacement);
  }

  for (const word of blockTerms) {
    filtered = filtered.replaceAll(word, BLOCK_REPLACEMENT);
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
