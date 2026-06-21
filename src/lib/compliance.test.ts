import test from 'node:test';
import assert from 'node:assert/strict';

import { checkCompliance, filterCompliance, filterComplianceDeep } from './compliance';

test('filterCompliance replaces restricted wording without dirty masked text', () => {
  const filtered = filterCompliance('命理分析可以改运转运，命中注定，还可开光。');

  assert.equal(filtered.includes('***'), false);
  assert.equal(filtered.includes('传统***学说'), false);
  assert.deepEqual(checkCompliance(filtered), []);
});

test('filterComplianceDeep recursively filters nested strings', () => {
  const filtered = filterComplianceDeep({
    title: '命理起名',
    items: ['转运建议', { text: '开光加持' }],
  });

  assert.deepEqual(checkCompliance(JSON.stringify(filtered)), []);
  assert.equal(JSON.stringify(filtered).includes('***'), false);
});
