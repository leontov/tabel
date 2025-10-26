import { db } from '../dexie';
import { Shift, ShiftSchema } from '../../domain/models';

export const listShiftsByPeriod = (from: string, to: string) =>
  db.shifts.where('date').between(from, to, true, true).toArray();

export const upsertShift = async (shift: Shift) => {
  const parsed = ShiftSchema.parse(shift);
  await db.shifts.put(parsed);
};

export const removeShift = (id: string) => db.shifts.delete(id);
