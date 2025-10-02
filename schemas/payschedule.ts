import { z } from "zod"

export const payScheduleSchema = z.object({
  payscheduleId: z.number().int().nonnegative(),
  companyId: z.number().int().min(0).max(255), // tinyint

  workWeek: z.string().max(200).nullable().optional(),
  isMonthly: z.boolean(),
  workingDaysPerMonth: z.number().int().min(0).max(31).nullable().optional(),
  isPayOn: z.boolean(),
  payDayOfMonth: z.number().int().min(1).max(31).nullable().optional(),

  firstPayPeriod: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use yyyy-mm-dd")
    .optional(),

  firstPayDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use yyyy-mm-dd")
    .optional(),

  isLocked: z.boolean(),
})

export type PayScheduleFormData = z.infer<typeof payScheduleSchema>
