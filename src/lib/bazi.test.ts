import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateBazi } from './bazi';

test('calculateBazi returns four pillars and xiyong analysis for a valid birth time', () => {
  const result = calculateBazi('2024-06-01', '12:00');

  assert.equal(result.pillars.length, 4);
  assert.deepEqual(result.pillars.map((p) => p.pillar), ['年柱', '月柱', '日柱', '时柱']);
  assert.ok(result.dayMaster);
  assert.ok(result.dayMasterWuxing);
  assert.ok(result.xiYong.length >= 2);
  assert.ok(Object.values(result.wuxingPercent).every((n) => Number.isFinite(n)));
});
