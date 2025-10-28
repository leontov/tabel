import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDataStore } from '../../features/data/store';
import { personSchema } from '../../entities/schemas';
import { createId } from '../../shared/lib/id';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Card';
import { Field } from '../../shared/ui/Field';

export function StaffPage() {
  const { t } = useTranslation();
  const { persons, rates, addPerson, updatePerson } = useDataStore((state) => ({
    persons: state.persons,
    rates: state.rates,
    addPerson: state.addPerson,
    updatePerson: state.updatePerson
  }));
  const [form, setForm] = useState({
    name: '',
    role: '',
    rateId: rates[0]?.id ?? '',
    active: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const translateIssue = (issue: { message: string }) => t(`errors.${issue.message}`, issue.message);
  const clearError = (field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const staffFormSchema = personSchema.pick({ name: true, role: true, rateId: true, active: true });

  const handleSubmit = async () => {
    const parsed = staffFormSchema.safeParse({ ...form, rateId: form.rateId || undefined });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const pathKey = issue.path[0] as string;
        nextErrors[pathKey] = translateIssue(issue);
      });
      setErrors(nextErrors);
      return;
    }
    await addPerson({ id: createId(), ...parsed.data });
    setForm({ name: '', role: '', rateId: rates[0]?.id ?? '', active: true });
    setErrors({});
  };

  return (
    <div className="list-stack">
      <Card title={t('staff.title')}>
        <Field label={t('staff.add')} error={errors.name}>
          <input
            value={form.name}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, name: event.target.value }));
              clearError('name');
            }}
          />
        </Field>
        <Field label={t('staff.role')}>
          <input value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))} />
        </Field>
        <Field label={t('staff.defaultRate')} error={errors.rateId}>
          <select
            value={form.rateId}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, rateId: event.target.value }));
              clearError('rateId');
            }}
          >
            {rates.map((rate) => (
              <option key={rate.id} value={rate.id}>
                {rate.title}
              </option>
            ))}
          </select>
        </Field>
        <Button onClick={handleSubmit}>{t('common.save')}</Button>
      </Card>
      {persons.map((person) => (
        <Card key={person.id} title={person.name}>
          <p>{person.role}</p>
          <div className="grid-two">
            <Field label={t('staff.defaultRate')}>
              <select value={person.rateId ?? ''} onChange={(event) => updatePerson(person.id, { rateId: event.target.value })}>
                <option value="">—</option>
                {rates.map((rate) => (
                  <option key={rate.id} value={rate.id}>
                    {rate.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t(person.active ? 'staff.active' : 'staff.inactive')}>
              <input
                type="checkbox"
                checked={person.active}
                onChange={(event) => updatePerson(person.id, { active: event.target.checked })}
              />
            </Field>
          </div>
        </Card>
      ))}
    </div>
  );
}
