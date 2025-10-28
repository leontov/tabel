import { describe, expect, it } from 'vitest';
import { resources } from '../shared/i18n/resources';

function extractKeys(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) {
    return [prefix.replace(/\.$/, '')];
  }
  return Object.entries(obj).flatMap(([key, value]) => extractKeys(value, `${prefix}${key}.`));
}

describe('i18n parity', () => {
  it('ensures ru and en translations have identical keys', () => {
    const ruKeys = extractKeys(resources.ru.translation);
    const enKeys = extractKeys(resources.en.translation);
    expect(new Set(ruKeys)).toEqual(new Set(enKeys));
  });
});
