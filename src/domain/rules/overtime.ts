export type OvertimeMode = 'preferDaily' | 'preferWeekly' | 'split';

export const calcDailyOvertime = (hours: number, threshold: number) => {
  if (hours <= threshold) {
    return { regular: hours, overtime: 0 };
  }
  return { regular: threshold, overtime: hours - threshold };
};

export const calcWeeklyOvertime = (hoursByDay: number[], threshold: number, mode: OvertimeMode) => {
  const total = hoursByDay.reduce((acc, value) => acc + value, 0);
  const weeklyOvertime = Math.max(total - threshold, 0);

  if (mode === 'preferWeekly') {
    return {
      regular: total - weeklyOvertime,
      overtime: weeklyOvertime
    };
  }

  if (mode === 'split') {
    const daily = hoursByDay.map((day) => calcDailyOvertime(day, threshold / 5));
    const dailyOvertime = daily.reduce((acc, value) => acc + value.overtime, 0);
    const remaining = Math.max(weeklyOvertime - dailyOvertime, 0);
    return {
      regular: total - dailyOvertime - remaining,
      overtime: dailyOvertime + remaining
    };
  }

  // preferDaily
  const dailySummaries = hoursByDay.map((day) => calcDailyOvertime(day, threshold / 5));
  const regular = dailySummaries.reduce((acc, value) => acc + value.regular, 0);
  const overtime = Math.max(total - regular, 0);
  return { regular, overtime };
};
