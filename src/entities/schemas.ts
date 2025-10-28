import { z } from 'zod';

export const idSchema = z.string().min(1, 'id.required');

export const personSchema = z.object({
  id: idSchema,
  name: z.string().min(1, 'person.name.required'),
  role: z.string().optional(),
  rateId: z.string().optional(),
  active: z.boolean()
});

export const rateSchema = z.object({
  id: idSchema,
  title: z.string().min(1, 'rate.title.required'),
  basePerHour: z.number().nonnegative('rate.base.positive'),
  overtimeX: z.number().positive('rate.overtime.positive').optional(),
  nightX: z.number().positive('rate.night.positive').optional(),
  weekendX: z.number().positive('rate.weekend.positive').optional()
});

export const projectSchema = z.object({
  id: idSchema,
  title: z.string().min(1, 'project.title.required'),
  active: z.boolean()
});

export const shiftSchema = z.object({
  id: idSchema,
  personId: idSchema,
  projectId: idSchema.optional(),
  start: z.string().min(1, 'shift.start.required'),
  end: z.string().optional(),
  breaksMin: z.number().min(0, 'shift.breaks.nonnegative').optional(),
  notes: z.string().optional(),
  minutesTotal: z.number().nonnegative().optional(),
  minutesOvertime: z.number().nonnegative().optional(),
  minutesNight: z.number().nonnegative().optional(),
  amount: z.number().nonnegative().optional()
});

export const settingsSchema = z.object({
  id: z.literal('app'),
  locale: z.union([z.literal('ru'), z.literal('en')]),
  nightStart: z.string().regex(/^\d{2}:\d{2}$/),
  nightEnd: z.string().regex(/^\d{2}:\d{2}$/),
  overtimeThresholdMin: z.number().nonnegative('settings.overtimeThreshold.nonnegative'),
  onboarded: z.boolean().optional(),
  lastBackupAt: z.number().nonnegative().optional(),
  quickFilter: z.enum(['today', 'week', 'month', 'custom']).optional()
});

export const holidaySchema = z.object({
  id: idSchema,
  dateISO: z.string().min(1, 'holiday.date.required'),
  multiplier: z.number().positive('holiday.multiplier.positive')
});

export type PersonInput = z.infer<typeof personSchema>;
export type RateInput = z.infer<typeof rateSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type ShiftInput = z.infer<typeof shiftSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type HolidayInput = z.infer<typeof holidaySchema>;
