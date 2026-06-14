/**
 * 天衍 - 跨页数据流转工具
 * 使用 localStorage 在起名/测名流程的各步骤间传递数据
 */

// ===== 类型定义 =====

export interface InputData {
  surname: string;
  gender: string;
  birthDate: string;
  birthTime: string;
  birthProvince?: string;
  birthCity?: string;
  unknownTime: boolean;
  isBorn: boolean;
}

export interface BaziData {
  pillars: {
    pillar: string;
    gan: string;
    zhi: string;
    ganWuxing: string;
    zhiWuxing: string;
    cangGan: string[];
  }[];
  wuxingPercent: Record<string, number>;
  dayMaster: string;
  dayMasterWuxing: string;
  strength: string;
  xiYong: string[];
  jiShen: string[];
  pattern: string;
}

export interface PreferenceData {
  charCount: 'single' | 'double';
  styles: string[];
  poemSources: string[];
  excludeChars: string;
  avoidHotNames: boolean;
  avoidHomophone: boolean;
}

export interface NameItem {
  surname: string;
  givenName: string;
  wuxing: string[];
  score: number;
  sancai: string;
  style: string;
  poem: string;
  poemSource: string;
  analysis?: string;
  xiYongMatch?: number;
  sancaiScore?: number;
  yinyunScore?: number;
  meaningScore?: number;
  repeatRisk?: string;
  homophoneRisk?: string;
}

export interface GenerateResult {
  analysis: string;
  names: NameItem[];
}

export interface TestNameInput {
  surname: string;
  givenName: string;
  gender?: string;
  birthDate?: string;
  birthTime?: string;
}

export interface CharClassicRef {
  source: string;
  quote: string;
  interpretation: string;
}

export interface CharAnalysis {
  char: string;
  pinyin: string;
  wuxing: string;
  strokes: number;
  structure: string;
  radical: string;
  meaning: string;
  classicRef?: CharClassicRef;
}

export interface WuxingBenefit {
  description: string;
  flow: string;
  xiyongAdvice: string;
}

export interface ToneInfo {
  char: string;
  tone: number;
  toneName: string;
  pingze: string;
}

export interface PhoneticAnalysis {
  tones: ToneInfo[];
  pingzePattern: string;
  pingzeEval: string;
  rhymeEval: string;
}

export interface HomophoneCheck {
  result: string;
  details: string;
  dialectNotes?: string;
}

export interface CharFrequency {
  char: string;
  freq: string;
}

export interface Suggestion {
  aspect: string;
  content: string;
}

export interface TestNameResult {
  surname: string;
  fullName: string;
  score: number;
  wuxingMatch: number;
  meaningDepth?: number;
  wugeScore?: number;
  sancaiConfig: string;
  yinyunScore: number;
  wuxing: Record<string, number>;
  nameWuxing: string | string[];
  matchConclusion: string;
  // 逐字解析
  characterAnalysis?: CharAnalysis[];
  // 五格
  wuge: { name: string; strokes: number; wx: string; luck: string; meaning?: string }[];
  // 五行补益路径
  wuxingBenefit?: WuxingBenefit;
  // 音韵详解
  phoneticAnalysis?: PhoneticAnalysis;
  // 谐音检测
  homophoneCheck?: HomophoneCheck;
  // 兼容旧字段
  tones?: { char: string; tone: number }[];
  homophone?: string;
  // 重名风险
  repeatRisk: number;
  repeatLevel: string;
  charFrequency?: CharFrequency[];
  // 热名检测
  hotName?: string;
  // 优化建议
  suggestions?: Suggestion[];
  // 总体评价
  overallComment?: string;
  // 兼容旧字段
  analysis?: string;
}

// ===== 存储键 =====

const KEYS = {
  INPUT: 'tianyan_input',
  BAZI: 'tianyan_bazi',
  PREFERENCE: 'tianyan_preference',
  NAMES: 'tianyan_names',
  TEST_INPUT: 'tianyan_test_input',
  TEST_RESULT: 'tianyan_test_result',
} as const;

// ===== 通用读写 =====

function read<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // localStorage 满了或不可用
  }
}

function remove(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// ===== 起名流程 =====

export function saveInput(data: InputData) { write(KEYS.INPUT, data); }
export function loadInput(): InputData | null { return read<InputData>(KEYS.INPUT); }

export function saveBazi(data: BaziData) { write(KEYS.BAZI, data); }
export function loadBazi(): BaziData | null { return read<BaziData>(KEYS.BAZI); }

export function savePreference(data: PreferenceData) { write(KEYS.PREFERENCE, data); }
export function loadPreference(): PreferenceData | null { return read<PreferenceData>(KEYS.PREFERENCE); }

export function saveNames(data: GenerateResult) { write(KEYS.NAMES, data); }
export function loadNames(): GenerateResult | null { return read<GenerateResult>(KEYS.NAMES); }

// ===== 测名流程 =====

export function saveTestInput(data: TestNameInput) { write(KEYS.TEST_INPUT, data); }
export function loadTestInput(): TestNameInput | null { return read<TestNameInput>(KEYS.TEST_INPUT); }

export function saveTestResult(data: TestNameResult) { write(KEYS.TEST_RESULT, data); }
export function loadTestResult(): TestNameResult | null { return read<TestNameResult>(KEYS.TEST_RESULT); }

// ===== 清理 =====

export function clearNamingFlow() {
  Object.values(KEYS).forEach(remove);
}
