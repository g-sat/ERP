import * as z from "zod"

export const loanTypeSchema = z.object({
  loanTypeId: z.number(),
  loanTypeCode: z
    .string()
    .min(1, { message: "loan type code is required" })
    .max(50, { message: "loan type code cannot exceed 50 characters" }),
  loanTypeName: z
    .string()
    .min(2, { message: "loan type name must be at least 2 characters" })
    .max(150, { message: "loan type name cannot exceed 150 characters" }),
  interestRatePct: z.number().min(0).max(100),
  maxTermMonths: z.number().int().positive(),
  minTermMonths: z.number().int().positive(),
})

export type LoanTypeSchemaType = z.infer<typeof loanTypeSchema>

export const loanTypeFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type LoanTypeFiltersValues = z.infer<typeof loanTypeFiltersSchema>
