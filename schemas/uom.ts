import * as z from "zod"

export const uomSchema = z.object({
  uomId: z.number().min(0, { message: "UOM id is required" }),
  uomCode: z
    .string()
    .min(1, { message: "UOM code is required" })
    .max(50, { message: "UOM code cannot exceed 50 characters" }),
  uomName: z
    .string()
    .min(2, { message: "UOM name must be at least 2 characters" })
    .max(150, { message: "UOM name cannot exceed 150 characters" }),

  isActive: z.boolean().default(true),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional()
    .default(""),
})

export type UomFormValues = z.infer<typeof uomSchema>

export const uomFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type UomFiltersValues = z.infer<typeof uomFiltersSchema>

export const uomDtSchema = z.object({
  uomId: z.number().min(1, { message: "UOM id is required" }),
  packUomId: z.number().min(1, { message: "Pack UOM id is required" }),
  uomFactor: z.number().min(0, { message: "Factor must be non-negative" }),
})

export type UomDtFormValues = z.infer<typeof uomDtSchema>

export const uomDtFiltersSchema = z.object({
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type UomDtFiltersValues = z.infer<typeof uomDtFiltersSchema>

export const uomCategorySchema = z.object({
  uomCategoryId: z.string(),
  uomCategoryCode: z.string().max(50),
  uomCategoryName: z.string().max(150),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
})

export type UomCategoryFormValues = z.infer<typeof uomCategorySchema>

export const uomCategoryFiltersSchema = z.object({
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type UomCategoryFiltersValues = z.infer<typeof uomCategoryFiltersSchema>
