import * as z from "zod"

export const cargoTypeSchema = z.object({
  cargoTypeId: z.number(),
  cargoTypeCode: z
    .string()
    .min(1, { message: "cargo type code is required" })
    .max(50, { message: "cargo type code cannot exceed 50 characters" }),
  cargoTypeName: z
    .string()
    .min(2, { message: "cargo type name must be at least 2 characters" })
    .max(150, { message: "cargo type name cannot exceed 150 characters" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type CargoTypeSchemaType = z.infer<typeof cargoTypeSchema>

export const cargoTypeFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type CargoTypeFiltersValues = z.infer<typeof cargoTypeFiltersSchema>
