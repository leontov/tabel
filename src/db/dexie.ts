import Dexie, { Table } from 'dexie';
import { Employee, ExportJob, OvertimePolicy, Payout, RatePlan, Shift, Site, TimeEntry } from '../domain/models';

const schemaV1 = {
  employees: 'id, fullName, active, ratePlanId',
  ratePlans: 'id, currency',
  sites: 'id, name, timezone',
  shifts: 'id, date, employeeId, siteId, status, [employeeId+date], [siteId+date]',
  timeEntries: 'id, shiftId',
  overtimePolicies: 'id',
  payouts: 'id, employeeId, periodStart, periodEnd',
  exportJobs: 'id, type, status, createdAt'
};

const schemaV2 = {
  ...schemaV1,
  timeEntries: 'id, shiftId, task'
};

export class TabelDexie extends Dexie {
  employees!: Table<Employee, string>;
  ratePlans!: Table<RatePlan, string>;
  sites!: Table<Site, string>;
  shifts!: Table<Shift, string>;
  timeEntries!: Table<TimeEntry, string>;
  overtimePolicies!: Table<OvertimePolicy, string>;
  payouts!: Table<Payout, string>;
  exportJobs!: Table<ExportJob, string>;

  constructor() {
    super('tabel-db');
    this.version(1).stores(schemaV1);

    this.version(2)
      .stores(schemaV2)
      .upgrade(() => {
        // demo migration placeholder
      });
  }
}

export const db = new TabelDexie();
