import * as z from "zod"

export const gstSchema = z.object({
  gstId: z.number(),

  gstCode: z
    .string()
    .min(1, { message: "Gst code is required" })
    .max(50, { message: "Gst code cannot exceed 50 characters" }),
  gstName: z
    .string()
    .min(2, { message: "Gst name must be at least 2 characters" })
    .max(150, { message: "Gst name cannot exceed 150 characters" }),
  gstCategoryId: z.number().min(1, { message: "Gst category is required" }),
  isActive: z.boolean().default(true),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional()
    .default(""),
})

export type GstFormValues = z.infer<typeof gstSchema>

export const gstFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type GstFiltersValues = z.infer<typeof gstFiltersSchema>

export const gstDtSchema = z.object({
  gstId: z.number().min(1, { message: "Gst is required" }),

  gstPercentage: z
    .number()
    .min(0, { message: "Percentage must be non-negative" }),
  validFrom: z.union([z.string(), z.date()]).refine(
    (val) => {
      // Ensure it's not empty string or invalid date
      if (typeof val === "string") return val.trim().length > 0
      if (val instanceof Date) return !isNaN(val.getTime())
      return false
    },
    { message: "Valid from is required and must be a valid date" }
  ),
})

export type GstDtFormValues = z.infer<typeof gstDtSchema>

export const gstDtFiltersSchema = z.object({
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type GstDtFiltersValues = z.infer<typeof gstDtFiltersSchema>

export const gstCategorySchema = z.object({
  gstCategoryId: z.number(),

  gstCategoryCode: z
    .string()
    .min(1, { message: "Gst category code is required" })
    .max(50, { message: "Gst category code cannot exceed 50 characters" }),
  gstCategoryName: z
    .string()
    .min(1, { message: "Gst category name is required" })
    .max(150, { message: "Gst category name cannot exceed 150 characters" }),
  isActive: z.boolean().default(true),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional()
    .default(""),
})

export type GstCategoryFormValues = z.infer<typeof gstCategorySchema>

export const gstCategoryFiltersSchema = z.object({
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type GstCategoryFiltersValues = z.infer<typeof gstCategoryFiltersSchema>
