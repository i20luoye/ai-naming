import { checkCompliance } from '../../compliance';
import type { ClassicQuoteCard, GeneratedNameValidationResult, HanziKnowledgeCard } from '../schema';

export interface ScoreableGeneratedName {
  name?: string;
  givenName?: string;
  wuxing?: string[];
  poem?: string;
  poemSource?: string;
  poemSourceId?: string | null;
  sourceStatus?: string;
}

export interface ScoreGeneratedNamesInput<T extends ScoreableGeneratedName> {
  xiYong: string[];
  candidateChars: HanziKnowledgeCard[];
  classicQuotes: ClassicQuoteCard[];
  validation: GeneratedNameValidationResult<T>;
}

export type QualityLevel = '优选' | '稳妥' | '可参考' | '降级' | '不建议';
export type RiskLevel = 'low' | 'medium' | 'high';

export type ScoredGeneratedName<T extends ScoreableGeneratedName> = T & {
  qualityScore: number;
  qualityLevel: QualityLevel;
  qualityReasons: string[];
  riskLevel: RiskLevel;
};

export function scoreGeneratedNames<T extends ScoreableGeneratedName>(
  names: T[],
  input: ScoreGeneratedNamesInput<T>,
): Array<ScoredGeneratedName<T>> {
  const candidateMap = new Map(input.candidateChars.map((card) => [card.char, card]));
  const quoteMap = new Map(input.classicQuotes.map((quote) => [quote.id, quote]));

  return names
    .map((item) => {
      const givenName = item.name || item.givenName || '';
      const chars = Array.from(givenName);
      const issue = input.validation.invalidNames.find((invalid) => invalid.item === item);
      const qualityReasons: string[] = [];

      let score = 50;

      // 五行匹配权重适度提高（从 10/项 提升到 12/项，上限 24）
      const wuxingMatches = (item.wuxing || []).filter((wx) => input.xiYong.includes(wx)).length;
      score += Math.min(24, wuxingMatches * 12);
      if (wuxingMatches > 0) qualityReasons.push(`五行匹配 ${wuxingMatches} 项`);

      // 候选字命中更多时加分（从 22 提升到 28，且全命中额外奖励）
      const candidateMatches = chars.filter((char) => candidateMap.has(char)).length;
      const candidateRatio = chars.length > 0 ? candidateMatches / chars.length : 0;
      score += Math.round(candidateRatio * 28);
      if (candidateMatches === chars.length && chars.length > 0) {
        score += 4; // 全部命中候选字池额外奖励
      }
      if (candidateMatches > 0) qualityReasons.push(`候选字匹配 ${candidateMatches}/${chars.length}`);

      // 出处可信度权重适度提高
      const poemSourceId = item.poemSourceId ?? null;
      const poemSource = item.poemSource || '';
      const sourceStatus = item.sourceStatus || '';
      // 独立检测编造出处（不依赖 validation issue 对象引用匹配）
      const isFabricatedSource = (poemSourceId && !quoteMap.has(poemSourceId))
        || (!poemSourceId && !!poemSource && quoteMap.size > 0)
        || (quoteMap.size === 0 && !!poemSource);

      if (poemSourceId && quoteMap.has(poemSourceId)) {
        // poemSourceId 合法 → 强加分（从 14 提升到 18）
        score += 18;
        qualityReasons.push('出处通过 quoteId 校验');
      } else if (isFabricatedSource || issue?.fabricatedSource) {
        // 编造出处 → 严重扣分（从 -20 改为 -45，强制进入不建议区间）
        score -= 45;
        qualityReasons.push('编造出处，严重扣分');
      } else if (poemSource && !poemSourceId) {
        // 有 poemSource 但无 poemSourceId → 视为可疑出处
        score -= 30;
        qualityReasons.push('缺少 poemSourceId，出处可疑');
      } else if (sourceStatus === 'none' || (!poemSourceId && !poemSource)) {
        // sourceStatus none → 轻微扣分（从 -4 改为 -3，不直接 reject）
        score -= 3;
        qualityReasons.push('未绑定诗词出处（sourceStatus: none）');
      } else {
        score -= 4;
        qualityReasons.push('未绑定诗词出处');
      }

      const pinyinKnownCount = chars.filter((char) => candidateMap.get(char)?.pinyin).length;
      score += pinyinKnownCount === chars.length && chars.length > 0 ? 8 : 3;
      qualityReasons.push('完成基础读音检查');

      const riskTagCount = chars.flatMap((char) => candidateMap.get(char)?.riskTags || []).length;
      if (riskTagCount > 0) {
        score -= Math.min(12, riskTagCount * 4);
        qualityReasons.push('存在热名或用字风险');
      }

      const complianceViolations = checkCompliance([
        item.name,
        item.givenName,
        item.poem,
        item.poemSource,
      ].filter(Boolean).join(' '));
      if (complianceViolations.length > 0) {
        score -= 35;
        qualityReasons.push('存在合规风险');
      }

      if (issue?.severity === 'downgrade') {
        score -= 16;
        qualityReasons.push('校验结果建议降级');
      }
      if (issue?.severity === 'reject') {
        score -= 45;
        qualityReasons.push('校验结果不建议展示');
      }

      const qualityScore = Math.max(0, Math.min(100, Math.round(score)));
      const riskLevel = calcRiskLevel(qualityScore, issue?.severity, complianceViolations.length);

      return {
        ...item,
        qualityScore,
        qualityLevel: calcQualityLevel(qualityScore, issue?.severity),
        qualityReasons,
        riskLevel,
      };
    })
    .sort((a, b) => {
      // qualityScore < 65 的结果不得排在前列
      const aBelowThreshold = a.qualityScore < 65 ? 1 : 0;
      const bBelowThreshold = b.qualityScore < 65 ? 1 : 0;
      if (aBelowThreshold !== bBelowThreshold) {
        return aBelowThreshold - bBelowThreshold;
      }
      return b.qualityScore - a.qualityScore;
    });
}

function calcQualityLevel(score: number, severity?: string): QualityLevel {
  if (severity === 'reject') return '不建议';
  if (severity === 'downgrade') return '降级';
  if (score >= 88) return '优选';
  if (score >= 76) return '稳妥';
  if (score >= 60) return '可参考';
  return '不建议';
}

function calcRiskLevel(score: number, severity?: string, complianceViolationCount = 0): RiskLevel {
  if (severity === 'reject' || complianceViolationCount > 0 || score < 55) return 'high';
  if (severity === 'downgrade' || score < 76) return 'medium';
  return 'low';
}
