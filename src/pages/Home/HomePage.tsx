import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { selectActiveShift, useDataStore } from '../../features/data/store';
import { calcMoney, calcShiftMinutes } from '../../shared/lib/calc';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Card';
import { Fab } from '../../shared/ui/Fab';

export function HomePage() {
  const { t } = useTranslation();
  const { persons, projects, rates, settings, holidays, startShift, stopShift, updateShift } = useDataStore((state) => ({
    persons: state.persons.filter((person) => person.active),
    projects: state.projects.filter((project) => project.active),
    rates: state.rates,
    settings: state.settings,
    holidays: state.holidays,
    startShift: state.startShift,
    stopShift: state.stopShift,
    updateShift: state.updateShift
  }));
  const [selectedPersonId, setSelectedPersonId] = useState<string | undefined>(() => persons[0]?.id);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(() => projects[0]?.id);
  const [clock, setClock] = useState(Date.now());

  useEffect(() => {
    if (persons.length > 0 && !selectedPersonId) {
      setSelectedPersonId(persons[0].id);
    }
  }, [persons, selectedPersonId]);

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const activeShift = useDataStore((state) => (selectedPersonId ? selectActiveShift(state, selectedPersonId) : undefined));

  useEffect(() => {
    if (!activeShift) {
      return undefined;
    }
    const id = window.setInterval(() => {
      setClock(Date.now());
    }, 30_000);
    return () => window.clearInterval(id);
  }, [activeShift]);

  const metrics = useMemo(() => {
    if (!activeShift) {
      return undefined;
    }
    const simulated = { ...activeShift, end: new Date(clock).toISOString() };
    return calcShiftMinutes(simulated, settings);
  }, [activeShift, clock, settings]);

  const person = persons.find((p) => p.id === selectedPersonId);
  const rate = rates.find((r) => r.id === person?.rateId);

  const earnings = useMemo(() => {
    if (!activeShift || !metrics || !rate) {
      return undefined;
    }
    const date = activeShift.start.slice(0, 10);
    const holiday = holidays.find((h) => h.dateISO === date);
    return calcMoney(metrics.totalMin, rate, metrics, {
      isWeekend: new Date(activeShift.start).getDay() === 0 || new Date(activeShift.start).getDay() === 6,
      holidayMultiplier: holiday?.multiplier
    });
  }, [activeShift, metrics, rate, holidays]);

  const handleStart = async () => {
    if (!selectedPersonId) {
      return;
    }
    await startShift(selectedPersonId, selectedProjectId || undefined);
  };

  const handleStop = async () => {
    if (!activeShift) {
      return;
    }
    if (window.confirm(t('common.confirmStop'))) {
      await stopShift(activeShift.id);
    }
  };

  const handleBreak = async (minutes: number) => {
    if (!activeShift) {
      return;
    }
    const current = activeShift.breaksMin ?? 0;
    await updateShift(activeShift.id, { breaksMin: current + minutes });
  };

  const isRunning = Boolean(activeShift);

  return (
    <div className="list-stack">
      <Card title={t('home.title')}>
        <div className="grid-two">
          <label className="ui-field">
            <span className="ui-field__label">{t('home.selectPerson')}</span>
            <select value={selectedPersonId ?? ''} onChange={(event) => setSelectedPersonId(event.target.value)}>
              {persons.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </label>
          <label className="ui-field">
            <span className="ui-field__label">{t('home.selectProject')}</span>
            <select value={selectedProjectId ?? ''} onChange={(event) => setSelectedProjectId(event.target.value)}>
              <option value="">—</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <strong>{isRunning ? t('home.activeShift', { name: person?.name ?? '' }) : t('home.noActiveShift')}</strong>
        </div>
        {isRunning && metrics && (
          <div className="grid-two">
            <Metric label={t('home.elapsed')} value={`${Math.round(metrics.totalMin)} ${t('common.minutes')}`} />
            <Metric label={t('home.overtime')} value={`${Math.round(metrics.overtimeMin)} ${t('common.minutes')}`} />
            <Metric label={t('home.night')} value={`${Math.round(metrics.nightMin)} ${t('common.minutes')}`} />
            <Metric label={t('home.earnings')} value={earnings?.toFixed(2) ?? '—'} />
          </div>
        )}
        <div className="grid-two">
          <Button onClick={() => handleBreak(5)} disabled={!isRunning}>
            {t('home.break5')}
          </Button>
          <Button onClick={() => handleBreak(10)} disabled={!isRunning}>
            {t('home.break10')}
          </Button>
          <Button onClick={() => handleBreak(15)} disabled={!isRunning}>
            {t('home.break15')}
          </Button>
        </div>
      </Card>
      <Fab onClick={isRunning ? handleStop : handleStart}>{isRunning ? t('home.stop') : t('home.start')}</Fab>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="ui-card">
      <span className="ui-field__label">{label}</span>
      <span>{value}</span>
    </div>
  );
}
