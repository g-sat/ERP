import * as z from "zod"

export const categorySchema = z.object({
  categoryId: z.number().optional(),
  categoryName: z
    .string()
    .min(1, { message: "category name must be at least 1 characters" })
    .max(150, { message: "category name cannot exceed 150 characters" }),
  categoryCode: z
    .string()
    .min(1, { message: "category code is required" })
    .max(50, { message: "category code cannot exceed 50 characters" }),

  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type CategorySchemaType = z.infer<typeof categorySchema>

export const categoryFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type CategoryFiltersValues = z.infer<typeof categoryFiltersSchema>
