import * as z from "zod"

export const documentTypeSchema = z.object({
  docTypeId: z.number(),
  docTypeCode: z
    .string()
    .min(1, { message: "document type code is required" })
    .max(50, { message: "document type code cannot exceed 50 characters" }),
  docTypeName: z
    .string()
    .min(2, { message: "document type name must be at least 2 characters" })
    .max(150, { message: "document type name cannot exceed 150 characters" }),

  isActive: z.boolean(),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
})

export type DocumentTypeSchemaType = z.infer<typeof documentTypeSchema>

export const documentTypeFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type DocumentTypeFiltersValues = z.infer<
  typeof documentTypeFiltersSchema
>
