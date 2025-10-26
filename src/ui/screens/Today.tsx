import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { Play, Square, Plus } from 'lucide-react';

import { Card } from '../components/Card';

dayjs.extend(duration);

type BreakForm = {
  start: string;
  end: string;
  type: 'lunch' | 'rest';
};

type TodayShift = {
  employeeId: string;
  siteId: string;
  start: string;
  end: string;
  breaks: BreakForm[];
  status: 'draft' | 'approved' | 'paid';
};

const demoEmployees = [
  { id: 'emp-1', name: 'Иван Петров' },
  { id: 'emp-2', name: 'Мария Иванова' }
];

const demoSites = [
  { id: 'site-1', name: 'ЖК “Лесной”' },
  { id: 'site-2', name: 'Офис “Альфа”' }
];

const emptyShift: TodayShift = {
  employeeId: demoEmployees[0]?.id ?? '',
  siteId: demoSites[0]?.id ?? '',
  start: dayjs().startOf('hour').format('HH:mm'),
  end: dayjs().add(8, 'hour').format('HH:mm'),
  breaks: [],
  status: 'draft'
};

const useTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isRunning || !startedAt) return;
    const startTime = dayjs(startedAt, 'HH:mm');
    const interval = window.setInterval(() => {
      setElapsed(dayjs().diff(startTime, 'minute'));
    }, 1000 * 30);

    return () => window.clearInterval(interval);
  }, [isRunning, startedAt]);

  const start = () => {
    const now = dayjs();
    setStartedAt(now.format('HH:mm'));
    setElapsed(0);
    setIsRunning(true);
  };

  const stop = () => {
    setIsRunning(false);
  };

  return {
    isRunning,
    startedAt,
    elapsed,
    start,
    stop
  };
};

const formatMinutes = (minutes: number) => {
  const dur = dayjs.duration(minutes, 'minute');
  const hrs = Math.floor(dur.asHours());
  const mins = dur.minutes();
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const calculateShiftHours = (shift: TodayShift) => {
  const start = dayjs(shift.start, 'HH:mm');
  const end = dayjs(shift.end, 'HH:mm');
  let total = end.diff(start, 'minute');
  shift.breaks.forEach((b) => {
    const bStart = dayjs(b.start, 'HH:mm');
    const bEnd = dayjs(b.end, 'HH:mm');
    total -= bEnd.diff(bStart, 'minute');
  });
  return total;
};

const BreakList = ({ breaks }: { breaks: BreakForm[] }) => (
  <ul className="space-y-1 text-xs text-slate-400">
    {breaks.length === 0 && <li>Перерывов нет</li>}
    {breaks.map((b, index) => (
      <li key={index} className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2">
        <span>{b.type === 'lunch' ? 'Обед' : 'Отдых'}</span>
        <span>
          {b.start} — {b.end}
        </span>
      </li>
    ))}
  </ul>
);

const TimerControls = ({
  isRunning,
  start,
  stop
}: {
  isRunning: boolean;
  start: () => void;
  stop: () => void;
}) => (
  <button
    className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${
      isRunning ? 'bg-rose-500 text-white' : 'bg-sky-500 text-white'
    }`}
    onClick={isRunning ? stop : start}
  >
    {isRunning ? (
      <>
        <Square className="h-4 w-4" /> Остановить
      </>
    ) : (
      <>
        <Play className="h-4 w-4" /> Старт смены
      </>
    )}
  </button>
);

const AddBreakButton = ({ onAdd }: { onAdd: () => void }) => (
  <button
    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 px-4 py-2 text-xs text-slate-300"
    onClick={onAdd}
    type="button"
  >
    <Plus className="h-4 w-4" /> Добавить перерыв
  </button>
);

const ShiftSummary = ({ shift }: { shift: TodayShift }) => {
  const totalMinutes = calculateShiftHours(shift);
  const total = formatMinutes(Math.max(totalMinutes, 0));
  const breaks = shift.breaks.reduce((acc, cur) => {
    const bStart = dayjs(cur.start, 'HH:mm');
    const bEnd = dayjs(cur.end, 'HH:mm');
    return acc + bEnd.diff(bStart, 'minute');
  }, 0);

  return (
    <dl className="grid grid-cols-2 gap-3 text-xs text-slate-300">
      <div>
        <dt className="text-slate-500">Начало</dt>
        <dd className="font-semibold text-slate-100">{shift.start}</dd>
      </div>
      <div>
        <dt className="text-slate-500">Окончание</dt>
        <dd className="font-semibold text-slate-100">{shift.end}</dd>
      </div>
      <div>
        <dt className="text-slate-500">Перерывы</dt>
        <dd className="font-semibold text-slate-100">{breaks} мин</dd>
      </div>
      <div>
        <dt className="text-slate-500">Итого</dt>
        <dd className="font-semibold text-slate-100">{total}</dd>
      </div>
    </dl>
  );
};

const useLocalShift = () => {
  const [shift, setShift] = useState<TodayShift>(() => {
    const saved = localStorage.getItem('today-shift');
    if (!saved) return emptyShift;
    try {
      const parsed = JSON.parse(saved);
      return { ...emptyShift, ...parsed } as TodayShift;
    } catch (error) {
      console.error('Failed to parse local shift', error);
      return emptyShift;
    }
  });

  useEffect(() => {
    localStorage.setItem('today-shift', JSON.stringify(shift));
  }, [shift]);

  return { shift, setShift } as const;
};

const TodayScreen = () => {
  const { t } = useTranslation();
  const { shift, setShift } = useLocalShift();
  const timer = useTimer();

  useEffect(() => {
    if (timer.isRunning && timer.startedAt) {
      setShift((prev) => ({ ...prev, start: timer.startedAt }));
    }
  }, [timer.isRunning, timer.startedAt, setShift]);

  useEffect(() => {
    if (timer.isRunning) {
      setShift((prev) => ({ ...prev, end: dayjs().format('HH:mm') }));
    }
  }, [timer.elapsed, timer.isRunning, setShift]);

  const totalMinutes = useMemo(() => calculateShiftHours(shift), [shift]);

  return (
    <div className="space-y-4 p-4">
      <Card title={t('nav.today')}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Смена</p>
            <p className="text-2xl font-semibold text-slate-100">{formatMinutes(Math.max(totalMinutes, 0))}</p>
            <p className="text-xs text-slate-500">{dayjs().format('D MMMM YYYY')}</p>
          </div>
          <div className="text-right text-xs text-slate-400">
            <p>{demoEmployees.find((e) => e.id === shift.employeeId)?.name}</p>
            <p>{demoSites.find((s) => s.id === shift.siteId)?.name}</p>
          </div>
        </div>
        <ShiftSummary shift={shift} />
        <TimerControls {...timer} />
      </Card>

      <Card
        title="Перерывы"
        actions={
          <AddBreakButton
            onAdd={() =>
              setShift((prev) => ({
                ...prev,
                breaks: [...prev.breaks, { start: '13:00', end: '13:30', type: 'lunch' }]
              }))
            }
          />
        }
      >
        <BreakList breaks={shift.breaks} />
      </Card>

      <Card title="Статус">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Текущее состояние</span>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-100">{shift.status}</span>
        </div>
      </Card>
    </div>
  );
};

export default TodayScreen;
