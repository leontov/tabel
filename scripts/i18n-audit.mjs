import fg from 'fast-glob';
import { readFile } from 'node:fs/promises';
import en from '../src/shared/i18n/en.json' assert { type: 'json' };
import ru from '../src/shared/i18n/ru.json' assert { type: 'json' };

function flatten(obj, prefix = '') {
  if (typeof obj !== 'object' || obj === null) {
    return [prefix.replace(/\.$/, '')];
  }
  return Object.entries(obj).flatMap(([key, value]) => flatten(value, `${prefix}${key}.`));
}

const enKeys = new Set(flatten(en));
const ruKeys = new Set(flatten(ru));

const parityDiff = [
  ...Array.from(enKeys).filter((key) => !ruKeys.has(key)).map((key) => `Missing ru key: ${key}`),
  ...Array.from(ruKeys).filter((key) => !enKeys.has(key)).map((key) => `Missing en key: ${key}`)
];

const files = await fg('src/**/*.{ts,tsx}', { ignore: ['src/tests/**'] });
const usedKeys = new Set();
const keyPattern = /t\(\s*['\"]([^'\"]+)['\"]/g;

for (const file of files) {
  const content = await readFile(file, 'utf8');
  let match;
  while ((match = keyPattern.exec(content)) !== null) {
    usedKeys.add(match[1]);
  }
}

const missing = Array.from(usedKeys).filter((key) => !enKeys.has(key) || !ruKeys.has(key));

if (parityDiff.length > 0 || missing.length > 0) {
  [...parityDiff, ...missing.map((key) => `Missing translation for key: ${key}`)].forEach((line) => {
    console.error(line);
  });
  process.exit(1);
}

console.log('i18n audit passed.');
