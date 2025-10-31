import Dexie, { Table } from 'dexie';
import { useEffect } from 'react';
import { create } from 'zustand';
import type { Holiday, Person, Project, Rate, Settings, Shift } from './types';

export class TabelDB extends Dexie {
  persons!: Table<Person>;
  rates!: Table<Rate>;
  projects!: Table<Project>;
  shifts!: Table<Shift>;
  settings!: Table<Settings>;
  holidays!: Table<Holiday>;
}

export const db = new TabelDB('tabel');

db.version(1).stores({
  persons: 'id, active',
  rates: 'id',
  projects: 'id, active',
  shifts: 'id, personId, start, end',
  settings: 'id',
  holidays: 'id, dateISO'
});

db.version(2).upgrade(async (tx) => {
  await tx
    .table<Shift>('shifts')
    .toCollection()
    .modify((shift) => {
      if (shift.breaksMin === undefined) {
        shift.breaksMin = 0;
      }
    });
});

export async function getAll<T>(table: Table<T>): Promise<T[]> {
  return table.toArray();
}

export async function getById<T extends { id: string }>(table: Table<T>, id: string): Promise<T | undefined> {
  return table.get(id);
}

export async function putItem<T extends { id: string }>(table: Table<T>, item: T): Promise<void> {
  await table.put(item);
}

export async function updateItem<T extends { id: string }>(
  table: Table<T>,
  id: string,
  changes: Partial<T>
): Promise<void> {
  await table.update(id, changes);
}

export async function deleteItem<T extends { id: string }>(table: Table<T>, id: string): Promise<void> {
  await table.delete(id);
}

export async function bulkPutItems<T extends { id: string }>(table: Table<T>, items: T[]): Promise<void> {
  if (items.length === 0) {
    return;
  }
  await table.bulkPut(items);
}

interface DBReadyState {
  ready: boolean;
  error?: Error;
  init: () => Promise<void>;
}

const useDBReadyStore = create<DBReadyState>((set, get) => ({
  ready: false,
  init: async () => {
    if (get().ready) {
      return;
    }
    try {
      await db.open();
      set({ ready: true, error: undefined });
    } catch (error) {
      set({ error: error as Error });
      throw error;
    }
  }
}));

export function useDBReady(): { ready: boolean; error?: Error } {
  const ready = useDBReadyStore((state) => state.ready);
  const error = useDBReadyStore((state) => state.error);
  const init = useDBReadyStore((state) => state.init);

  useEffect(() => {
    void init();
  }, [init]);

  return { ready, error };
}
