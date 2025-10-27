import { saveAs } from 'file-saver';

export type CsvHeaders = Record<string, string>;
export type CsvRow = Record<string, string | number | undefined | null>;

export function buildCsv(headers: CsvHeaders, rows: CsvRow[]): string {
  const headerKeys = Object.keys(headers);
  const headerLine = headerKeys.map((key) => escapeValue(headers[key])).join(';');
  const body = rows
    .map((row) => headerKeys.map((key) => escapeValue(row[key])).join(';'))
    .join('\n');
  return [headerLine, body].filter(Boolean).join('\n');
}

function escapeValue(value: string | number | undefined | null): string {
  if (value === undefined || value === null) {
    return '';
  }
  const stringValue = String(value);
  if (stringValue.includes(';') || stringValue.includes('\"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function downloadCsv(filename: string, headers: CsvHeaders, rows: CsvRow[]): void {
  const csv = buildCsv(headers, rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename);
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  saveAs(blob, filename);
}
