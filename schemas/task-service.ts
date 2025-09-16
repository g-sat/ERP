import { z } from "zod"

const serviceFieldSchema = z.object({
  taskId: z.number().min(1, "Task is required"),
  chargeId: z.number().min(1, "Charge is required"),
  glId: z.number().min(1, "GL Account is required"),
  uomId: z.number().min(1, "UOM is required"),
  carrierTypeId: z.number().optional().default(0),
  modeTypeId: z.number().optional().default(0),
  documentTypeId: z.number().optional().default(0),
})

export const taskServiceFormSchema = z.object({
  services: z.record(z.string(), serviceFieldSchema),
})

export type TaskServiceFormValues = z.infer<typeof taskServiceFormSchema>
