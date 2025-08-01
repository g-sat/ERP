import * as z from "zod"

export const subcategorySchema = z.object({
  subcategoryId: z.number().optional(),
  subcategoryName: z
    .string()
    .min(2, { message: "subcategory name must be at least 2 characters" })
    .max(150, { message: "subcategory name cannot exceed 150 characters" }),
  subcategoryCode: z
    .string()
    .min(1, { message: "subcategory code is required" })
    .max(50, { message: "subcategory code cannot exceed 50 characters" }),

  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean().default(true),
  isOwn: z.boolean().default(true),
})

export type SubCategoryFormValues = z.infer<typeof subcategorySchema>

export const subcategoryFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type SubCategoryFiltersValues = z.infer<typeof subcategoryFiltersSchema>
