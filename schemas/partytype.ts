import * as z from "zod"

export const partyTypeSchema = z.object({
  partyTypeId: z.number(),
  partyTypeCode: z
    .string()
    .min(1, { message: "party type code is required" })
    .max(50, { message: "party type code cannot exceed 50 characters" }),
  partyTypeName: z
    .string()
    .min(2, { message: "party type name must be at least 2 characters" })
    .max(150, { message: "party type name cannot exceed 150 characters" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type PartyTypeSchemaType = z.infer<typeof partyTypeSchema>

export const partyTypeFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type PartyTypeFiltersValues = z.infer<typeof partyTypeFiltersSchema>
