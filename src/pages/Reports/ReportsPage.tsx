import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDataStore } from '../../features/data/store';
import { monthRange, todayRange, weekRange } from '../../shared/lib/date';
import { downloadCsv, downloadJson } from '../../features/exports/helpers';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Card';

interface SummaryRow {
  key: string;
  label: string;
  total: number;
  overtime: number;
  night: number;
  amount: number;
}

export function ReportsPage() {
  const { t } = useTranslation();
  const { shifts, persons, projects, settings } = useDataStore((state) => ({
    shifts: state.shifts,
    persons: state.persons,
    projects: state.projects,
    settings: state.settings
  }));
  const defaultRange = weekRange(settings.locale);
  const [start, setStart] = useState<string>(defaultRange.start);
  const [end, setEnd] = useState<string>(defaultRange.end);

  const periodShifts = useMemo(
    () =>
      shifts.filter((shift) => {
        const startMatch = !start || shift.start >= start;
        const endMatch = !end || (shift.end ?? shift.start) <= end;
        return startMatch && endMatch;
      }),
    [shifts, start, end]
  );

  const byPerson = useMemo(() => aggregateBy(periodShifts, persons.map((person) => ({ key: person.id, label: person.name })), (shift) => shift.personId), [periodShifts, persons]);
  const byProject = useMemo(() => aggregateBy(periodShifts, projects.map((project) => ({ key: project.id, label: project.title })), (shift) => shift.projectId), [periodShifts, projects]);

  const handleExportCsv = (rows: SummaryRow[], label: string, header: string) => {
    downloadCsv(`${label}_${start.slice(0, 10)}.csv`, {
      label: header,
      total: t('reports.hours'),
      overtime: t('reports.overtime'),
      night: t('reports.night'),
      amount: t('reports.total')
    },
    rows.map((row) => ({
      label: row.label,
      total: (row.total / 60).toFixed(2),
      overtime: (row.overtime / 60).toFixed(2),
      night: (row.night / 60).toFixed(2),
      amount: row.amount.toFixed(2)
    })));
  };

  const handleExportJson = (rows: SummaryRow[], label: string) => {
    downloadJson(`${label}_${start.slice(0, 10)}.json`, rows);
  };

  return (
    <div className="list-stack">
      <Card title={t('reports.title')}>
        <div className="grid-two">
          <label className="ui-field">
            <span className="ui-field__label">{t('reports.period')}</span>
            <input
              type="date"
              value={start ? start.slice(0, 10) : ''}
              onChange={(event) => {
                const value = event.target.value;
                setStart(value ? new Date(value).toISOString() : '');
              }}
            />
          </label>
          <label className="ui-field">
            <span className="ui-field__label">{t('reports.period')}</span>
            <input
              type="date"
              value={end ? end.slice(0, 10) : ''}
              onChange={(event) => {
                const value = event.target.value;
                setEnd(value ? new Date(value).toISOString() : '');
              }}
            />
          </label>
          <Button onClick={() => {
            const range = todayRange();
            setStart(range.start);
            setEnd(range.end);
          }}>{t('shifts.quickToday')}</Button>
          <Button onClick={() => {
            const range = weekRange(settings.locale);
            setStart(range.start);
            setEnd(range.end);
          }}>{t('shifts.quickWeek')}</Button>
          <Button onClick={() => {
            const range = monthRange();
            setStart(range.start);
            setEnd(range.end);
          }}>{t('shifts.quickMonth')}</Button>
        </div>
      </Card>
      <SummaryCard
        title={t('reports.byPerson')}
        rows={byPerson}
        labelHeader={t('shifts.columns.person')}
        onCsv={() => handleExportCsv(byPerson, 'persons', t('shifts.columns.person'))}
        onJson={() => handleExportJson(byPerson, 'persons')}
      />
      <SummaryCard
        title={t('reports.byProject')}
        rows={byProject}
        labelHeader={t('shifts.columns.project')}
        onCsv={() => handleExportCsv(byProject, 'projects', t('shifts.columns.project'))}
        onJson={() => handleExportJson(byProject, 'projects')}
      />
    </div>
  );
}

function aggregateBy(
  shifts: typeof useDataStore.getState().shifts,
  keys: { key: string; label: string }[],
  selector: (shift: typeof useDataStore.getState().shifts[number]) => string | undefined
): SummaryRow[] {
  const map = new Map<string, SummaryRow>();
  keys.forEach(({ key, label }) => {
    map.set(key, { key, label, total: 0, overtime: 0, night: 0, amount: 0 });
  });
  shifts.forEach((shift) => {
    const key = selector(shift);
    if (!key) {
      return;
    }
    const entry = map.get(key);
    if (!entry) {
      return;
    }
    entry.total += shift.minutesTotal ?? 0;
    entry.overtime += shift.minutesOvertime ?? 0;
    entry.night += shift.minutesNight ?? 0;
    entry.amount += shift.amount ?? 0;
  });
  return Array.from(map.values());
}

function SummaryCard({ title, rows, labelHeader, onCsv, onJson }: { title: string; rows: SummaryRow[]; labelHeader: string; onCsv: () => void; onJson: () => void }) {
  const { t } = useTranslation();
  return (
    <Card
      title={title}
      actions={
        <div className="grid-two">
          <Button onClick={onCsv}>{t('reports.exportCsv')}</Button>
          <Button onClick={onJson}>{t('reports.exportJson')}</Button>
        </div>
      }
    >
      <table className="tabular-table">
        <thead>
          <tr>
            <th>{labelHeader}</th>
            <th>{t('reports.hours')}</th>
            <th>{t('reports.overtime')}</th>
            <th>{t('reports.night')}</th>
            <th>{t('reports.total')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td>{row.label}</td>
              <td>{(row.total / 60).toFixed(2)}</td>
              <td>{(row.overtime / 60).toFixed(2)}</td>
              <td>{(row.night / 60).toFixed(2)}</td>
              <td>{row.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
