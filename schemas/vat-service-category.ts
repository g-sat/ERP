import * as z from "zod"

export const vatServiceCategorySchema = z.object({
  serviceCategoryId: z.number(),
  serviceCategoryCode: z
    .string()
    .min(1, { message: "service category code is required" })
    .max(50, { message: "service category code cannot exceed 50 characters" }),
  serviceCategoryName: z
    .string()
    .min(2, { message: "service category name must be at least 2 characters" })
    .max(150, {
      message: "service category name cannot exceed 150 characters",
    }),
  seqNo: z.number().min(0, { message: "service category order is required" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type VATServiceCategorySchemaType = z.infer<
  typeof vatServiceCategorySchema
>

export const vatServiceCategoryFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type VATServiceCategoryFiltersValues = z.infer<
  typeof vatServiceCategoryFiltersSchema
>
