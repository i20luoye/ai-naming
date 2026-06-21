import test from 'node:test';
import assert from 'node:assert/strict';

import { filterChars } from './knowledge/retrieval/filter-chars';
import { searchClassics } from './knowledge/retrieval/search-classics';
import { buildNamingPrompt } from './knowledge/prompt/build-naming-prompt';
import { validateGeneratedNames } from './knowledge/validation/validate-generated-names';
import { scoreGeneratedNames } from './knowledge/scoring/score-generated-names';
import { HANZI_SAMPLE } from './knowledge/characters/hanzi-sample';
import { CLASSIC_QUOTES } from './knowledge/classics/poetry-sample';
import { WUXING_RULES } from './knowledge/bazi/wuxing-rules';
import { filterCompliance } from './compliance';
import { normalizeGeneratedNames, BASIC_CANDIDATE_LABEL, BASIC_CANDIDATE_HINT } from './name-generation';

test('knowledge sample pack has MVP quality scale with explicit sources', () => {
  assert.ok(HANZI_SAMPLE.length >= 80);
  assert.ok(HANZI_SAMPLE.length <= 100);
  assert.ok(CLASSIC_QUOTES.length >= 40);
  assert.ok(CLASSIC_QUOTES.length <= 50);
  assert.ok(WUXING_RULES.length >= 10);
  assert.ok(HANZI_SAMPLE.every((card) => card.source.type === 'sample' && card.source.note?.includes('MVP')));
  assert.ok(CLASSIC_QUOTES.every((quote) => quote.source.type === 'classic'));
  assert.ok(WUXING_RULES.every((rule) => rule.source.type === 'rule' && rule.source.note?.includes('MVP')));
});

test('filterChars selects characters by xiYong and filters risks', () => {
  const chars = filterChars({
    xiYong: ['水'],
    gender: 'female',
    styleTags: ['清雅'],
    excludeChars: ['涵'],
    blockedRiskTags: ['overused'],
  });

  assert.ok(chars.length > 0);
  assert.ok(chars.every((card) => card.wuxing === '水'));
  assert.ok(chars.every((card) => card.char !== '涵'));
  assert.ok(chars.every((card) => !card.riskTags.includes('overused')));
});

test('searchClassics retrieves quotes by source preference and usable characters', () => {
  const quotes = searchClassics({
    sourcePreferences: ['诗经'],
    styleTags: ['清雅'],
    usableChars: ['清', '扬'],
  });

  assert.ok(quotes.length > 0);
  assert.ok(quotes.every((quote) => quote.source.title.includes('诗经')));
  assert.ok(quotes.every((quote) => quote.usableChars.some((char) => ['清', '扬'].includes(char))));
});

test('searchClassics supports Tang poetry source preference labels', () => {
  const quotes = searchClassics({
    sourcePreferences: ['唐诗'],
    usableChars: ['清'],
  });

  assert.ok(quotes.length > 0);
  assert.ok(quotes.every((quote) => quote.source.dynasty === '唐'));
});

test('searchClassics can retrieve shijing chuci tang and song samples', () => {
  for (const source of ['诗经', '楚辞', '唐诗', '宋词']) {
    const quotes = searchClassics({ sourcePreferences: [source], limit: 20 });
    assert.ok(quotes.length > 0, `${source} should have matches`);
  }
});

test('buildNamingPrompt includes candidate characters and classic quote constraints', () => {
  const candidateChars = HANZI_SAMPLE.filter((card) => ['清', '扬'].includes(card.char));
  const classicQuotes = CLASSIC_QUOTES.filter((quote) => quote.id === 'shijing-qingyang');
  const prompt = buildNamingPrompt({
    surname: '林',
    gender: 'female',
    xiYong: ['水'],
    jiShen: ['火'],
    preferences: { styles: ['清雅'], poemSources: ['诗经'], excludeChars: [] },
    candidateChars,
    classicQuotes,
    complianceRules: ['保持传统文化参考，不做命运预测'],
  });

  assert.match(prompt.systemPrompt, /只能优先使用候选字/);
  assert.match(prompt.userPrompt, /清\(水\)/);
  assert.match(prompt.userPrompt, /《诗经/);
  // 新增：prompt 必须包含 quoteId 和 sourceStatus 约束
  assert.match(prompt.userPrompt, /quoteId=/);
  assert.match(prompt.systemPrompt, /poemSourceId/);
  assert.match(prompt.systemPrompt, /sourceStatus/);
  assert.equal(prompt.context.candidateChars.length, 2);
  assert.equal(prompt.context.classicQuotes.length, 1);
});

