import * as z from "zod"

export const orderTypeSchema = z.object({
  orderTypeId: z.number(),

  orderTypeCode: z
    .string()
    .min(1, { message: "Order type code is required" })
    .max(50),
  orderTypeName: z
    .string()
    .min(2, { message: "Order type name must be at least 2 characters" })
    .max(150),
  orderTypeCategoryId: z.number(),
  orderTypeCategoryCode: z.string().max(50),
  orderTypeCategoryName: z.string().max(150),

  isActive: z.boolean(),
  remarks: z.string().max(255).optional(),
})

export type OrderTypeSchemaType = z.infer<typeof orderTypeSchema>

export const orderTypeFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type OrderTypeFiltersValues = z.infer<typeof orderTypeFiltersSchema>

export const orderTypeCategorySchema = z.object({
  orderTypeCategoryId: z.number(),

  orderTypeCategoryCode: z.string().max(50),
  orderTypeCategoryName: z.string().max(150),
  createById: z.number(),
  editById: z.number(),
  createBy: z.string(),
  editBy: z.string().nullable(),
  createDate: z.union([z.string(), z.date()]),
  editDate: z.union([z.string(), z.date()]).nullable(),
  isActive: z.boolean(),
  remarks: z.string().max(255).optional(),
})

export type OrderTypeCategorySchemaType = z.infer<
  typeof orderTypeCategorySchema
>

export const orderTypeCategoryFiltersSchema = z.object({
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type OrderTypeCategoryFiltersValues = z.infer<
  typeof orderTypeCategoryFiltersSchema
>
