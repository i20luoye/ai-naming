import type { WuxingRuleCard } from '../schema';
import { WUXING_RULE_SOURCE } from '../sources';

export const WUXING_RULES: WuxingRuleCard[] = [
  { id: 'rule-jin', wuxing: '金', useFor: 'xiYong', summary: '金偏肃整、收束、清正。', namingAdvice: '用金属性字时宜表达清正、秩序、书卷，不夸大为现实结果。', source: WUXING_RULE_SOURCE },
  { id: 'rule-mu', wuxing: '木', useFor: 'xiYong', summary: '木偏生发、舒展、文雅。', namingAdvice: '用木属性字时宜表达成长、清芬、挺秀等传统文化意象。', source: WUXING_RULE_SOURCE },
  { id: 'rule-shui', wuxing: '水', useFor: 'xiYong', summary: '水偏润下、涵养、灵动。', namingAdvice: '用水属性字时宜表达清澈、涵养、润泽，避免承诺改运。', source: WUXING_RULE_SOURCE },
  { id: 'rule-huo', wuxing: '火', useFor: 'xiYong', summary: '火偏明朗、温暖、照耀。', namingAdvice: '用火属性字时宜表达光明、温煦、积极，不做命运预测。', source: WUXING_RULE_SOURCE },
  { id: 'rule-tu', wuxing: '土', useFor: 'xiYong', summary: '土偏承载、稳定、厚重。', namingAdvice: '用土属性字时宜表达安定、笃实、包容，保持文化参考口径。', source: WUXING_RULE_SOURCE },
  { id: 'rule-jin-avoid', wuxing: '金', useFor: 'jiShen', summary: '金过重时表达容易偏冷峻。', namingAdvice: '若金为需避免方向，可减少锋锐、肃杀意象，转向温润或书卷表达。', source: WUXING_RULE_SOURCE },
  { id: 'rule-mu-avoid', wuxing: '木', useFor: 'jiShen', summary: '木过重时表达可能偏散。', namingAdvice: '若木为需避免方向，可减少密集草木字，保留少量文雅意象即可。', source: WUXING_RULE_SOURCE },
  { id: 'rule-shui-avoid', wuxing: '水', useFor: 'jiShen', summary: '水过重时表达可能偏寒或漂浮。', namingAdvice: '若水为需避免方向，可减少寒江、霜雪等偏冷意象。', source: WUXING_RULE_SOURCE },
  { id: 'rule-huo-avoid', wuxing: '火', useFor: 'jiShen', summary: '火过重时表达可能偏燥烈。', namingAdvice: '若火为需避免方向，可减少炎、烈、灼等强烈字，选择温和明朗字。', source: WUXING_RULE_SOURCE },
  { id: 'rule-tu-balance', wuxing: '土', useFor: 'general', summary: '土可作承载与调和的中性意象。', namingAdvice: '土属性字适合表达安定、承载、笃实，但不应解释为现实保障。', source: WUXING_RULE_SOURCE },
];
