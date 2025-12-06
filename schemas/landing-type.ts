import * as z from "zod"

export const landingTypeSchema = z.object({
  landingTypeId: z.number(),
  landingTypeCode: z
    .string()
    .min(1, { message: "landing type code is required" })
    .max(50, { message: "landing type code cannot exceed 50 characters" }),
  landingTypeName: z
    .string()
    .min(2, { message: "landing type name must be at least 2 characters" })
    .max(150, { message: "landing type name cannot exceed 150 characters" }),

  seqNo: z.number().min(0, { message: "landing type order is required" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type LandingTypeSchemaType = z.infer<typeof landingTypeSchema>

export const landingTypeFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type LandingTypeFiltersValues = z.infer<typeof landingTypeFiltersSchema>

