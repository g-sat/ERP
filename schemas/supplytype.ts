import * as z from "zod"

export const supplyTypeSchema = z.object({
  supplyTypeId: z.number(),
  supplyTypeCode: z
    .string()
    .min(1, { message: "supply type code is required" })
    .max(50, { message: "supply type code cannot exceed 50 characters" }),
  supplyTypeName: z
    .string()
    .min(2, { message: "supply type name must be at least 2 characters" })
    .max(150, { message: "supply type name cannot exceed 150 characters" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type SupplyTypeSchemaType = z.infer<typeof supplyTypeSchema>

export const supplyTypeFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type SupplyTypeFiltersValues = z.infer<typeof supplyTypeFiltersSchema>
