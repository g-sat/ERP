import * as z from "zod"

export const voyageSchema = z.object({
  voyageId: z.number(),
  voyageNo: z
    .string()
    .min(1, { message: "voyage number is required" })
    .max(50, { message: "voyage number cannot exceed 50 characters" }),
  referenceNo: z
    .string()
    .max(50, { message: "reference number cannot exceed 50 characters" })
    .optional(),
  vesselId: z.number().default(0),
  bargeId: z.number().default(0),
  isActive: z.boolean().default(true),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
})

export type VoyageFormValues = z.infer<typeof voyageSchema>

export const voyageFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  vesselId: z.number().optional(),
  bargeId: z.number().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type VoyageFiltersValues = z.infer<typeof voyageFiltersSchema>
