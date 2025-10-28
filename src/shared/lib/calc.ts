import { addDays, differenceInMinutes, min as dateMin, startOfDay } from 'date-fns';
import { settingsSchema, shiftSchema } from '../../entities/schemas';
import type { Rate, Settings, Shift } from '../../entities/types';

interface NightSplitResult {
  nightMin: number;
  dayMin: number;
}

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    throw new Error('invalid.time');
  }
  return hours * 60 + minutes;
}

function overlapMinutes(segmentStart: number, segmentEnd: number, rangeStart: number, rangeEnd: number): number {
  const start = Math.max(segmentStart, rangeStart);
  const end = Math.min(segmentEnd, rangeEnd);
  return Math.max(0, end - start);
}

export function splitNightMinutes(startISO: string, endISO: string, nightStart: string, nightEnd: string): NightSplitResult {
  const startDate = new Date(startISO);
  const endDate = new Date(endISO);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new Error('invalid.date');
  }
  if (endDate <= startDate) {
    throw new Error('invalid.range');
  }

  const nightStartMin = parseTimeToMinutes(nightStart);
  const nightEndMin = parseTimeToMinutes(nightEnd);

  let nightMinutes = 0;
  let cursor = startDate;
  while (cursor < endDate) {
    const dayStart = startOfDay(cursor);
    const dayEnd = addDays(dayStart, 1);
    const segmentEnd = dateMin([dayEnd, endDate]);

    const segmentStartMin = differenceInMinutes(cursor, dayStart);
    const segmentEndMin = differenceInMinutes(segmentEnd, dayStart);

    if (nightStartMin <= nightEndMin) {
      nightMinutes += overlapMinutes(segmentStartMin, segmentEndMin, nightStartMin, nightEndMin);
    } else {
      nightMinutes += overlapMinutes(segmentStartMin, segmentEndMin, nightStartMin, 24 * 60);
      nightMinutes += overlapMinutes(segmentStartMin, segmentEndMin, 0, nightEndMin);
    }

    cursor = segmentEnd;
  }

  const totalMinutes = differenceInMinutes(endDate, startDate);
  const dayMinutes = Math.max(0, totalMinutes - nightMinutes);
  return { nightMin: nightMinutes, dayMin: dayMinutes };
}

interface CalculatedMinutes {
  totalMin: number;
  overtimeMin: number;
  nightMin: number;
}

export function calcShiftMinutes(shiftInput: Shift, settingsInput: Settings): CalculatedMinutes {
  const shift = shiftSchema.parse(shiftInput);
  const settings = settingsSchema.parse(settingsInput);
  const endISO = shift.end ?? new Date().toISOString();
  const rawDuration = differenceInMinutes(new Date(endISO), new Date(shift.start));
  if (rawDuration < 0) {
    throw new Error('shift.duration.negative');
  }
  const { nightMin, dayMin } = splitNightMinutes(shift.start, endISO, settings.nightStart, settings.nightEnd);
  const totalBeforeBreaks = nightMin + dayMin;
  const breaks = Math.max(0, shift.breaksMin ?? 0);
  const totalMin = Math.max(0, totalBeforeBreaks - breaks);
  const adjustedNight = Math.min(nightMin, totalMin);
  const overtimeMin = Math.max(0, totalMin - settings.overtimeThresholdMin);
  const effectiveNight = Math.min(adjustedNight, totalMin);
  return {
    totalMin,
    overtimeMin,
    nightMin: effectiveNight
  };
}

interface MoneyContext {
  overtimeMin: number;
  nightMin: number;
}

interface MoneyOptions {
  isWeekend: boolean;
  holidayMultiplier?: number;
}

export function calcMoney(
  totalMin: number,
  rate: Rate,
  minutes: MoneyContext,
  options: MoneyOptions
): number {
  if (totalMin < 0 || minutes.overtimeMin < 0 || minutes.nightMin < 0) {
    throw new Error('minutes.negative');
  }
  if (totalMin === 0) {
    return 0;
  }
  const basePerMinute = rate.basePerHour / 60;
  const weekendMultiplier = options.isWeekend ? rate.weekendX ?? 1 : 1;
  const holidayMultiplier = options.holidayMultiplier ?? 1;

  const baseAmount = totalMin * basePerMinute * weekendMultiplier * holidayMultiplier;

  const overtimeMultiplier = rate.overtimeX ?? 1;
  const overtimeBonus = minutes.overtimeMin * basePerMinute * (overtimeMultiplier - 1) * weekendMultiplier * holidayMultiplier;

  const nightMultiplier = rate.nightX ?? 1;
  const nightBonus = minutes.nightMin * basePerMinute * (nightMultiplier - 1) * weekendMultiplier * holidayMultiplier;

  const total = baseAmount + overtimeBonus + nightBonus;
  return Math.round(total * 100) / 100;
}
