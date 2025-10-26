export type RoundingUnit = '5m' | '10m' | '15m';
export type RoundingMode = 'ceil' | 'floor' | 'nearest';

const unitMinutes: Record<RoundingUnit, number> = {
  '5m': 5,
  '10m': 10,
  '15m': 15
};

export const applyRounding = (minutes: number, unit: RoundingUnit, mode: RoundingMode) => {
  const step = unitMinutes[unit];
  if (step <= 0) return minutes;
  const quotient = minutes / step;
  switch (mode) {
    case 'ceil':
      return Math.ceil(quotient) * step;
    case 'floor':
      return Math.floor(quotient) * step;
    case 'nearest':
    default:
      return Math.round(quotient) * step;
  }
};
