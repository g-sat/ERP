import { z } from "zod"

const serviceFieldSchema = z.object({
  taskId: z.number().min(1, "Task is required"),
  chargeId: z.number().min(1, "Charge is required"),
  glId: z.number().min(1, "GL Account is required"),
  uomId: z.number().min(1, "UOM is required"),
  carrierTypeId: z.number().optional(),
  serviceModeId: z.number().optional(),
  consignmentTypeId: z.number().optional(),
  visaId: z.number().optional(),
  landingTypeId: z.number().optional(),
  statusTypeId: z.number().optional(),
})

export const taskServiceFormSchema = z.object({
  services: z.record(z.string(), serviceFieldSchema),
})

export type TaskServiceSchemaType = z.infer<typeof taskServiceFormSchema>
export type ServiceFieldValues = z.infer<typeof serviceFieldSchema>
