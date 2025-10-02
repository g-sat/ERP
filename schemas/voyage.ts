import * as z from "zod"

export const voyageSchema = z.object({
  voyageId: z.number().min(0, { message: "voyage id is required" }),
  voyageNo: z
    .string()
    .min(2, { message: "voyage number is required" })
    .max(50, { message: "voyage number cannot exceed 50 characters" }),
  referenceNo: z
    .string()
    .min(2, { message: "reference number is required" })
    .max(100, { message: "reference number cannot exceed 100 characters" }),
  vesselId: z.number().min(1, { message: "vessel id is required" }),
  bargeId: z.number().min(1, { message: "barge id is required" }),
  isActive: z.boolean(),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional()
    ,
})

export type VoyageSchemaType = z.infer<typeof voyageSchema>

export const voyageFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  vesselId: z.number().optional(),
  bargeId: z.number().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type VoyageFiltersValues = z.infer<typeof voyageFiltersSchema>
