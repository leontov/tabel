import { addDays, endOfMonth, endOfWeek, formatISO, startOfDay, startOfMonth, startOfWeek } from 'date-fns';

export function toISO(date: Date): string {
  return date.toISOString();
}

export function todayRange(): { start: string; end: string } {
  const now = new Date();
  return {
    start: startOfDay(now).toISOString(),
    end: addDays(startOfDay(now), 1).toISOString()
  };
}

export function weekRange(locale: 'ru' | 'en'): { start: string; end: string } {
  const now = new Date();
  const weekStartsOn = locale === 'ru' ? 1 : 0;
  const start = startOfWeek(now, { weekStartsOn });
  const end = endOfWeek(now, { weekStartsOn });
  return { start: start.toISOString(), end: addDays(end, 1).toISOString() };
}

export function monthRange(): { start: string; end: string } {
  const now = new Date();
  const start = startOfMonth(now);
  const end = addDays(endOfMonth(now), 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function formatISODate(date: Date): string {
  return formatISO(date, { representation: 'date' });
}
