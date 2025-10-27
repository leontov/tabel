import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDataStore } from '../../features/data/store';
import type { Rate } from '../../entities/types';
import { rateSchema } from '../../entities/schemas';
import { createId } from '../../shared/lib/id';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Card';
import { Field } from '../../shared/ui/Field';

const editableRateSchema = rateSchema.pick({ title: true, basePerHour: true, overtimeX: true, nightX: true, weekendX: true });

export function RatesPage() {
  const { t } = useTranslation();
  const { rates, addRate, updateRate, deleteRate } = useDataStore((state) => ({
    rates: state.rates,
    addRate: state.addRate,
    updateRate: state.updateRate,
    deleteRate: state.deleteRate
  }));
  const [form, setForm] = useState({
    title: '',
    basePerHour: 0,
    overtimeX: 1.5,
    nightX: 1.4,
    weekendX: 2
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    const parsed = editableRateSchema.safeParse(form);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        nextErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }
    await addRate({ id: createId(), ...parsed.data });
    setForm({ title: '', basePerHour: 0, overtimeX: 1.5, nightX: 1.4, weekendX: 2 });
    setErrors({});
  };

  const handleUpdate = (id: string, field: keyof Rate, value: number) => {
    const payload: Partial<Rate> = { [field]: value } as Partial<Rate>;
    void updateRate(id, payload);
  };

  return (
    <div className="list-stack">
      <Card title={t('rates.title')}>
        <Field label={t('common.add')}>
          <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
          {errors.title && <span className="ui-field__error">{errors.title}</span>}
        </Field>
        <Field label={t('rates.base')}>
          <input
            type="number"
            value={form.basePerHour}
            onChange={(event) => setForm((prev) => ({ ...prev, basePerHour: Number(event.target.value) }))}
          />
          {errors.basePerHour && <span className="ui-field__error">{errors.basePerHour}</span>}
        </Field>
        <div className="grid-two">
          <Field label={t('rates.overtimeX')}>
            <input
              type="number"
              value={form.overtimeX}
              onChange={(event) => setForm((prev) => ({ ...prev, overtimeX: Number(event.target.value) }))}
            />
          </Field>
          <Field label={t('rates.nightX')}>
            <input
              type="number"
              value={form.nightX}
              onChange={(event) => setForm((prev) => ({ ...prev, nightX: Number(event.target.value) }))}
            />
          </Field>
          <Field label={t('rates.weekendX')}>
            <input
              type="number"
              value={form.weekendX}
              onChange={(event) => setForm((prev) => ({ ...prev, weekendX: Number(event.target.value) }))}
            />
          </Field>
        </div>
        <Button onClick={handleSubmit}>{t('common.save')}</Button>
      </Card>
      {rates.length === 0 ? (
        <Card>{t('rates.empty')}</Card>
      ) : (
        rates.map((rate) => (
          <Card key={rate.id} title={rate.title} actions={<Button variant="danger" onClick={() => void deleteRate(rate.id)}>{t('common.delete')}</Button>}>
            <div className="grid-two">
              <Field label={t('rates.base')}>
                <input
                  type="number"
                  value={rate.basePerHour}
                  onChange={(event) => handleUpdate(rate.id, 'basePerHour', Number(event.target.value))}
                />
              </Field>
              <Field label={t('rates.overtimeX')}>
                <input
                  type="number"
                  value={rate.overtimeX ?? 1}
                  onChange={(event) => handleUpdate(rate.id, 'overtimeX', Number(event.target.value))}
                />
              </Field>
              <Field label={t('rates.nightX')}>
                <input
                  type="number"
                  value={rate.nightX ?? 1}
                  onChange={(event) => handleUpdate(rate.id, 'nightX', Number(event.target.value))}
                />
              </Field>
              <Field label={t('rates.weekendX')}>
                <input
                  type="number"
                  value={rate.weekendX ?? 1}
                  onChange={(event) => handleUpdate(rate.id, 'weekendX', Number(event.target.value))}
                />
              </Field>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
