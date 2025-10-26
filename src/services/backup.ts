import { db } from '../db/dexie';

export const exportBackup = async () => {
  const payload = await db.transaction('r', db.tables, async () => {
    const [employees, ratePlans, sites, shifts] = await Promise.all([
      db.employees.toArray(),
      db.ratePlans.toArray(),
      db.sites.toArray(),
      db.shifts.toArray()
    ]);

    return {
      version: 'v1',
      generatedAt: new Date().toISOString(),
      employees,
      ratePlans,
      sites,
      shifts
    };
  });

  return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
};

export const importBackup = async (file: File) => {
  const text = await file.text();
  const payload = JSON.parse(text);
  await db.transaction('rw', db.tables, async () => {
    await Promise.all([
      db.employees.clear(),
      db.ratePlans.clear(),
      db.sites.clear(),
      db.shifts.clear()
    ]);

    await db.employees.bulkPut(payload.employees ?? []);
    await db.ratePlans.bulkPut(payload.ratePlans ?? []);
    await db.sites.bulkPut(payload.sites ?? []);
    await db.shifts.bulkPut(payload.shifts ?? []);
  });
};
