import type { Settings } from '../../entities/types';

export const DEFAULT_SETTINGS: Settings = {
  id: 'app',
  locale: 'ru',
  nightStart: '22:00',
  nightEnd: '06:00',
  overtimeThresholdMin: 480,
  onboarded: false,
  lastBackupAt: undefined,
  quickFilter: 'week'
};

export const STORAGE_KEYS = {
  onboarding: 'tabel:onboarding'
} as const;
