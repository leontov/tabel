import { z } from 'zod';

export const BreakSchema = z.object({
  start: z.string(),
  end: z.string(),
  type: z.enum(['lunch', 'rest', 'technical']).default('lunch')
});

export const EmployeeSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  role: z.string().optional(),
  ratePlanId: z.string(),
  active: z.boolean().default(true),
  phone: z.string().optional(),
  notes: z.string().optional()
});

export const RatePlanSchema = z.object({
  id: z.string(),
  currency: z.string().length(3),
  baseRateHourly: z.number().nonnegative(),
  overtimeMultiplierDaily: z.number().min(1).default(1.5),
  overtimeMultiplierWeekly: z.number().min(1).default(1.5),
  nightMultiplier: z.number().min(1).default(1.2),
  weekendMultiplier: z.number().min(1).default(2)
});

export const SiteSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string().optional(),
  timezone: z.string(),
  clientName: z.string().optional(),
  notes: z.string().optional()
});

export const ShiftSchema = z.object({
  id: z.string(),
  date: z.string(),
  siteId: z.string(),
  employeeId: z.string(),
  start: z.string(),
  end: z.string(),
  breaks: z.array(BreakSchema).default([]),
  manualAdjustments: z.string().optional(),
  status: z.enum(['draft', 'approved', 'paid']).default('draft')
});

export const TimeEntrySchema = z.object({
  id: z.string(),
  shiftId: z.string(),
  task: z.string().optional(),
  start: z.string(),
  end: z.string(),
  billable: z.boolean().default(true)
});

export const OvertimePolicySchema = z.object({
  id: z.string(),
  dailyThresholdHours: z.number().min(0).default(8),
  weeklyThresholdHours: z.number().min(0).default(40),
  roundingRule: z.object({
    unit: z.enum(['5m', '10m', '15m']).default('15m'),
    mode: z.enum(['ceil', 'floor', 'nearest']).default('nearest')
  }),
  minBreaks: z
    .array(
      z.object({
        afterHours: z.number().nonnegative(),
        minMinutes: z.number().min(1)
      })
    )
    .default([])
});

export const PayoutSchema = z.object({
  id: z.string(),
  periodStart: z.string(),
  periodEnd: z.string(),
  employeeId: z.string(),
  totalHours: z.number().nonnegative(),
  overtimeHours: z.number().nonnegative(),
  nightHours: z.number().nonnegative(),
  amount: z.number().nonnegative(),
  currency: z.string().length(3),
  generatedAt: z.string()
});

export const ExportJobSchema = z.object({
  id: z.string(),
  type: z.enum(['csv', 'json', 'pdf']),
  periodStart: z.string(),
  periodEnd: z.string(),
  siteId: z.string().optional(),
  employeeId: z.string().optional(),
  status: z.enum(['pending', 'ready', 'error']).default('pending'),
  fileRef: z.string().optional(),
  createdAt: z.string()
});

export type Break = z.infer<typeof BreakSchema>;
export type Employee = z.infer<typeof EmployeeSchema>;
export type RatePlan = z.infer<typeof RatePlanSchema>;
export type Site = z.infer<typeof SiteSchema>;
export type Shift = z.infer<typeof ShiftSchema>;
export type TimeEntry = z.infer<typeof TimeEntrySchema>;
export type OvertimePolicy = z.infer<typeof OvertimePolicySchema>;
export type Payout = z.infer<typeof PayoutSchema>;
export type ExportJob = z.infer<typeof ExportJobSchema>;
