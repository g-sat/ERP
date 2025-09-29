import * as z from "zod"

export const entityTypeSchema = z.object({
  entityTypeId: z.number(),
  entityTypeCode: z
    .string()
    .min(1, { message: "entity type code is required" })
    .max(50, { message: "entity type code cannot exceed 50 characters" }),
  entityTypeName: z
    .string()
    .min(2, { message: "entity type name must be at least 2 characters" })
    .max(150, { message: "entity type name cannot exceed 150 characters" }),
})

export type EntityTypeSchemaType = z.infer<typeof entityTypeSchema>

export const entityTypeFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type EntityTypeFiltersValues = z.infer<typeof entityTypeFiltersSchema>
