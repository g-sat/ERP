import { z } from "zod"

export const accountSetupSchema = z.object({
  accSetupCode: z.string().min(1, { message: "Code is required" }),
  accSetupName: z.string().min(1, { message: "Name is required" }),
  accSetupId: z.number().min(0, { message: "ID must be 0 or greater" }),
  accSetupCategoryId: z.number().min(1, { message: "Category is required" }),
  isActive: z.boolean(),
  remarks: z.string().optional(),
})

export type AccountSetupSchemaType = z.infer<typeof accountSetupSchema>

export const accountSetupFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type AccountSetupFiltersValues = z.infer<
  typeof accountSetupFiltersSchema
>

export const accountSetupCategorySchema = z.object({
  accSetupCategoryId: z.number().min(1, { message: "Category is required" }),
  accSetupCategoryCode: z.string().min(1, { message: "Code is required" }),
  accSetupCategoryName: z.string().min(1, { message: "Name is required" }),
  isActive: z.boolean(),
  remarks: z.string().optional(),
})

export type AccountSetupCategorySchemaType = z.infer<
  typeof accountSetupCategorySchema
>

export const accountSetupCategoryFiltersSchema = z.object({
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type AccountSetupCategoryFiltersValues = z.infer<
  typeof accountSetupCategoryFiltersSchema
>

export const accountSetupDtSchema = z.object({
  accSetupId: z.number().min(1, { message: "Account Setup is required" }),
  currencyId: z.number().min(1, { message: "Currency is required" }),
  glId: z.number().min(1, { message: "GL is required" }),
  applyAllCurr: z.boolean(),
})

export type AccountSetupDtSchemaType = z.infer<typeof accountSetupDtSchema>

export const accountSetupDtFiltersSchema = z.object({
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type AccountSetupDtFiltersValues = z.infer<
  typeof accountSetupDtFiltersSchema
>
