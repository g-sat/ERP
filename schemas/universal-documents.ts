import { z } from "zod"

// Schema for UniversalDocumentsDt
export const universalDocumentDtSchema = z.object({
  documentId: z.number().int().min(0), // Allow 0 for new documents, positive for existing
  docTypeId: z.number().int().min(0).max(255),
  versionNo: z.number().int().min(0),
  documentNo: z.string().max(100).nullable(),
  issueOn: z
    .union([z.string().date(), z.string().length(0), z.null()])
    .nullable(), // Handle empty strings and null
  validFrom: z
    .union([z.string().date(), z.string().length(0), z.null()])
    .nullable(),
  expiryOn: z
    .union([z.string().date(), z.string().length(0), z.null()])
    .nullable(),
  filePath: z.string().max(1000).nullable(),
  remarks: z.string().max(500).nullable(),
  renewalRequired: z.boolean(),
})

export type UniversalDocumentDtSchemaType = z.infer<
  typeof universalDocumentDtSchema
>

// Schema for UniversalDocumentsHd
export const universalDocumentHdSchema = z.object({
  documentId: z.number().int().min(0), // Allow 0 for new documents, positive for existing
  entityTypeId: z.number().int().min(1, "Entity Type is required"), // tinyint, require at least 1
  entity: z.string().min(1, "Entity is required"), // bigint, require non-empty string
  documentName: z.string().max(100).nullable(),
  isActive: z.boolean(),
})

export type UniversalDocumentHdSchemaType = z.infer<
  typeof universalDocumentHdSchema
>
