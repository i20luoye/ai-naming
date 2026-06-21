export interface GeneratedNameApiItem {
  name?: string;
  givenName?: string;
  wuxing?: string[];
  score?: number;
  sancai?: string;
  style?: string;
  poem?: string;
  poemSource?: string;
  /** 模型输出的出处卡 quoteId */
  poemSourceId?: string | null;
  /** 模型声明的出处状态：verified / none / fallback */
  sourceStatus?: string;
  wuxingAnalysis?: string;
  knowledgeBacked?: boolean;
  validationWarnings?: string[];
  qualityScore?: number;
  qualityLevel?: string;
  qualityReasons?: string[];
  riskLevel?: string;
  /** 标记该名字来自 reject 修复重试 */
  repairedFromReject?: boolean;
  /** 修复过程中产生的警告信息 */
  repairWarnings?: string[];
}

export interface GeneratedNameView {
  surname: string;
  given: string;
  fullName: string;
  wx: string[];
  style: string;
  source: string;
  meaning: string;
  poem: string;
  pinyin: string;
  score: number;
  matchCount: number;
  advantage: string;
  wxBenefit: string;
  sancai: string;
  rarity: { level: string; count: number; barPct: number };
  sourceType: 'api' | 'fallback';
  sourceLabel: string;
  knowledgeBacked?: boolean;
  validationWarnings?: string[];
  qualityScore?: number;
  qualityLevel?: string;
  qualityReasons?: string[];
  riskLevel?: string;
  poemSourceId?: string | null;
  sourceStatus?: string;
  repairedFromReject?: boolean;
  repairWarnings?: string[];
}

export const FALLBACK_RECOMMENDATION_LABEL = '基础推荐（AI 实时生成不可用时展示）';
/** knowledgeBacked=false 或 sourceStatus=fallback 时展示的轻量标签 */
export const BASIC_CANDIDATE_LABEL = '基础候选';
/** knowledgeBacked=false 时给用户的轻量提示语 */
export const BASIC_CANDIDATE_HINT = '该五行组合暂无充足典籍样例支撑，以下为基础候选参考';

export function parseGeneratedNamesContent(content: string): {
  ok: boolean;
  names: GeneratedNameApiItem[];
  raw?: string;
  error?: string;
} {
  const trimmed = content.trim();
  try {
    const jsonMatch = trimmed.match(/\[[\s\S]*\]/);
    const names = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(trimmed);
    return { ok: Array.isArray(names), names: Array.isArray(names) ? names : [], raw: content };
  } catch (e) {
    // 容错处理：LLM 响应可能因超时被截断，尝试提取已完成的 JSON 对象
    const recovered = recoverTruncatedJsonArray(trimmed);
    if (recovered.length > 0) {
      return { ok: true, names: recovered, raw: content };
    }
    return { ok: false, names: [], raw: content, error: (e as Error)?.message?.substring(0, 100) };
  }
}

/**
 * 从可能被截断的 LLM 输出中恢复已完成的 JSON 对象
 * 处理场景：LLM 超时导致 JSON 数组在中间被截断
 */
function recoverTruncatedJsonArray(content: string): GeneratedNameApiItem[] {
  const recovered: GeneratedNameApiItem[] = [];
  // 匹配完整的 JSON 对象（从 { 到匹配的 }）
  const objectRegex = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
  const matches = content.match(objectRegex);
  if (!matches) return recovered;

  for (const match of matches) {
    try {
      const obj = JSON.parse(match);
      if (obj && typeof obj === 'object' && (obj.name || obj.givenName)) {
        recovered.push(obj as GeneratedNameApiItem);
      }
    } catch {
      // 跳过无法解析的单个对象
    }
  }
  return recovered;
}

