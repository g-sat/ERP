import * as z from "zod"

export const taxSchema = z.object({
  taxId: z.number(),

  taxCode: z.string().min(1, { message: "Tax code is required" }).max(50),
  taxName: z
    .string()
    .min(2, { message: "Tax name must be at least 2 characters" })
    .max(150),
  taxCategoryId: z.number(),
  taxCategoryCode: z.string().max(50),
  taxCategoryName: z.string().max(150),

  isActive: z.boolean().default(true),
  remarks: z.string().max(255).optional(),
})

export type TaxFormValues = z.infer<typeof taxSchema>

export const taxFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type TaxFiltersValues = z.infer<typeof taxFiltersSchema>

export const taxDtSchema = z.object({
  taxId: z.number(),

  taxPercentage: z
    .number()
    .min(0, { message: "Percentage must be non-negative" }),
  validFrom: z.union([z.string(), z.date()]).nullable(),
})

export type TaxDtFormValues = z.infer<typeof taxDtSchema>

export const taxDtFiltersSchema = z.object({
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type TaxDtFiltersValues = z.infer<typeof taxDtFiltersSchema>

export const taxCategorySchema = z.object({
  taxCategoryId: z.number(),

  taxCategoryCode: z.string().max(50),
  taxCategoryName: z.string().max(150),
  isActive: z.boolean().default(true),
  remarks: z.string().max(255).optional(),
})

export type TaxCategoryFormValues = z.infer<typeof taxCategorySchema>

export const taxCategoryFiltersSchema = z.object({
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type TaxCategoryFiltersValues = z.infer<typeof taxCategoryFiltersSchema>
