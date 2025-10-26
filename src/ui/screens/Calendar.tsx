import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Card } from '../components/Card';

dayjs.extend(isoWeek);

type ShiftSummary = {
  id: string;
  date: string;
  employee: string;
  site: string;
  status: 'draft' | 'approved' | 'paid';
  hours: number;
};

const shifts: ShiftSummary[] = [
  { id: 's1', date: dayjs().format('YYYY-MM-DD'), employee: 'Иван Петров', site: 'ЖК “Лесной”', status: 'approved', hours: 9 },
  { id: 's2', date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'), employee: 'Мария Иванова', site: 'Офис “Альфа”', status: 'draft', hours: 8 }
];

const buildWeek = (anchor: dayjs.Dayjs) => {
  const start = anchor.startOf('week');
  return Array.from({ length: 7 }, (_, index) => start.add(index, 'day'));
};

const CalendarScreen = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDays = useMemo(() => buildWeek(dayjs().add(weekOffset, 'week')), [weekOffset]);
  const weekLabel = `${weekDays[0].format('D MMM')} – ${weekDays[6].format('D MMM YYYY')}`;

  const filteredShifts = shifts.filter((shift) => weekDays.some((day) => day.isSame(shift.date, 'day')));

  const totals = filteredShifts.reduce(
    (acc, shift) => {
      acc.hours += shift.hours;
      acc.count += 1;
      return acc;
    },
    { hours: 0, count: 0 }
  );

  return (
    <div className="space-y-4 p-4">
      <Card
        title="Календарь смен"
        actions={
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <button
              className="rounded-lg border border-slate-700 p-2"
              onClick={() => setWeekOffset((value) => value - 1)}
              aria-label="Previous week"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span>{weekLabel}</span>
            <button
              className="rounded-lg border border-slate-700 p-2"
              onClick={() => setWeekOffset((value) => value + 1)}
              aria-label="Next week"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-300">
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="flex flex-col items-center gap-1 rounded-xl bg-slate-800/70 px-2 py-3">
              <span className="text-[10px] uppercase text-slate-500">{day.format('ddd')}</span>
              <span className="text-lg font-semibold text-slate-100">{day.format('D')}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Смены недели">
        <ul className="space-y-2 text-xs text-slate-300">
          {filteredShifts.map((shift) => (
            <li key={shift.id} className="flex items-center justify-between rounded-xl bg-slate-800/80 px-3 py-3">
              <div>
                <p className="font-semibold text-slate-100">{shift.employee}</p>
                <p className="text-slate-400">{dayjs(shift.date).format('D MMMM')} · {shift.site}</p>
              </div>
              <div className="text-right text-slate-400">
                <p>{shift.hours.toFixed(1)} ч</p>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 capitalize ${
                    shift.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : shift.status === 'paid'
                      ? 'bg-sky-500/20 text-sky-300'
                      : 'bg-amber-500/20 text-amber-200'
                  }`}
                >
                  {shift.status}
                </span>
              </div>
            </li>
          ))}
          {filteredShifts.length === 0 && <li className="rounded-2xl border border-dashed border-slate-700 p-6 text-center">Нет смен</li>}
        </ul>
        <div className="mt-4 flex justify-between rounded-xl bg-slate-800/80 px-4 py-3 text-xs text-slate-300">
          <span>Всего смен: {totals.count}</span>
          <span>Часов: {totals.hours.toFixed(1)}</span>
        </div>
      </Card>
    </div>
  );
};

export default CalendarScreen;
