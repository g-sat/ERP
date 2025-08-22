import { z } from "zod"

// Schema for UniversalDocumentsDt
export const universalDocumentDtSchema = z.object({
  documentId: z.number().int().positive(),
  docTypeId: z.number().int().min(0).max(255),
  versionNo: z.number().int().min(1),
  documentNo: z.string().max(100).nullable(),
  issueOn: z.string().date().nullable(), // ISO date string
  validFrom: z.string().date().nullable(),
  expiryOn: z.string().date().nullable(),
  filePath: z.string().max(1000).nullable(),
  fileType: z.string().nullable(),
  remarks: z.string().max(500).nullable(),
  renewalRequired: z.boolean(),
})

export type UniversalDocumentDtFormValues = z.infer<
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

export type UniversalDocumentHdFormValues = z.infer<
  typeof universalDocumentHdSchema
>
