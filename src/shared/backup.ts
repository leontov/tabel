import { formatISO } from 'date-fns';
import { saveAs } from 'file-saver';
import { db, getAll, updateItem } from '../entities/db';
import type { Settings } from '../entities/types';

export interface BackupResult {
  hash: string;
  filename: string;
  exportedAt: number;
}

async function computeHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  if (typeof crypto !== 'undefined' && 'subtle' in crypto) {
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }
  const { createHash } = await import('crypto');
  return createHash('sha256').update(Buffer.from(data)).digest('hex');
}

async function exportPayload(): Promise<string> {
  const payload = {
    persons: await getAll(db.persons),
    rates: await getAll(db.rates),
    projects: await getAll(db.projects),
    shifts: await getAll(db.shifts),
    holidays: await getAll(db.holidays),
    settings: await getAll(db.settings)
  };
  return JSON.stringify(payload, null, 2);
}

export async function ensureDailyBackup(): Promise<BackupResult | undefined> {
  const settings = (await db.settings.get('app')) as Settings | undefined;
  if (!settings) {
    return undefined;
  }
  const now = Date.now();
  const lastBackup = settings.lastBackupAt ?? 0;
  const diffHours = (now - lastBackup) / (1000 * 60 * 60);
  if (diffHours < 24) {
    return undefined;
  }
  const content = await exportPayload();
  const hash = await computeHash(content);
  const filename = `${formatISO(new Date(), { representation: 'date' })}_backup.json`;
  saveAs(new Blob([content], { type: 'application/json' }), filename);
  await updateItem(db.settings, 'app', { lastBackupAt: now });
  return { hash, filename, exportedAt: now };
}

export function setupBackupScheduler(): void {
  void ensureDailyBackup();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      void ensureDailyBackup();
    }
  });
}
