import * as z from "zod"

export const credittermSchema = z.object({
  creditTermId: z.number(),
  creditTermCode: z
    .string()
    .min(1, { message: "credit term code is required" })
    .max(50, { message: "credit term code cannot exceed 50 characters" }),
  creditTermName: z
    .string()
    .min(2, { message: "credit term name must be at least 2 characters" })
    .max(150, { message: "credit term name cannot exceed 150 characters" }),

  noDays: z.number().min(0, { message: "days must be a positive number" }),

  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type CreditTermSchemaType = z.infer<typeof credittermSchema>

export const credittermFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  region: z.string().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type CreditTermFiltersValues = z.infer<typeof credittermFiltersSchema>

export const credittermDtSchema = z.object({
  creditTermId: z.number().min(1, { message: "Credit Term is required" }),

  fromDay: z
    .number()
    .int()
    .min(0, { message: "From Day must be a positive number" })
    .max(255),
  toDay: z
    .number()
    .int()
    .min(0, { message: "To Day must be a positive number" })
    .max(255),
  dueDay: z
    .number()
    .int()
    .min(0, { message: "Due Day must be a positive number" })
    .max(255),
  noMonth: z
    .number()
    .int()
    .min(0, { message: "No Month must be a positive number" })
    .max(255),
  isEndOfMonth: z.boolean(),
})

export type CreditTermDtSchemaType = z.infer<typeof credittermDtSchema>

export const credittermDtFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  region: z.string().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type CreditTermDtFiltersValues = z.infer<
  typeof credittermDtFiltersSchema
>
