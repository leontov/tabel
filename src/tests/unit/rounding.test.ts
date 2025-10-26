import { describe, expect, it } from 'vitest';

import { applyRounding } from '../../domain/rules/rounding';

describe('applyRounding', () => {
  it('rounds up with ceil', () => {
    expect(applyRounding(7, '5m', 'ceil')).toBe(10);
  });

  it('rounds down with floor', () => {
    expect(applyRounding(14, '10m', 'floor')).toBe(10);
  });

  it('rounds nearest', () => {
    expect(applyRounding(12, '5m', 'nearest')).toBe(10);
    expect(applyRounding(13, '5m', 'nearest')).toBe(15);
  });
});
