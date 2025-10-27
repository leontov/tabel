import { describe, expect, it } from 'vitest';
import { calcMoney, calcShiftMinutes, splitNightMinutes } from '../shared/lib/calc';
import type { Rate, Settings, Shift } from '../entities/types';

const settings: Settings = {
  id: 'app',
  locale: 'ru',
  nightStart: '22:00',
  nightEnd: '06:00',
  overtimeThresholdMin: 480
};

const rate: Rate = {
  id: 'rate',
  title: 'Standard',
  basePerHour: 600,
  overtimeX: 1.5,
  nightX: 1.4,
  weekendX: 2
};

describe('splitNightMinutes', () => {
  it('detects night minutes inside a single day', () => {
    const result = splitNightMinutes('2024-05-01T23:00:00.000Z', '2024-05-02T01:00:00.000Z', '22:00', '06:00');
    expect(result.nightMin).toBe(120);
    expect(result.dayMin).toBe(0);
  });

  it('handles intervals crossing midnight into day time', () => {
    const result = splitNightMinutes('2024-05-01T20:00:00.000Z', '2024-05-02T08:00:00.000Z', '22:00', '06:00');
    expect(result.nightMin).toBe(8 * 60); // 22-06 => 8h
    expect(result.dayMin).toBe(4 * 60); // 20-22 and 06-08
  });

  it('throws on invalid ranges', () => {
    expect(() => splitNightMinutes('2024-05-01T10:00:00.000Z', '2024-05-01T09:00:00.000Z', '22:00', '06:00')).toThrowError('invalid.range');
  });
  it('counts day-only shifts as day minutes', () => {
    const result = splitNightMinutes('2024-05-01T07:00:00.000Z', '2024-05-01T15:00:00.000Z', '22:00', '06:00');
    expect(result.nightMin).toBe(0);
    expect(result.dayMin).toBe(8 * 60);
  });
});

describe('calcShiftMinutes', () => {
  it('subtracts breaks from totals', () => {
    const shift: Shift = {
      id: 's1',
      personId: 'p1',
      start: '2024-05-01T08:00:00.000Z',
      end: '2024-05-01T16:00:00.000Z',
      breaksMin: 60
    };
    const result = calcShiftMinutes(shift, settings);
    expect(result.totalMin).toBe(7 * 60);
    expect(result.overtimeMin).toBe(0);
  });

  it('computes overtime beyond threshold', () => {
    const shift: Shift = {
      id: 's2',
      personId: 'p1',
      start: '2024-05-01T08:00:00.000Z',
      end: '2024-05-01T20:00:00.000Z'
    };
    const result = calcShiftMinutes(shift, settings);
    expect(result.totalMin).toBe(12 * 60);
    expect(result.overtimeMin).toBe(4 * 60);
  });

  it('throws when duration is negative', () => {
    const shift: Shift = {
      id: 's3',
      personId: 'p1',
      start: '2024-05-01T12:00:00.000Z',
      end: '2024-05-01T10:00:00.000Z'
    };
    expect(() => calcShiftMinutes(shift, settings)).toThrowError('shift.duration.negative');
  });
});

describe('calcMoney', () => {
  it('returns zero for empty shift', () => {
    const result = calcMoney(0, rate, { overtimeMin: 0, nightMin: 0 }, { isWeekend: false });
    expect(result).toBe(0);
  });

  it('calculates base amount', () => {
    const result = calcMoney(120, rate, { overtimeMin: 0, nightMin: 0 }, { isWeekend: false });
    expect(result).toBeCloseTo(120 * (rate.basePerHour / 60));
  });

  it('applies overtime and night multipliers with weekend', () => {
    const result = calcMoney(
      600,
      rate,
      { overtimeMin: 120, nightMin: 180 },
      { isWeekend: true, holidayMultiplier: 2 }
    );
    expect(result).toBeGreaterThan(0);
  });

  it('guards against negative totals', () => {
    expect(() => calcMoney(-10, rate, { overtimeMin: 0, nightMin: 0 }, { isWeekend: false })).toThrowError('minutes.negative');
  });
});
