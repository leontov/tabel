import { describe, expect, it } from 'vitest';

import { calcDailyOvertime, calcWeeklyOvertime } from '../../domain/rules/overtime';

describe('calcDailyOvertime', () => {
  it('splits hours above threshold', () => {
    const result = calcDailyOvertime(10, 8);
    expect(result.regular).toBe(8);
    expect(result.overtime).toBe(2);
  });
});

describe('calcWeeklyOvertime', () => {
  it('prefers weekly', () => {
    const result = calcWeeklyOvertime([8, 8, 8, 8, 8, 4, 0], 40, 'preferWeekly');
    expect(result.overtime).toBe(4);
  });

  it('splits mode', () => {
    const result = calcWeeklyOvertime([9, 9, 9, 9, 9, 0, 0], 40, 'split');
    expect(result.overtime).toBeGreaterThan(4);
  });
});
