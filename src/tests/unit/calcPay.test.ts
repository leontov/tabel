import { describe, expect, it } from 'vitest';

import { calcPay } from '../../domain/calcPay';
import { RatePlan } from '../../domain/models';

describe('calcPay', () => {
  const ratePlan: RatePlan = {
    id: 'rp',
    currency: 'RUB',
    baseRateHourly: 500,
    overtimeMultiplierDaily: 1.5,
    overtimeMultiplierWeekly: 2,
    nightMultiplier: 1.2,
    weekendMultiplier: 2
  };

  it('calculates total with multipliers', () => {
    const result = calcPay(
      {
        regularMinutes: 8 * 60,
        overtimeMinutes: 60,
        nightMinutes: 120,
        weekendMinutes: 60
      },
      ratePlan
    );

    expect(result.currency).toBe('RUB');
    expect(result.total).toBeGreaterThan(0);
  });
});
