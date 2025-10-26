import Papa from 'papaparse';
import { Shift } from '../domain/models';

export type CsvExportOptions = {
  shifts: Shift[];
  locale?: 'ru' | 'en';
};

const formatNumber = (value: number, locale: 'ru' | 'en') =>
  new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);

export const exportShiftsToCsv = ({ shifts, locale = 'ru' }: CsvExportOptions) => {
  const rows = shifts.map((shift) => ({
    date: shift.date,
    employeeId: shift.employeeId,
    siteId: shift.siteId,
    start: shift.start,
    end: shift.end,
    breaks: shift.breaks.reduce((total, current) => total + `${current.start}-${current.end}(${current.type});`, ''),
    status: shift.status,
    totalHours: formatNumber(8, locale)
  }));

  const csv = Papa.unparse(rows, {
    delimiter: ';',
    quotes: true,
    header: true
  });

  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
};
