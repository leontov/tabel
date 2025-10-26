import { db } from './dexie';
import { createId } from '../utils/uuid';

export const seedDemoData = async () => {
  const employeeCount = await db.employees.count();
  if (employeeCount > 0) return;

  await db.transaction('rw', db.employees, db.ratePlans, db.sites, db.shifts, async () => {
    const ratePlanId = createId();
    await db.ratePlans.put({
      id: ratePlanId,
      currency: 'RUB',
      baseRateHourly: 500,
      overtimeMultiplierDaily: 1.5,
      overtimeMultiplierWeekly: 2,
      nightMultiplier: 1.2,
      weekendMultiplier: 2
    });

    const employeeId = createId();
    await db.employees.put({
      id: employeeId,
      fullName: 'Иван Петров',
      ratePlanId,
      active: true
    });

    const siteId = createId();
    await db.sites.put({
      id: siteId,
      name: 'ЖК “Лесной”',
      timezone: 'Europe/Moscow'
    });

    const shiftId = createId();
    await db.shifts.put({
      id: shiftId,
      date: new Date().toISOString().slice(0, 10),
      siteId,
      employeeId,
      start: '09:00',
      end: '18:00',
      breaks: [],
      status: 'approved'
    });
  });
};
