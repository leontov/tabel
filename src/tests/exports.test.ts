import { describe, expect, it } from 'vitest';
import { buildCsv } from '../features/exports/helpers';

describe('CSV export', () => {
  it('creates localized CSV rows', () => {
    const csv = buildCsv(
      {
        person: 'Сотрудник',
        hours: 'Часы',
        amount: 'Сумма'
      },
      [
        { person: 'Анна', hours: '8.0', amount: '4800.00' },
        { person: 'Иван', hours: '6.5', amount: '3900.00' }
      ]
    );
    expect(csv).toMatchSnapshot();
  });
});
