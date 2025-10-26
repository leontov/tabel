import { DateTime, Interval } from 'luxon';

export type WorkInterval = {
  start: string; // ISO
  end: string; // ISO
};

export const NIGHT_START = 22;
export const NIGHT_END = 6;

export const splitIntervalsByNightAndWeekend = (intervals: WorkInterval[], tz: string) => {
  const day: Interval[] = [];
  const night: Interval[] = [];
  const weekend: Interval[] = [];

  intervals.forEach((interval) => {
    const start = DateTime.fromISO(interval.start, { zone: tz });
    const end = DateTime.fromISO(interval.end, { zone: tz });
    let cursor = start;

    while (cursor < end) {
      const nextHour = cursor.plus({ hours: 1 }).startOf('hour');
      const chunkEnd = nextHour < end ? nextHour : end;
      const chunk = Interval.fromDateTimes(cursor, chunkEnd);
      const isWeekend = cursor.weekday === 6 || cursor.weekday === 7;
      const isNight = cursor.hour >= NIGHT_START || cursor.hour < NIGHT_END;

      if (isWeekend) {
        weekend.push(chunk);
      }
      if (isNight) {
        night.push(chunk);
      }
      if (!isNight) {
        day.push(chunk);
      }
      cursor = chunkEnd;
    }
  });

  return { day, night, weekend };
};

export const sumIntervalMinutes = (intervals: Interval[]) =>
  intervals.reduce((total, interval) => total + interval.toDuration('minutes').minutes, 0);
