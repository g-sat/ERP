import * as z from "zod"

// Define templateDtSchema first since it's referenced by templateHdSchema
export const templateDtSchema = z.object({
  templateId: z.number().min(0, "Template ID is required"),
  itemNo: z.number().min(1, "Item no is required"),
  chargeId: z.number().min(1, "Charge is required"),
  chargeName: z.string().optional(),
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional(),
})

export type TemplateDtSchemaType = z.infer<typeof templateDtSchema>

// Define templateHdSchema after templateDtSchema
export const templateHdSchema = z.object({
  templateId: z.number(),
  templateName: z.string().min(1, "Template name is required"),
  taskId: z.number().min(1, "Task is required"),
  chargeId: z.number().min(1, "Charge is required"),
  isActive: z.boolean(),
  editVersion: z.number().min(0, "Edit version must be 0 or greater"),
  // Nested Details
  data_details: z.array(templateDtSchema).optional(),
})

export type TemplateHdSchemaType = z.infer<typeof templateHdSchema>
