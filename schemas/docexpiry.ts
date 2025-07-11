import * as z from "zod"

export const documentExpirySchema = z.object({
  documentType: z.string().min(1, "Document type is required"),
  documentNumber: z.string().min(1, "Document number is required"),
  issuedDate: z.date({
    required_error: "Issue date is required",
  }),
  expiryDate: z.date({
    required_error: "Expiry date is required",
  }),
  entityName: z.string().min(1, "Entity name is required"),
  entityType: z.enum(["customer", "customer", "employee", "company", "other"], {
    required_error: "Please select an entity type",
  }),
  reminderDays: z.coerce
    .number()
    .min(0, "Reminder days must be a positive number"),
  attachmentPath: z.string().optional(),
  notes: z.string().optional(),
})

export const documentExpiryFilterSchema = z.object({
  documentType: z.string().optional(),
  entityType: z.string().optional(),
  status: z.string().optional(),
  expiryDateFrom: z.date().optional(),
  expiryDateTo: z.date().optional(),
  entityName: z.string().optional(),
})