test('validateGeneratedNames passes when model outputs valid quoteId', () => {
  const candidateChars = HANZI_SAMPLE.filter((card) => ['清', '扬'].includes(card.char));
  const classicQuotes = CLASSIC_QUOTES.filter((quote) => quote.id === 'shijing-qingyang');
  const result = validateGeneratedNames(
    [{
      name: '清扬',
      poemSourceId: 'shijing-qingyang',
      poemSource: '《诗经·郑风·野有蔓草》',
      poem: '有美一人，清扬婉兮',
      sourceStatus: 'verified',
      wuxingAnalysis: '传统文化参考',
    }],
    {
      candidateChars,
      classicQuotes,
      complianceTerms: ['算命', '改运'],
    },
  );

  assert.equal(result.validNames.length, 1);
  assert.equal(result.invalidNames.length, 0);
  assert.equal(result.fabricatedSourceCount, 0);
});

test('validateGeneratedNames detects fabricated poem sources by invalid poemSourceId', () => {
  const candidateChars = HANZI_SAMPLE.filter((card) => ['清', '扬'].includes(card.char));
  const classicQuotes = CLASSIC_QUOTES.filter((quote) => quote.id === 'shijing-qingyang');
  const result = validateGeneratedNames(
    [{
      name: '清扬',
      poemSourceId: 'fabricated-id-xxx',
      poemSource: '《不存在诗集》',
      poem: '清扬婉兮',
      wuxingAnalysis: '传统文化参考',
    }],
    {
      candidateChars,
      classicQuotes,
      complianceTerms: ['算命', '改运'],
    },
  );

  assert.equal(result.validNames.length, 0);
  assert.equal(result.invalidNames.length, 1);
  assert.ok(result.invalidNames[0].reasons.some((reason) => reason.includes('poemSourceId 不在给定出处池')));
  assert.equal(result.invalidNames[0].severity, 'reject');
  assert.equal(result.invalidNames[0].fabricatedSource, true);
  assert.equal(result.fabricatedSourceCount, 1);
});

test('validateGeneratedNames detects fabricated source when poemSource exists without poemSourceId', () => {
  const candidateChars = HANZI_SAMPLE.filter((card) => ['清', '扬'].includes(card.char));
  const classicQuotes = CLASSIC_QUOTES.filter((quote) => quote.id === 'shijing-qingyang');
  const result = validateGeneratedNames(
    [{
      name: '清扬',
      poemSource: '《诗经·郑风·野有蔓草》',
      poem: '有美一人，清扬婉兮',
      wuxingAnalysis: '传统文化参考',
    }],
    {
      candidateChars,
      classicQuotes,
      complianceTerms: ['算命', '改运'],
    },
  );

  assert.equal(result.validNames.length, 0);
  assert.equal(result.invalidNames.length, 1);
  assert.ok(result.invalidNames[0].reasons.some((reason) => reason.includes('缺少 poemSourceId')));
  assert.equal(result.invalidNames[0].severity, 'reject');
  assert.equal(result.invalidNames[0].fabricatedSource, true);
});

