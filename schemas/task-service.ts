import { z } from "zod"

const serviceFieldSchema = z.object({
  chargeId: z.number().min(1, "Charge is required"),
  glId: z.number().min(1, "GL Account is required"),
  uomId: z.number().min(1, "UOM is required"),
  carrierTypeId: z.number().optional(),
  modeTypeId: z.number().optional(),
  documentTypeId: z.number().optional(),
  vesselTypeId: z.number().optional(),
  portTypeId: z.number().optional(),
})

export const taskServiceFormSchema = z.object({
  services: z.record(z.string(), serviceFieldSchema),
})

export type TaskServiceFormValues = z.infer<typeof taskServiceFormSchema>
