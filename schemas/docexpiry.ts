import * as z from "zod"

export const documentExpirySchema = z.object({
  documentId: z.number().optional(),
  docTypeId: z.number().min(1, "Document type is required"),
  documentName: z
    .string()
    .min(1, "Document name is required")
    .max(255, "Document name cannot exceed 255 characters"),
  filePath: z.string().optional(),
  issueDate: z.union([z.string(), z.date()]).optional(),
  expiryDate: z.union([z.string(), z.date()]).refine((val) => {
    if (!val) return false
    const date = typeof val === "string" ? new Date(val) : val
    return !isNaN(date.getTime())
  }, "Valid expiry date is required"),
  notificationDaysBefore: z
    .number()
    .min(0, "Notification days must be 0 or greater")
    .max(365, "Notification days cannot exceed 365")
    .optional(),
  isExpired: z.boolean(),
  remarks: z
    .string()
    .max(500, "Remarks cannot exceed 500 characters")
    .optional(),
})

export type DocumentExpirySchemaType = z.infer<typeof documentExpirySchema>

export const documentExpiryFiltersSchema = z.object({
  isExpired: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type DocumentExpiryFiltersValues = z.infer<
  typeof documentExpiryFiltersSchema
>
