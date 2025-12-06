import * as z from "zod"

export const passTypeSchema = z.object({
  passTypeId: z.number(),
  passTypeCode: z
    .string()
    .min(1, { message: "pass type code is required" })
    .max(50, { message: "pass type code cannot exceed 50 characters" }),
  passTypeName: z
    .string()
    .min(2, { message: "pass type name must be at least 2 characters" })
    .max(150, { message: "pass type name cannot exceed 150 characters" }),

  seqNo: z.number().min(0, { message: "pass type order is required" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type PassTypeSchemaType = z.infer<typeof passTypeSchema>

export const passTypeFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type PassTypeFiltersValues = z.infer<typeof passTypeFiltersSchema>

