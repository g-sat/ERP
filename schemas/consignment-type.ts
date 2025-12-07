import * as z from "zod"

export const consignmentTypeSchema = z.object({
  consignmentTypeId: z.number(),
  consignmentTypeCode: z
    .string()
    .min(1, { message: "consignment type code is required" })
    .max(50, { message: "consignment type code cannot exceed 50 characters" }),
  consignmentTypeName: z
    .string()
    .min(2, { message: "consignment type name must be at least 2 characters" })
    .max(150, { message: "consignment type name cannot exceed 150 characters" }),

  seqNo: z.number().min(0, { message: "consignment type order is required" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type ConsignmentTypeSchemaType = z.infer<typeof consignmentTypeSchema>

export const consignmentTypeFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type ConsignmentTypeFiltersValues = z.infer<typeof consignmentTypeFiltersSchema>

