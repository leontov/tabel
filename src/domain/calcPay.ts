import { RatePlan } from './models';

type PayInput = {
  regularMinutes: number;
  overtimeMinutes: number;
  nightMinutes: number;
  weekendMinutes: number;
};

export const calcPay = (input: PayInput, ratePlan: RatePlan) => {
  const baseHourly = ratePlan.baseRateHourly;
  const minuteRate = baseHourly / 60;
  const regular = input.regularMinutes * minuteRate;
  const overtime = input.overtimeMinutes * minuteRate * ratePlan.overtimeMultiplierDaily;
  const night = input.nightMinutes * minuteRate * ratePlan.nightMultiplier;
  const weekend = input.weekendMinutes * minuteRate * ratePlan.weekendMultiplier;

  const total = regular + overtime + night + weekend;

  return {
    currency: ratePlan.currency,
    total,
    breakdown: {
      regular,
      overtime,
      night,
      weekend
    }
  };
};
