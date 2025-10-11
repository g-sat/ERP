import * as z from "zod"

export const subcategorySchema = z.object({
  subCategoryId: z.number().optional(),
  subCategoryName: z
    .string()
    .min(2, { message: "subcategory name must be at least 2 characters" })
    .max(150, { message: "subcategory name cannot exceed 150 characters" }),
  subCategoryCode: z
    .string()
    .min(1, { message: "subcategory code is required" })
    .max(50, { message: "subcategory code cannot exceed 50 characters" }),

  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type SubCategorySchemaType = z.infer<typeof subcategorySchema>

export const subcategoryFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type SubCategoryFiltersValues = z.infer<typeof subcategoryFiltersSchema>
