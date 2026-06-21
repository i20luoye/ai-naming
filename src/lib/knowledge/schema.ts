export type Wuxing = '金' | '木' | '水' | '火' | '土';
export type GenderFit = 'male' | 'female' | 'neutral';

export interface SourceRef {
  id: string;
  title: string;
  type: 'sample' | 'classic' | 'rule';
  dynasty?: string;
  author?: string;
  chapter?: string;
  note?: string;
}

export interface HanziKnowledgeCard {
  id: string;
  char: string;
  pinyin: string;
  wuxing: Wuxing;
  meaning: string;
  genderFit: GenderFit[];
  styleTags: string[];
  riskTags: string[];
  source: SourceRef;
}

export interface ClassicQuoteCard {
  id: string;
  quote: string;
  source: SourceRef;
  usableChars: string[];
  styleTags: string[];
  note: string;
}

export interface WuxingRuleCard {
  id: string;
  wuxing: Wuxing;
  useFor: 'xiYong' | 'jiShen' | 'general';
  summary: string;
  namingAdvice: string;
  source: SourceRef;
}

export interface NamingPromptContext {
  surname: string;
  gender?: string;
  xiYong: string[];
  jiShen: string[];
  preferences?: {
    styles?: string[];
    poemSources?: string[];
    excludeChars?: string[] | string;
    charCount?: string;
  };
  candidateChars: HanziKnowledgeCard[];
  classicQuotes: ClassicQuoteCard[];
  complianceRules: string[];
}

export interface GeneratedNameValidationIssue<T = unknown> {
  item: T;
  name: string;
  reasons: string[];
  severity: 'warning' | 'downgrade' | 'reject';
  /** 标记为编造出处（poemSourceId 不合法但 poemSource 声称有出处） */
  fabricatedSource?: boolean;
}

export interface GeneratedNameValidationResult<T = unknown> {
  knowledgeBacked: boolean;
  validNames: T[];
  invalidNames: GeneratedNameValidationIssue<T>[];
  warnings: string[];
  downgrades: string[];
  rejects: string[];
  /** 被识别为编造出处的名字数量 */
  fabricatedSourceCount: number;
}

/** 模型输出中出处状态：verified 表示已通过 quoteId 校验；none 表示无出处但不视为编造；fallback 表示知识层无可用候选/出处，仅作基础候选展示 */
export type SourceStatus = 'verified' | 'none' | 'fallback';

/** 修复来源标记 */
export interface RepairMarker {
  repairedFromReject: boolean;
  repairWarnings: string[];
}
