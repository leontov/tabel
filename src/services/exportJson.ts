import { Shift } from '../domain/models';

export type JsonExportOptions = {
  shifts: Shift[];
  period: { from: string; to: string };
  siteId?: string;
};

export const exportShiftsToJson = ({ shifts, period, siteId }: JsonExportOptions) => {
  const payload = {
    version: 'v1',
    period,
    siteId,
    entries: shifts.map((shift) => ({
      date: shift.date,
      employeeId: shift.employeeId,
      shift: {
        start: shift.start,
        end: shift.end,
        breaks: shift.breaks
      },
      hours: {
        regular: 8,
        overtime: 0,
        night: 0
      },
      pay: {
        currency: 'RUB',
        rate: 500,
        amount: 4000
      },
      status: shift.status
    }))
  };

  return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
};
