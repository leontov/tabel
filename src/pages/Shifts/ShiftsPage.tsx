import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { selectFilteredShifts, useDataStore } from '../../features/data/store';
import { monthRange, todayRange, weekRange } from '../../shared/lib/date';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Card';

export function ShiftsPage() {
  const { t } = useTranslation();
  const { persons, projects, filters, setFilters, updateShift, massUpdateBreaks, settings } = useDataStore((state) => ({
    persons: state.persons,
    projects: state.projects,
    filters: state.filters,
    setFilters: state.setFilters,
    updateShift: state.updateShift,
    massUpdateBreaks: state.massUpdateBreaks,
    settings: state.settings
  }));
  const [search, setSearch] = useState(filters.search ?? '');
  const [massBreak, setMassBreak] = useState(0);
  const filteredShifts = useDataStore((state) => selectFilteredShifts(state));

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setFilters({ search });
    }, 250);
    return () => window.clearTimeout(handle);
  }, [search, setFilters]);

  const applyQuickFilter = (preset: 'today' | 'week' | 'month' | 'custom') => {
    let start: string | undefined;
    let end: string | undefined;
    if (preset === 'today') {
      const range = todayRange();
      start = range.start;
      end = range.end;
    } else if (preset === 'week') {
      const range = weekRange(settings.locale);
      start = range.start;
      end = range.end;
    } else if (preset === 'month') {
      const range = monthRange();
      start = range.start;
      end = range.end;
    }
    setFilters({ quick: preset, start, end });
  };

  const handleBreakChange = (shiftId: string, value: number) => {
    const safeValue = Number.isNaN(value) ? 0 : value;
    void updateShift(shiftId, { breaksMin: safeValue });
  };

  const handleNoteChange = (shiftId: string, value: string) => {
    void updateShift(shiftId, { notes: value });
  };

  const formattedShifts = useMemo(
    () =>
      filteredShifts.map((shift) => ({
        ...shift,
        start: format(new Date(shift.start), 'yyyy-MM-dd HH:mm'),
        end: shift.end ? format(new Date(shift.end), 'yyyy-MM-dd HH:mm') : '—'
      })),
    [filteredShifts]
  );

  return (
    <div className="list-stack">
      <Card title={t('shifts.title')}>
        <div className="grid-two">
          <label className="ui-field">
            <span className="ui-field__label">{t('shifts.filterPerson')}</span>
            <select value={filters.personId ?? ''} onChange={(event) => setFilters({ personId: event.target.value || undefined })}>
              <option value="">—</option>
              {persons.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </label>
          <label className="ui-field">
            <span className="ui-field__label">{t('shifts.filterProject')}</span>
            <select value={filters.projectId ?? ''} onChange={(event) => setFilters({ projectId: event.target.value || undefined })}>
              <option value="">—</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </label>
          <label className="ui-field">
            <span className="ui-field__label">{t('shifts.filterStart')}</span>
            <input
              type="datetime-local"
              value={filters.start ? filters.start.slice(0, 16) : ''}
              onChange={(event) => setFilters({ start: event.target.value ? new Date(event.target.value).toISOString() : undefined, quick: 'custom' })}
            />
          </label>
          <label className="ui-field">
            <span className="ui-field__label">{t('shifts.filterEnd')}</span>
            <input
              type="datetime-local"
              value={filters.end ? filters.end.slice(0, 16) : ''}
              onChange={(event) => setFilters({ end: event.target.value ? new Date(event.target.value).toISOString() : undefined, quick: 'custom' })}
            />
          </label>
        </div>
        <div className="grid-two">
          <div className="ui-field">
            <span className="ui-field__label">{t('shifts.massBreakLabel')}</span>
            <div className="grid-two">
              <input type="number" value={massBreak} onChange={(event) => setMassBreak(Number(event.target.value))} />
              <Button onClick={() => massUpdateBreaks(massBreak)}>{t('common.apply') ?? 'Apply'}</Button>
            </div>
          </div>
          <label className="ui-field">
            <span className="ui-field__label">{t('shifts.quickCustom')}</span>
            <div className="grid-two">
              <Button variant={filters.quick === 'today' ? 'primary' : 'secondary'} onClick={() => applyQuickFilter('today')}>
                {t('shifts.quickToday')}
              </Button>
              <Button variant={filters.quick === 'week' ? 'primary' : 'secondary'} onClick={() => applyQuickFilter('week')}>
                {t('shifts.quickWeek')}
              </Button>
              <Button variant={filters.quick === 'month' ? 'primary' : 'secondary'} onClick={() => applyQuickFilter('month')}>
                {t('shifts.quickMonth')}
              </Button>
            </div>
          </label>
        </div>
        <input
          type="search"
          placeholder={t('shifts.searchPlaceholder')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </Card>
      <div className="ui-card">
        <table className="tabular-table">
          <thead>
            <tr>
              <th>{t('shifts.columns.person')}</th>
              <th>{t('shifts.columns.project')}</th>
              <th>{t('shifts.columns.start')}</th>
              <th>{t('shifts.columns.end')}</th>
              <th>{t('shifts.columns.breaks')}</th>
              <th>{t('shifts.columns.notes')}</th>
              <th>{t('shifts.columns.total')}</th>
              <th>{t('shifts.columns.overtime')}</th>
              <th>{t('shifts.columns.night')}</th>
              <th>{t('shifts.columns.amount')}</th>
            </tr>
          </thead>
          <tbody>
            {formattedShifts.map((shift) => (
              <tr key={shift.id}>
                <td>{persons.find((person) => person.id === shift.personId)?.name ?? '—'}</td>
                <td>{projects.find((project) => project.id === shift.projectId)?.title ?? '—'}</td>
                <td>{shift.start}</td>
                <td>{shift.end}</td>
                <td>
                  <input
                    type="number"
                    min={0}
                    value={shift.breaksMin ?? 0}
                    onChange={(event) => handleBreakChange(shift.id, Number(event.target.value || '0'))}
                    style={{ width: '80px' }}
                  />
                </td>
                <td>
                  <textarea
                    value={shift.notes ?? ''}
                    onChange={(event) => handleNoteChange(shift.id, event.target.value)}
                    rows={2}
                  />
                </td>
                <td>{Math.round(shift.minutesTotal ?? 0)}</td>
                <td>{Math.round(shift.minutesOvertime ?? 0)}</td>
                <td>{Math.round(shift.minutesNight ?? 0)}</td>
                <td>{shift.amount?.toFixed(2) ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
