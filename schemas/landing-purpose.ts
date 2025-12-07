import * as z from "zod"

export const landingPurposeSchema = z.object({
  landingPurposeId: z.number(),
  landingPurposeCode: z
    .string()
    .min(1, { message: "landing purpose code is required" })
    .max(50, { message: "landing purpose code cannot exceed 50 characters" }),
  landingPurposeName: z
    .string()
    .min(2, { message: "landing purpose name must be at least 2 characters" })
    .max(150, { message: "landing purpose name cannot exceed 150 characters" }),

  seqNo: z.number().min(0, { message: "landing purpose order is required" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type LandingPurposeSchemaType = z.infer<typeof landingPurposeSchema>

export const landingPurposeFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type LandingPurposeFiltersValues = z.infer<typeof landingPurposeFiltersSchema>