test('validateGeneratedNames treats sourceStatus none as warning not fabricated source', () => {
  const candidateChars = HANZI_SAMPLE.filter((card) => ['清', '扬'].includes(card.char));
  const classicQuotes = CLASSIC_QUOTES.filter((quote) => quote.id === 'shijing-qingyang');
  const result = validateGeneratedNames(
    [{
      name: '清扬',
      poemSourceId: null,
      poemSource: '',
      poem: '',
      sourceStatus: 'none',
      wuxingAnalysis: '传统文化参考',
    }],
    {
      candidateChars,
      classicQuotes,
      complianceTerms: ['算命', '改运'],
    },
  );

  // sourceStatus none 不算 fabricated source，进入 validNames（warning 级别）
  assert.equal(result.validNames.length, 1);
  assert.equal(result.invalidNames.length, 0);
  assert.equal(result.fabricatedSourceCount, 0);
  assert.ok(result.warnings.some((warning) => warning.includes('sourceStatus: none')));
});

test('validateGeneratedNames detects characters outside candidate pool', () => {
  const candidateChars = HANZI_SAMPLE.filter((card) => ['清', '扬'].includes(card.char));
  const classicQuotes = CLASSIC_QUOTES.filter((quote) => quote.id === 'shijing-qingyang');
  const result = validateGeneratedNames(
    [{ name: '清霄', poemSourceId: null, poemSource: '', sourceStatus: 'none', poem: '' }],
    {
      candidateChars,
      classicQuotes,
      complianceTerms: ['算命', '改运'],
    },
  );

  assert.ok(result.invalidNames[0].reasons.some((reason) => reason.includes('候选字池')));
});

test('validateGeneratedNames allows surname chars in name without flagging as outside', () => {
  const candidateChars = HANZI_SAMPLE.filter((card) => ['远', '衡'].includes(card.char));
  const classicQuotes = CLASSIC_QUOTES.filter((quote) => quote.id === 'shijing-qingyang');
  const result = validateGeneratedNames(
    [{ name: '尉迟远衡', poemSourceId: null, poemSource: '', sourceStatus: 'none', poem: '' }],
    {
      candidateChars,
      classicQuotes,
      complianceTerms: [],
      surname: '尉迟',
    },
  );

  // 尉、迟 是姓氏字符，不应被标记为候选字池外
  assert.ok(result.downgrades.every((d) => !d.includes('尉') && !d.includes('迟')));
});

test('validateGeneratedNames classifies warning downgrade and reject severities', () => {
  const candidateChars = HANZI_SAMPLE.filter((card) => ['清', '扬'].includes(card.char));
  const classicQuotes = CLASSIC_QUOTES.filter((quote) => quote.id === 'shijing-qingyang');
  const result = validateGeneratedNames(
    [
      // 合法 quoteId → valid
      { name: '清扬', poemSourceId: 'shijing-qingyang', poemSource: '《诗经·郑风·野有蔓草》', poem: '有美一人，清扬婉兮', sourceStatus: 'verified', wuxingAnalysis: '传统文化参考' },
      // sourceStatus none → warning → valid
      { name: '清扬', poemSourceId: null, poemSource: '', poem: '', sourceStatus: 'none', wuxingAnalysis: '传统文化参考' },
      // 候选字池外 → downgrade
      { name: '清霄', poemSourceId: null, poemSource: '', poem: '', sourceStatus: 'none', wuxingAnalysis: '传统文化参考' },
      // 编造出处 + 合规禁词 → reject
      { name: '星河', poemSourceId: 'fabricated', poemSource: '《不存在诗集》', poem: '星河灿烂', wuxingAnalysis: '可以改运' },
      // 结构不完整 → reject
      { poemSourceId: null, poemSource: '', sourceStatus: 'none', poem: '' },
    ],
    { candidateChars, classicQuotes, complianceTerms: ['改运'] },
  );

  assert.equal(result.validNames.length, 2);
  assert.equal(result.invalidNames.length, 3);
  assert.ok(result.warnings.some((warning) => warning.includes('sourceStatus: none')));
  assert.ok(result.downgrades.some((warning) => warning.includes('候选字池外用字')));
  assert.ok(result.rejects.some((warning) => warning.includes('poemSourceId 不在给定出处池')));
  assert.ok(result.rejects.some((warning) => warning.includes('合规禁词')));
  assert.ok(result.rejects.some((warning) => warning.includes('结构不完整')));
  assert.ok(result.fabricatedSourceCount >= 1);
});

