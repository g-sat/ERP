import * as z from "zod"

export const productSchema = z.object({
  productId: z.number(),

  productCode: z
    .string()
    .min(1, { message: "product code is required" })
    .max(50, { message: "product code cannot exceed 50 characters" }),
  productName: z
    .string()
    .min(2, { message: "product name must be at least 2 characters" })
    .max(150, { message: "product name cannot exceed 150 characters" }),

  isActive: z.boolean(),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
})

export type ProductSchemaType = z.infer<typeof productSchema>

export const productFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type ProductFiltersValues = z.infer<typeof productFiltersSchema>
