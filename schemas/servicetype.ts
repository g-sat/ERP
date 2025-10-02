import * as z from "zod"

export const serviceTypeSchema = z.object({
  serviceTypeId: z.number(),

  serviceTypeCode: z
    .string()
    .min(1, { message: "Service type code is required" })
    .max(50, { message: "Service type code cannot exceed 50 characters" }),
  serviceTypeName: z
    .string()
    .min(2, { message: "Service type name must be at least 2 characters" })
    .max(150, { message: "Service type name cannot exceed 150 characters" }),
  serviceTypeCategoryId: z
    .number()
    .min(1, { message: "Service type category is required" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type ServiceTypeSchemaType = z.infer<typeof serviceTypeSchema>

export const serviceTypeFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortService: z.enum(["asc", "desc"]).optional(),
})

export type ServiceTypeFiltersValues = z.infer<typeof serviceTypeFiltersSchema>

export const serviceTypeCategorySchema = z.object({
  serviceTypeCategoryId: z.number(),

  serviceTypeCategoryCode: z
    .string()
    .min(1, { message: "Service type category code is required" })
    .max(50, {
      message: "Service type category code cannot exceed 50 characters",
    }),
  serviceTypeCategoryName: z
    .string()
    .min(2, {
      message: "Service type category name must be at least 2 characters",
    })
    .max(150, {
      message: "Service type category name cannot exceed 150 characters",
    }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type ServiceTypeCategorySchemaType = z.infer<
  typeof serviceTypeCategorySchema
>

export const serviceTypeCategoryFiltersSchema = z.object({
  search: z.string().optional(),
  sortService: z.enum(["asc", "desc"]).optional(),
})

export type ServiceTypeCategoryFiltersValues = z.infer<
  typeof serviceTypeCategoryFiltersSchema
>