test('scoreGeneratedNames returns stable quality fields and ordering signals', () => {
  const candidateChars = HANZI_SAMPLE.filter((card) => ['清', '扬'].includes(card.char));
  const classicQuotes = CLASSIC_QUOTES.filter((quote) => quote.id === 'shijing-qingyang');
  const validation = validateGeneratedNames(
    [
      { name: '清扬', poemSourceId: 'shijing-qingyang', poemSource: '《诗经·郑风·野有蔓草》', poem: '有美一人，清扬婉兮', sourceStatus: 'verified', wuxing: ['水', '火'] },
      { name: '清霄', poemSourceId: null, poemSource: '', sourceStatus: 'none', poem: '', wuxing: ['水', '水'] },
    ],
    { candidateChars, classicQuotes, complianceTerms: ['改运'] },
  );
  const scored = scoreGeneratedNames(
    [
      { name: '清扬', poemSourceId: 'shijing-qingyang', poemSource: '《诗经·郑风·野有蔓草》', poem: '有美一人，清扬婉兮', sourceStatus: 'verified', wuxing: ['水', '火'] },
      { name: '清霄', poemSourceId: null, poemSource: '', sourceStatus: 'none', poem: '', wuxing: ['水', '水'] },
    ],
    { xiYong: ['水'], candidateChars, classicQuotes, validation },
  );

  assert.equal(scored[0].name, '清扬');
  assert.ok(scored[0].qualityScore > scored[1].qualityScore);
  assert.match(scored[0].qualityLevel, /优选|稳妥|可参考/);
  assert.ok(scored[0].qualityReasons.length > 0);
  assert.ok(['low', 'medium', 'high'].includes(scored[0].riskLevel));
});

test('scoreGeneratedNames heavily penalizes fabricated source', () => {
  const candidateChars = HANZI_SAMPLE.filter((card) => ['清', '扬'].includes(card.char));
  const classicQuotes = CLASSIC_QUOTES.filter((quote) => quote.id === 'shijing-qingyang');
  const validation = validateGeneratedNames(
    [
      { name: '清扬', poemSourceId: 'fabricated-xxx', poemSource: '《伪造》', poem: '伪造', sourceStatus: 'verified', wuxing: ['水', '火'] },
    ],
    { candidateChars, classicQuotes, complianceTerms: [] },
  );
  const scored = scoreGeneratedNames(
    [
      { name: '清扬', poemSourceId: 'fabricated-xxx', poemSource: '《伪造》', poem: '伪造', sourceStatus: 'verified', wuxing: ['水', '火'] },
    ],
    { xiYong: ['水'], candidateChars, classicQuotes, validation },
  );

  // 编造出处严重扣分，qualityScore 应该很低
  assert.ok(scored[0].qualityScore < 65, `expected < 65, got ${scored[0].qualityScore}`);
  assert.equal(scored[0].qualityLevel, '不建议');
  assert.ok(scored[0].qualityReasons.some((r) => r.includes('编造出处')));
});

test('scoreGeneratedNames does not rank qualityScore < 65 at top', () => {
  const candidateChars = HANZI_SAMPLE.filter((card) => ['清', '扬'].includes(card.char));
  const classicQuotes = CLASSIC_QUOTES.filter((quote) => quote.id === 'shijing-qingyang');
  const names = [
    { name: '清扬', poemSourceId: 'shijing-qingyang', poemSource: '《诗经·郑风·野有蔓草》', poem: '有美一人，清扬婉兮', sourceStatus: 'verified', wuxing: ['水', '火'] },
    { name: '清扬', poemSourceId: 'fabricated-xxx', poemSource: '《伪造》', poem: '伪造', sourceStatus: 'verified', wuxing: ['水', '火'] },
  ];
  const validation = validateGeneratedNames(names, { candidateChars, classicQuotes, complianceTerms: [] });
  const scored = scoreGeneratedNames(names, { xiYong: ['水'], candidateChars, classicQuotes, validation });

  // qualityScore < 65 的结果不得排在前列
  assert.ok(scored[0].qualityScore >= 65, `top score should be >= 65, got ${scored[0].qualityScore}`);
  // fabricated source 的结果应该排在后面
  const fabricatedIndex = scored.findIndex((s) => s.qualityScore < 65);
  const validIndex = scored.findIndex((s) => s.qualityScore >= 65);
  assert.ok(fabricatedIndex > validIndex, 'fabricated source should rank after valid source');
});

