export type ID = string;

export interface Person {
  id: ID;
  name: string;
  role?: string;
  rateId?: ID;
  active: boolean;
}

export interface Rate {
  id: ID;
  title: string;
  basePerHour: number;
  overtimeX?: number;
  nightX?: number;
  weekendX?: number;
}

export interface Project {
  id: ID;
  title: string;
  active: boolean;
}

export interface Shift {
  id: ID;
  personId: ID;
  projectId?: ID;
  start: string;
  end?: string;
  breaksMin?: number;
  notes?: string;
  minutesTotal?: number;
  minutesOvertime?: number;
  minutesNight?: number;
  amount?: number;
}

export interface Settings {
  id: 'app';
  locale: 'ru' | 'en';
  nightStart: string;
  nightEnd: string;
  overtimeThresholdMin: number;
  onboarded?: boolean;
  lastBackupAt?: number;
  quickFilter?: 'today' | 'week' | 'month' | 'custom';
}

export interface Holiday {
  id: ID;
  dateISO: string;
  multiplier: number;
}
