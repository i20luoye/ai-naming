import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FALLBACK_RECOMMENDATION_LABEL,
  normalizeGeneratedNames,
  parseGeneratedNamesContent,
} from './name-generation';

test('parseGeneratedNamesContent extracts JSON array from model text', () => {
  const parsed = parseGeneratedNamesContent('前言 [{"name":"清源","wuxing":["水","水"],"score":91}] 后记');

  assert.equal(parsed.ok, true);
  assert.equal(parsed.names.length, 1);
  assert.equal(parsed.names[0].name, '清源');
});

test('normalizeGeneratedNames marks API names as primary AI generated results', () => {
  const names = normalizeGeneratedNames('张', [
    {
      name: '清源',
      wuxing: ['水', '水'],
      score: 91,
      sancai: '吉',
      style: '清雅',
      poem: '源头活水',
      poemSource: '《朱熹诗》',
      wuxingAnalysis: '水势清润',
    },
  ]);

  assert.equal(names.length, 1);
  assert.equal(names[0].fullName, '张清源');
  assert.equal(names[0].sourceType, 'api');
  assert.equal(names[0].sourceLabel, 'AI 实时生成');
});

test('fallback recommendation label is explicit', () => {
  assert.match(FALLBACK_RECOMMENDATION_LABEL, /基础推荐/);
});
