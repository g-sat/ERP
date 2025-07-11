import * as z from "zod"

export const serviceTypeSchema = z.object({
  serviceTypeId: z.number(),

  serviceTypeCode: z
    .string()
    .min(1, { message: "Service type code is required" })
    .max(50),
  serviceTypeName: z
    .string()
    .min(2, { message: "Service type name must be at least 2 characters" })
    .max(150),
  serviceTypeCategoryId: z.number(),
  serviceTypeCategoryCode: z.string().max(50),
  serviceTypeCategoryName: z.string().max(150),

  isActive: z.boolean().default(true),
  remarks: z.string().max(255).optional(),
})

export type ServiceTypeFormValues = z.infer<typeof serviceTypeSchema>

export const serviceTypeFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortService: z.enum(["asc", "desc"]).optional(),
})

export type ServiceTypeFiltersValues = z.infer<typeof serviceTypeFiltersSchema>

export const serviceTypeCategorySchema = z.object({
  serviceTypeCategoryId: z.number(),

  serviceTypeCategoryCode: z.string().max(50),
  serviceTypeCategoryName: z.string().max(150),
  createById: z.number(),
  editById: z.number(),
  createBy: z.string(),
  editBy: z.string().nullable(),
  createDate: z.union([z.string(), z.date()]),
  editDate: z.union([z.string(), z.date()]).nullable(),
  isActive: z.boolean().default(true),
  remarks: z.string().max(255).optional(),
})

export type ServiceTypeCategoryFormValues = z.infer<
  typeof serviceTypeCategorySchema
>

export const serviceTypeCategoryFiltersSchema = z.object({
  search: z.string().optional(),
  sortService: z.enum(["asc", "desc"]).optional(),
})

export type ServiceTypeCategoryFiltersValues = z.infer<
  typeof serviceTypeCategoryFiltersSchema
>
