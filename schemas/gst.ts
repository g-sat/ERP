import * as z from "zod"

export const gstSchema = z.object({
  gstId: z.number(),

  gstCode: z.string().min(1, { message: "Gst code is required" }).max(50),
  gstName: z
    .string()
    .min(2, { message: "Gst name must be at least 2 characters" })
    .max(150),
  gstCategoryId: z.number(),
  gstCategoryCode: z.string().max(50),
  gstCategoryName: z.string().max(150),

  isActive: z.boolean().default(true),
  remarks: z.string().max(255).optional(),
})

export type GstFormValues = z.infer<typeof gstSchema>

export const gstFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type GstFiltersValues = z.infer<typeof gstFiltersSchema>

export const gstDtSchema = z.object({
  gstId: z.number(),

  gstPercentage: z
    .number()
    .min(0, { message: "Percentage must be non-negative" }),
  validFrom: z.union([z.string(), z.date()]).nullable(),
})

export type GstDtFormValues = z.infer<typeof gstDtSchema>

export const gstDtFiltersSchema = z.object({
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type GstDtFiltersValues = z.infer<typeof gstDtFiltersSchema>

export const gstCategorySchema = z.object({
  gstCategoryId: z.number(),

  gstCategoryCode: z.string().max(50),
  gstCategoryName: z.string().max(150),
  isActive: z.boolean().default(true),
  remarks: z.string().max(255).optional(),
})

export type GstCategoryFormValues = z.infer<typeof gstCategorySchema>

export const gstCategoryFiltersSchema = z.object({
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type GstCategoryFiltersValues = z.infer<typeof gstCategoryFiltersSchema>
