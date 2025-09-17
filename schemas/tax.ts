import * as z from "zod"

export const taxSchema = z.object({
  taxId: z.number(),

  taxCode: z
    .string()
    .min(1, { message: "Tax code is required" })
    .max(50, { message: "Tax code cannot exceed 50 characters" }),
  taxName: z
    .string()
    .min(2, { message: "Tax name must be at least 2 characters" })
    .max(150, { message: "Tax name cannot exceed 150 characters" }),
  taxCategoryId: z.number().min(1, { message: "Tax category is required" }),
  isActive: z.boolean().default(true),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional()
    .default(""),
})

export type TaxFormValues = z.infer<typeof taxSchema>

export const taxFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type TaxFiltersValues = z.infer<typeof taxFiltersSchema>

export const taxDtSchema = z.object({
  taxId: z.number().min(1, { message: "Tax is required" }),

  taxPercentage: z
    .number()
    .min(0, { message: "Percentage must be non-negative" }),
  validFrom: z.union([z.string(), z.date()]).refine(
    (val) => {
      // Ensure it's not empty string or invalid date
      if (typeof val === "string") return val.trim().length > 0
      if (val instanceof Date) return !isNaN(val.getTime())
      return false
    },
    { message: "Valid from is required and must be a valid date" }
  ),
})

export type TaxDtFormValues = z.infer<typeof taxDtSchema>

export const taxDtFiltersSchema = z.object({
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type TaxDtFiltersValues = z.infer<typeof taxDtFiltersSchema>

export const taxCategorySchema = z.object({
  taxCategoryId: z.number(),

  taxCategoryCode: z
    .string()
    .min(1, { message: "Tax category code is required" })
    .max(50, { message: "Tax category code cannot exceed 50 characters" }),
  taxCategoryName: z
    .string()
    .min(1, { message: "Tax category name is required" })
    .max(150, { message: "Tax category name cannot exceed 150 characters" }),
  isActive: z.boolean().default(true),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional()
    .default(""),
})

export type TaxCategoryFormValues = z.infer<typeof taxCategorySchema>

export const taxCategoryFiltersSchema = z.object({
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type TaxCategoryFiltersValues = z.infer<typeof taxCategoryFiltersSchema>