export function normalizeGeneratedNames(
  surname: string,
  names: GeneratedNameApiItem[],
  xiYong: string[] = [],
): GeneratedNameView[] {
  return names
    .map((item) => {
      const given = item.name || item.givenName || '';
      const wx = item.wuxing?.length ? item.wuxing : ['木', '水'];
      const score = clampScore(item.score);
      const matchCount = wx.filter((w) => xiYong.includes(w)).length;
      const meaning = item.wuxingAnalysis || item.poem || '结合五行、音韵和寓意生成的名字建议';
      // 判断是否为基础候选（knowledgeBacked=false 或 sourceStatus=fallback）
      const isBasicCandidate = item.knowledgeBacked === false || item.sourceStatus === 'fallback';

      return {
        surname,
        given,
        fullName: surname + given,
        wx,
        style: item.style || '雅正',
        source: item.poemSource || (isBasicCandidate ? '基础候选参考' : 'AI 文化参考'),
        meaning,
        poem: item.poem || meaning,
        pinyin: '',
        score,
        matchCount,
        advantage: `${item.sancai || '综合'} · AI 实时生成`,
        wxBenefit: item.wuxingAnalysis || '结合喜用方向综合分析',
        sancai: item.sancai || '中',
        rarity: calcRarity(given, surname),
        sourceType: 'api' as const,
        // 基础候选使用专用 label，避免被误读为"失败"或"0 分正式质量分"
        sourceLabel: isBasicCandidate ? BASIC_CANDIDATE_LABEL : 'AI 实时生成',
        knowledgeBacked: item.knowledgeBacked,
        validationWarnings: item.validationWarnings,
        qualityScore: item.qualityScore,
        // 基础候选统一展示为「基础候选」level，不展示 0 分
        qualityLevel: isBasicCandidate ? BASIC_CANDIDATE_LABEL : item.qualityLevel,
        qualityReasons: item.qualityReasons,
        riskLevel: item.riskLevel,
        poemSourceId: item.poemSourceId,
        sourceStatus: item.sourceStatus,
        repairedFromReject: item.repairedFromReject,
        repairWarnings: item.repairWarnings,
      };
    })
    .filter((item) => item.given.trim().length > 0);
}

export function markFallbackName<T extends { given: string; surname: string; score: number; rarity?: GeneratedNameView['rarity'] }>(
  item: T,
): T & {
  sourceType: 'fallback';
  sourceLabel: string;
  rarity: GeneratedNameView['rarity'];
} {
  return {
    ...item,
    sourceType: 'fallback',
    sourceLabel: FALLBACK_RECOMMENDATION_LABEL,
    rarity: item.rarity || calcRarity(item.given, item.surname),
  };
}

function clampScore(score: number | undefined): number {
  if (!Number.isFinite(score)) return 85;
  return Math.min(95, Math.max(60, Math.round(score as number)));
}

function calcRarity(given: string, surname: string) {
  const charFreq: Record<string, number> = {
    涵: 0.55, 泽: 0.60, 清: 0.50, 源: 0.40, 沁: 0.20, 兰: 0.45, 潆: 0.04, 月: 0.55, 澄: 0.25, 宁: 0.40,
    梓: 0.35, 桐: 0.22, 栩: 0.15, 然: 0.45, 芷: 0.22, 萱: 0.30, 柯: 0.18, 远: 0.40, 荟: 0.08, 蔚: 0.15,
    瑾: 0.28, 瑜: 0.30, 锦: 0.40, 瑞: 0.50, 钰: 0.30, 铭: 0.35, 钦: 0.12, 铮: 0.15, 书: 0.40, 晏: 0.10,
    毓: 0.12, 辰: 0.50, 煜: 0.35, 昕: 0.30, 晖: 0.22, 煦: 0.08, 风: 0.55, 宇: 0.60, 坤: 0.30, 垣: 0.03,
    培: 0.25, 均: 0.30, 平: 0.50, 如: 0.35,
  };
  const surnameFreq: Record<string, number> = { 张: 0.9, 王: 0.9, 李: 0.85, 刘: 0.8, 陈: 0.8, 杨: 0.7, 赵: 0.7, 黄: 0.65, 周: 0.65, 吴: 0.6 };

  const f1 = charFreq[given.charAt(0)] ?? 0.3;
  const f2 = charFreq[given.charAt(1)] ?? 0.3;
  const combined = (f1 + f2) / 2;
  const sf = surnameFreq[surname] || 0.5;
  const rate = combined * sf;

  if (rate < 0.1) return { level: '极低', count: Math.round(rate * 500) + 10, barPct: 8 };
  if (rate < 0.2) return { level: '低', count: Math.round(rate * 3000) + 50, barPct: 20 };
  if (rate < 0.35) return { level: '中', count: Math.round(rate * 12000) + 200, barPct: 40 };
  if (rate < 0.5) return { level: '较高', count: Math.round(rate * 35000) + 1000, barPct: 65 };
  return { level: '极高', count: Math.round(rate * 80000) + 5000, barPct: 88 };
}
