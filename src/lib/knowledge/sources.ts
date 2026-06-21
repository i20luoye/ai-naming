import type { SourceRef } from './schema';

export const SAMPLE_HANZI_SOURCE: SourceRef = {
  id: 'sample-hanzi-manual-v1',
  title: '天衍 MVP 常用起名汉字样例集',
  type: 'sample',
  note: '人工整理的最小样例数据，仅用于 MVP 知识约束，不代表完整字库。',
};

export const SHIJING_SOURCE: SourceRef = {
  id: 'shijing',
  title: '《诗经》',
  type: 'classic',
  dynasty: '先秦',
};

export const CHUCI_SOURCE: SourceRef = {
  id: 'chuci',
  title: '《楚辞》',
  type: 'classic',
  dynasty: '战国至汉',
};

export const TANG_POETRY_SOURCE: SourceRef = {
  id: 'tang-poetry-sample',
  title: '唐诗样例',
  type: 'classic',
  dynasty: '唐',
  note: '少量公开经典诗句样例，不是唐诗全库。',
};

export const SONG_CI_SOURCE: SourceRef = {
  id: 'song-ci-sample',
  title: '宋词样例',
  type: 'classic',
  dynasty: '宋',
  note: '少量公开经典词句样例，不是宋词全库。',
};

export const WUXING_RULE_SOURCE: SourceRef = {
  id: 'wuxing-rule-sample-v1',
  title: '五行取名解释规则样例',
  type: 'rule',
  note: '用于生成中性解释文案的 MVP 规则，不用于命运预测。',
};
