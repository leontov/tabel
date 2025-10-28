import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDataStore } from '../../features/data/store';
import { holidaySchema, settingsSchema } from '../../entities/schemas';
import { downloadJson } from '../../features/exports/helpers';
import { useSnackbar } from '../../shared/hooks/useSnackbar';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Card';
import { Field } from '../../shared/ui/Field';

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { settings, saveSettings, exportBackup, importBackup, holidays, addHoliday, deleteHoliday } = useDataStore((state) => ({
    settings: state.settings,
    saveSettings: state.saveSettings,
    exportBackup: state.exportBackup,
    importBackup: state.importBackup,
    holidays: state.holidays,
    addHoliday: state.addHoliday,
    deleteHoliday: state.deleteHoliday
  }));
  const { show } = useSnackbar();
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayMultiplier, setHolidayMultiplier] = useState(2);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const translateIssue = (issue: { message: string }) => t(`errors.${issue.message}`, issue.message);
  const setFieldError = (field: string, message?: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (!message) {
        delete next[field];
      } else {
        next[field] = message;
      }
      return next;
    });
  };

  const holidayDraftSchema = holidaySchema.pick({ dateISO: true, multiplier: true });

  const handleLocaleChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value as 'ru' | 'en';
    await saveSettings({ locale: nextLocale });
    void i18n.changeLanguage(nextLocale);
  };

  const handleNightWindow = async (field: 'nightStart' | 'nightEnd', value: string) => {
    const parsed = settingsSchema.safeParse({
      ...settings,
      [field]: value
    });
    if (!parsed.success) {
      const issue = parsed.error.issues.find((item) => item.path[0] === field);
      if (issue) {
        setFieldError(field, translateIssue(issue));
      }
      return;
    }
    setFieldError(field);
    await saveSettings({ [field]: value });
  };

  const handleOvertimeThreshold = async (value: number) => {
    if (Number.isNaN(value)) {
      setFieldError('overtimeThresholdMin', t('errors.settings.overtimeThreshold.nonnegative'));
      return;
    }
    const parsed = settingsSchema.safeParse({
      ...settings,
      overtimeThresholdMin: value
    });
    if (!parsed.success) {
      const issue = parsed.error.issues.find((item) => item.path[0] === 'overtimeThresholdMin');
      if (issue) {
        setFieldError('overtimeThresholdMin', translateIssue(issue));
      }
      return;
    }
    setFieldError('overtimeThresholdMin');
    await saveSettings({ overtimeThresholdMin: value });
  };

  const handleExportBackup = async () => {
    const raw = await exportBackup();
    const data = JSON.parse(raw);
    downloadJson(`backup_${new Date().toISOString().slice(0, 10)}.json`, data);
    show(t('common.backupCreated'), 'success');
  };

  const handleImportBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const text = await file.text();
    await importBackup(text);
    show(t('common.backupImported'), 'success');
  };

  const handleAddHoliday = async () => {
    const parsed = holidayDraftSchema.safeParse({ dateISO: holidayDate, multiplier: holidayMultiplier });
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => setFieldError(String(issue.path[0]), translateIssue(issue)));
      return;
    }
    await addHoliday(parsed.data);
    setHolidayDate('');
    setHolidayMultiplier(2);
    setFieldError('dateISO');
    setFieldError('multiplier');
  };

  return (
    <div className="list-stack">
      <Card title={t('settings.title')}>
        <Field label={t('settings.locale')}>
          <select value={settings.locale} onChange={handleLocaleChange}>
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </select>
        </Field>
        <div className="grid-two">
        <Field label={t('settings.nightStart')} error={errors.nightStart}>
          <input
            type="time"
            value={settings.nightStart}
            onChange={(event) => handleNightWindow('nightStart', event.target.value)}
          />
        </Field>
        <Field label={t('settings.nightEnd')} error={errors.nightEnd}>
          <input
            type="time"
            value={settings.nightEnd}
            onChange={(event) => handleNightWindow('nightEnd', event.target.value)}
          />
        </Field>
        </div>
        <Field label={t('settings.overtimeThreshold')} error={errors.overtimeThresholdMin}>
          <input
            type="number"
            value={settings.overtimeThresholdMin}
            onChange={(event) => handleOvertimeThreshold(Number(event.target.value))}
          />
        </Field>
        <div className="grid-two">
          <Button onClick={handleExportBackup}>{t('settings.backupExport')}</Button>
          <label className="ui-button ui-button--secondary">
            {t('settings.backupImport')}
            <input type="file" accept="application/json" onChange={handleImportBackup} style={{ display: 'none' }} />
          </label>
        </div>
      </Card>
      <Card title={t('settings.holidays')}>
        <div className="grid-two">
          <Field label={t('settings.holidayDate')} error={errors.dateISO}>
            <input
              type="date"
              value={holidayDate}
              onChange={(event) => {
                setHolidayDate(event.target.value);
                setFieldError('dateISO');
              }}
            />
          </Field>
          <Field label={t('settings.holidayMultiplier')} error={errors.multiplier}>
            <input
              type="number"
              value={holidayMultiplier}
              onChange={(event) => {
                setHolidayMultiplier(Number(event.target.value));
                setFieldError('multiplier');
              }}
            />
          </Field>
          <Button onClick={handleAddHoliday}>{t('common.add')}</Button>
        </div>
        {holidays.length === 0 ? (
          <p>{t('holidays.empty')}</p>
        ) : (
          <ul className="list-stack">
            {holidays.map((holiday) => (
              <li key={holiday.id}>
                <div className="grid-two">
                  <span>
                    {holiday.dateISO} × {holiday.multiplier}
                  </span>
                  <Button variant="danger" onClick={() => deleteHoliday(holiday.id)}>
                    {t('common.delete')}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
