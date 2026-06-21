import { checkCompliance } from '../../compliance';
import type { ClassicQuoteCard, GeneratedNameValidationResult, HanziKnowledgeCard } from '../schema';

export interface GeneratedNameLike {
  name?: string;
  givenName?: string;
  poem?: string;
  poemSource?: string;
  /** 模型输出的出处卡 quoteId */
  poemSourceId?: string | null;
  /** 模型声明的出处状态：verified / none */
  sourceStatus?: string;
  wuxingAnalysis?: string;
}

export interface ValidateGeneratedNamesInput {
  candidateChars: HanziKnowledgeCard[];
  classicQuotes: ClassicQuoteCard[];
  complianceTerms?: string[];
  /** 姓氏字符，验证时允许出现在名字中（避免复姓/单姓字符被误判为候选字池外） */
  surname?: string;
}

export function validateGeneratedNames<T extends GeneratedNameLike>(
  names: T[],
  input: ValidateGeneratedNamesInput,
): GeneratedNameValidationResult<T> {
  const candidateSet = new Set(input.candidateChars.map((card) => card.char));
  // quoteId → source.title 映射，用于校验 poemSourceId 和还原 poemSource
  const quoteMap = new Map(input.classicQuotes.map((quote) => [quote.id, quote]));
  const quoteIdSet = new Set(quoteMap.keys());
  const surnameChars = input.surname ? new Set(Array.from(input.surname)) : new Set<string>();
  const validNames: T[] = [];
  const invalidNames: GeneratedNameValidationResult<T>['invalidNames'] = [];
  const warnings: string[] = [];
  const downgrades: string[] = [];
  const rejects: string[] = [];
  let fabricatedSourceCount = 0;

  for (const item of names) {
    const givenName = item.name || item.givenName || '';
    const warningReasons: string[] = [];
    const downgradeReasons: string[] = [];
    const rejectReasons: string[] = [];
    let fabricatedSource = false;

    if (!givenName || !Array.isArray(Array.from(givenName)) || Array.from(givenName).length === 0) {
      rejectReasons.push('输出结构不完整：缺少名字');
    }

    if (candidateSet.size > 0) {
      // 姓氏字符允许出现，不视为候选字池外
      const outsideChars = Array.from(givenName).filter((char) => !candidateSet.has(char) && !surnameChars.has(char));
      const insideChars = Array.from(givenName).filter((char) => candidateSet.has(char));
      if (givenName && insideChars.length === 0 && outsideChars.length > 0) {
        // 名字完全不包含候选字池内字（排除姓氏字符后）
        rejectReasons.push('名字完全不包含候选字池内字');
      } else if (outsideChars.length > 0) {
        downgradeReasons.push(`名字包含候选字池外用字：${Array.from(new Set(outsideChars)).join('、')}`);
      }
    }

    // 出处校验：优先用 poemSourceId / quoteId 校验
    const poemSourceId = item.poemSourceId ?? null;
    const poemSource = item.poemSource || '';
    const sourceStatus = item.sourceStatus || '';

    if (quoteIdSet.size > 0) {
      if (poemSourceId && quoteIdSet.has(poemSourceId)) {
        // poemSourceId 合法：校验 poemSource 是否与对应出处卡一致
        const matchedQuote = quoteMap.get(poemSourceId);
        if (matchedQuote && poemSource && poemSource !== matchedQuote.source.title) {
          // poemSourceId 合法但 poemSource 文本不一致 → 降级（不视为编造，但需修正）
          downgradeReasons.push(`poemSource 与 poemSourceId 对应出处不一致：${poemSource}`);
        }
        if (!poemSource) {
          // poemSourceId 合法但 poemSource 为空 → 自动补全提示
          warningReasons.push('poemSourceId 合法但缺少 poemSource 文本');
        }
      } else if (poemSourceId && !quoteIdSet.has(poemSourceId)) {
        // poemSourceId 不在给定出处池 → 编造出处
        fabricatedSource = true;
        fabricatedSourceCount += 1;
        rejectReasons.push(`poemSourceId 不在给定出处池：${poemSourceId}`);
      } else if (!poemSourceId && poemSource) {
        // poemSourceId 为空但 poemSource 声称有出处 → 编造出处
        fabricatedSource = true;
        fabricatedSourceCount += 1;
        rejectReasons.push(`缺少 poemSourceId 但 poemSource 声称有出处：${poemSource}`);
      } else if (!poemSourceId && !poemSource) {
        // 无出处：sourceStatus 为 none 时不视为编造，但给 warning
        if (sourceStatus === 'none') {
          warningReasons.push('无诗词出处（sourceStatus: none），建议仅作无出处候选展示');
        } else {
          warningReasons.push('缺少诗词出处，建议仅作无出处候选展示');
        }
      }
    } else if (poemSource) {
      // 没有给定出处卡但模型声称有出处 → 编造出处
      fabricatedSource = true;
      fabricatedSourceCount += 1;
      rejectReasons.push(`无给定出处卡但 poemSource 声称有出处：${poemSource}`);
    }

    const complianceText = [
      item.name,
      item.givenName,
      item.poem,
      item.poemSource,
      item.wuxingAnalysis,
    ].filter(Boolean).join(' ');
    const violations = [
      ...checkCompliance(complianceText),
      ...(input.complianceTerms || []).filter((term) => complianceText.includes(term)),
    ];
    if (violations.length > 0) {
      rejectReasons.push(`包含合规禁词：${Array.from(new Set(violations)).join('、')}`);
    }

    const reasons = [...rejectReasons, ...downgradeReasons, ...warningReasons];
    const nameLabel = givenName || '未命名';
    warnings.push(...warningReasons.map((reason) => `${nameLabel}：${reason}`));
    downgrades.push(...downgradeReasons.map((reason) => `${nameLabel}：${reason}`));
    rejects.push(...rejectReasons.map((reason) => `${nameLabel}：${reason}`));

    const severity = rejectReasons.length > 0
      ? 'reject'
      : downgradeReasons.length > 0
        ? 'downgrade'
        : 'warning';

    if (reasons.length > 0) {
      if (severity === 'warning') {
        validNames.push(item);
      } else {
        invalidNames.push({ item, name: givenName, reasons, severity, fabricatedSource });
      }
    } else {
      validNames.push(item);
    }
  }

  return {
    knowledgeBacked: input.candidateChars.length > 0,
    validNames,
    invalidNames,
    warnings,
    downgrades,
    rejects,
    fabricatedSourceCount,
  };
}
