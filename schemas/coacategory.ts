import * as z from "zod"

const baseCoaCategorySchema = z.object({
  coaCategoryId: z.number().min(0),
  coaCategoryCode: z.string().min(1).max(50),
  coaCategoryName: z.string().min(2).max(150),
  seqNo: z.number().min(0),
  remarks: z.string().max(255).optional(),
  isActive: z.boolean().default(true),
})

export const coaCategory1Schema = baseCoaCategorySchema.extend({})
export const coaCategory2Schema = baseCoaCategorySchema.extend({})
export const coaCategory3Schema = baseCoaCategorySchema.extend({})

export type CoaCategory1FormValues = z.infer<typeof coaCategory1Schema>
export type CoaCategory2FormValues = z.infer<typeof coaCategory2Schema>
export type CoaCategory3FormValues = z.infer<typeof coaCategory3Schema>
