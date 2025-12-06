import * as z from "zod"

export const carrierSchema = z.object({
  carrierId: z.number(),
  carrierCode: z
    .string()
    .min(1, { message: "carrier code is required" })
    .max(50, { message: "carrier code cannot exceed 50 characters" }),
  carrierName: z
    .string()
    .min(2, { message: "carrier name must be at least 2 characters" })
    .max(150, { message: "carrier name cannot exceed 150 characters" }),

  seqNo: z.number().min(0, { message: "carrier order is required" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type CarrierSchemaType = z.infer<typeof carrierSchema>

export const carrierFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type CarrierFiltersValues = z.infer<typeof carrierFiltersSchema>