test('normalized generated names keep existing fields and preserve knowledge quality metadata', () => {
  const [name] = normalizeGeneratedNames('林', [
    {
      name: '清扬',
      wuxing: ['水', '火'],
      poemSource: '《诗经·郑风·野有蔓草》',
      poemSourceId: 'shijing-qingyang',
      sourceStatus: 'verified',
      qualityScore: 91,
      qualityLevel: '优选',
      qualityReasons: ['出处可信'],
      riskLevel: 'low',
      knowledgeBacked: true,
      validationWarnings: ['缺少更多出处说明'],
      repairedFromReject: true,
      repairWarnings: ['修复提示'],
    },
  ]);

  assert.equal(name.fullName, '林清扬');
  assert.equal(name.sourceType, 'api');
  assert.equal(name.knowledgeBacked, true);
  assert.equal(name.qualityScore, 91);
  assert.deepEqual(name.validationWarnings, ['缺少更多出处说明']);
  assert.equal(name.poemSourceId, 'shijing-qingyang');
  assert.equal(name.sourceStatus, 'verified');
  assert.equal(name.repairedFromReject, true);
  assert.deepEqual(name.repairWarnings, ['修复提示']);
});

test('compliance filtering still replaces restricted wording', () => {
  assert.equal(filterCompliance('不要宣称名字可以改运'), '不要宣称名字可以调整表达');
});

test('normalizeGeneratedNames marks knowledgeBacked=false as basic candidate with fallback label', () => {
  const [name] = normalizeGeneratedNames('林', [
    {
      name: '清扬',
      wuxing: ['水', '火'],
      poemSource: '',
      poemSourceId: null,
      sourceStatus: 'fallback',
      qualityScore: 0,
      qualityLevel: '不建议',
      knowledgeBacked: false,
      validationWarnings: ['当前知识样例暂无充足典籍支撑，已提供基础候选参考'],
    },
  ]);

  // 基础候选必须打上 fallback 标签
  assert.equal(name.knowledgeBacked, false);
  assert.equal(name.sourceStatus, 'fallback');
  assert.equal(name.sourceLabel, BASIC_CANDIDATE_LABEL);
  assert.equal(name.qualityLevel, BASIC_CANDIDATE_LABEL);
  // source 字段不应显示为空或"AI 文化参考"，应为"基础候选参考"
  assert.equal(name.source, '基础候选参考');
});

test('normalizeGeneratedNames preserves formal quality score for knowledgeBacked=true names', () => {
  const [name] = normalizeGeneratedNames('林', [
    {
      name: '清扬',
      wuxing: ['水', '火'],
      poemSource: '《诗经·郑风·野有蔓草》',
      poemSourceId: 'shijing-qingyang',
      sourceStatus: 'verified',
      qualityScore: 91,
      qualityLevel: '优选',
      knowledgeBacked: true,
    },
  ]);

  // 正常名字保留正式质量分
  assert.equal(name.sourceLabel, 'AI 实时生成');
  assert.equal(name.qualityLevel, '优选');
  assert.equal(name.qualityScore, 91);
  assert.notEqual(name.sourceLabel, BASIC_CANDIDATE_LABEL);
});

test('BASIC_CANDIDATE_LABEL and BASIC_CANDIDATE_HINT are stable strings for UI guardrails', () => {
  // 确保 UI 护栏能稳定匹配
  assert.equal(BASIC_CANDIDATE_LABEL, '基础候选');
  assert.ok(BASIC_CANDIDATE_HINT.includes('基础候选'));
  assert.ok(BASIC_CANDIDATE_HINT.includes('典籍'));
});
