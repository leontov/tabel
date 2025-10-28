import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDataStore } from '../../features/data/store';
import { personSchema, rateSchema, settingsSchema } from '../../entities/schemas';
import { createId } from '../../shared/lib/id';
import { useSnackbar } from '../../shared/hooks/useSnackbar';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Card';
import { Field } from '../../shared/ui/Field';

export function OnboardingPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { show } = useSnackbar();
  const { saveSettings, addRate, addPerson } = useDataStore((state) => ({
    saveSettings: state.saveSettings,
    addRate: state.addRate,
    addPerson: state.addPerson
  }));
  const [step, setStep] = useState(1);
  const [locale, setLocale] = useState<'ru' | 'en'>('ru');
  const [nightStart, setNightStart] = useState('22:00');
  const [nightEnd, setNightEnd] = useState('06:00');
  const [overtime, setOvertime] = useState(480);
  const [rateTitle, setRateTitle] = useState('Базовая ставка');
  const [rateAmount, setRateAmount] = useState(800);
  const [personName, setPersonName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const translateIssue = (issue: { message: string }) => t(`errors.${issue.message}`, issue.message);
  const clearError = (field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };
  const assignError = (field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const settingsDraftSchema = settingsSchema.pick({
    id: true,
    locale: true,
    nightStart: true,
    nightEnd: true,
    overtimeThresholdMin: true
  });
  const rateDraftSchema = rateSchema.pick({ title: true, basePerHour: true });
  const personDraftSchema = personSchema.pick({ name: true });

  const next = () => {
    if (step === 2) {
      const parsed = settingsDraftSchema.safeParse({
        id: 'app',
        locale,
        nightStart,
        nightEnd,
        overtimeThresholdMin: overtime
      });
      if (!parsed.success) {
        parsed.error.issues.forEach((issue) => assignError(String(issue.path[0]), translateIssue(issue)));
        return;
      }
      ['nightStart', 'nightEnd', 'overtimeThresholdMin'].forEach(clearError);
    }
    setStep((current) => Math.min(current + 1, 3));
  };
  const prev = () => setStep((current) => Math.max(current - 1, 1));

  const handleFinish = async () => {
    const rateValidation = rateDraftSchema.safeParse({ title: rateTitle, basePerHour: rateAmount });
    const personValidation = personDraftSchema.safeParse({ name: personName });
    const settingsValidation = settingsDraftSchema.safeParse({
      id: 'app',
      locale,
      nightStart,
      nightEnd,
      overtimeThresholdMin: overtime
    });

    const collectedErrors: Record<string, string> = {};
    if (!rateValidation.success) {
      rateValidation.error.issues.forEach((issue) => {
        collectedErrors[String(issue.path[0])] = translateIssue(issue);
      });
    }
    if (!personValidation.success) {
      personValidation.error.issues.forEach((issue) => {
        collectedErrors[String(issue.path[0])] = translateIssue(issue);
      });
    }
    if (!settingsValidation.success) {
      settingsValidation.error.issues.forEach((issue) => {
        collectedErrors[String(issue.path[0])] = translateIssue(issue);
      });
    }

    if (Object.keys(collectedErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...collectedErrors }));
      return;
    }

    setErrors((prev) => {
      const nextErrors = { ...prev };
      ['title', 'basePerHour', 'name', 'nightStart', 'nightEnd', 'overtimeThresholdMin'].forEach((field) => delete nextErrors[field]);
      return nextErrors;
    });

    const rateId = createId();
    await addRate({ id: rateId, title: rateTitle, basePerHour: rateAmount, overtimeX: 1.5, nightX: 1.4, weekendX: 2 });
    await addPerson({ id: createId(), name: personName, active: true, rateId });
    await saveSettings({ locale, nightStart, nightEnd, overtimeThresholdMin: overtime, onboarded: true });
    void i18n.changeLanguage(locale);
    show(t('onboarding.finish'), 'success');
    navigate('/home');
  };

  return (
    <div className="list-stack">
      <Card title={t('onboarding.title')}>
        <p>{t('onboarding.intro')}</p>
        <div className="grid-two">
          <Button disabled={step === 1} onClick={prev}>
            {t('common.back')}
          </Button>
          <span>
            {step}/3
          </span>
          <Button disabled={step === 3} onClick={next}>
            {t('common.next')}
          </Button>
        </div>
      </Card>
      {step === 1 && (
        <Card title={t('onboarding.step1')}>
          <Field label={t('settings.locale')}>
            <select value={locale} onChange={(event) => setLocale(event.target.value as 'ru' | 'en')}>
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </Field>
        </Card>
      )}
      {step === 2 && (
        <Card title={t('onboarding.step2')}>
          <div className="grid-two">
            <Field label={t('settings.nightStart')} error={errors.nightStart}>
              <input
                type="time"
                value={nightStart}
                onChange={(event) => {
                  setNightStart(event.target.value);
                  clearError('nightStart');
                }}
              />
            </Field>
            <Field label={t('settings.nightEnd')} error={errors.nightEnd}>
              <input
                type="time"
                value={nightEnd}
                onChange={(event) => {
                  setNightEnd(event.target.value);
                  clearError('nightEnd');
                }}
              />
            </Field>
          </div>
          <Field label={t('settings.overtimeThreshold')} error={errors.overtimeThresholdMin}>
            <input
              type="number"
              value={overtime}
              onChange={(event) => {
                setOvertime(Number(event.target.value));
                clearError('overtimeThresholdMin');
              }}
            />
          </Field>
        </Card>
      )}
      {step === 3 && (
        <Card title={t('onboarding.step3')}>
          <Field label={t('rates.title')} error={errors.title}>
            <input
              value={rateTitle}
              onChange={(event) => {
                setRateTitle(event.target.value);
                clearError('title');
              }}
            />
          </Field>
          <Field label={t('rates.base')} error={errors.basePerHour}>
            <input
              type="number"
              value={rateAmount}
              onChange={(event) => {
                setRateAmount(Number(event.target.value));
                clearError('basePerHour');
              }}
            />
          </Field>
          <Field label={t('staff.add')} error={errors.name}>
            <input
              value={personName}
              onChange={(event) => {
                setPersonName(event.target.value);
                clearError('name');
              }}
            />
          </Field>
          <Button onClick={handleFinish}>{t('onboarding.finish')}</Button>
        </Card>
      )}
    </div>
  );
}
