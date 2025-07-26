import { z } from "zod"

export const glPeriodCloseSchema = z.object({
  companyId: z.number().int().min(0),
  finYear: z.number().int(),
  finMonth: z.number().int().min(1).max(12),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date))),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date))),
  isArClose: z.boolean(),
  arCloseById: z.number().int().optional(),
  arCloseDate: z.string().optional(),
  isApClose: z.boolean(),
  apCloseById: z.number().int().optional(),
  apCloseDate: z.string().optional(),
  isCbClose: z.boolean(),
  cbCloseById: z.number().int().optional(),
  cbCloseDate: z.string().optional(),
  isGlClose: z.boolean(),
  glCloseById: z.number().int().optional(),
  glCloseDate: z.string().optional(),
})
