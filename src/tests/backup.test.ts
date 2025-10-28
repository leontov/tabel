import 'fake-indexeddb/auto';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { createHash } from 'node:crypto';
import { db, putItem } from '../entities/db';
import { saveAs } from 'file-saver';
import type { Settings } from '../entities/types';
import { ensureDailyBackup } from '../shared/backup';

vi.mock('file-saver', () => ({
  saveAs: vi.fn()
}));

const FIXED_NOW = new Date('2024-05-05T09:00:00Z');

const baseSettings: Settings = {
  id: 'app',
  locale: 'ru',
  nightStart: '22:00',
  nightEnd: '06:00',
  overtimeThresholdMin: 480,
  onboarded: true,
  lastBackupAt: new Date('2024-05-02T09:00:00Z').getTime()
};

beforeEach(async () => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
  await db.delete();
  await db.open();
  await putItem(db.settings, baseSettings);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('ensureDailyBackup', () => {
  it('skips when backup was created within 24h', async () => {
    await db.settings.put({ ...baseSettings, lastBackupAt: Date.now() });
    const result = await ensureDailyBackup();
    expect(result).toBeUndefined();
    expect(saveAs).not.toHaveBeenCalled();
  });

  it('creates backup and updates timestamp when due', async () => {
    const before = await db.settings.get('app');
    const result = await ensureDailyBackup();
    expect(result).toBeDefined();
    expect(result?.filename).toBe('2024-05-05_backup.json');
    expect(result?.exportedAt).toBe(Date.now());
    expect(saveAs).toHaveBeenCalledTimes(1);

    const call = (saveAs as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
    const blob = call[0] as Blob;
    const filename = call[1] as string;
    expect(filename).toBe('2024-05-05_backup.json');
    const serialized = await blob.text();
    const expectedHash = createHash('sha256').update(serialized).digest('hex');
    expect(result?.hash).toBe(expectedHash);

    const after = await db.settings.get('app');
    expect(after?.lastBackupAt).toBe(Date.now());
    expect(after?.lastBackupAt).toBeGreaterThan(before?.lastBackupAt ?? 0);
  });
});
