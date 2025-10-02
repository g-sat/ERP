import * as z from "zod"

const baseCoaCategorySchema = z.object({
  coaCategoryId: z.number().min(0, { message: "Category ID is required" }),
  coaCategoryCode: z
    .string()
    .min(1, { message: "Category code is required" })
    .max(50, { message: "Category code cannot exceed 50 characters" }),
  coaCategoryName: z
    .string()
    .min(2, { message: "Category name must be at least 2 characters" })
    .max(150, { message: "Category name cannot exceed 150 characters" }),
  seqNo: z.number().min(0, { message: "Sequence number is required" }),
  isActive: z.boolean(),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional()
    ,
})

export const coaCategory1Schema = baseCoaCategorySchema.extend({})
export const coaCategory2Schema = baseCoaCategorySchema.extend({})
export const coaCategory3Schema = baseCoaCategorySchema.extend({})

export type CoaCategory1SchemaType = z.infer<typeof coaCategory1Schema>
export type CoaCategory2SchemaType = z.infer<typeof coaCategory2Schema>
export type CoaCategory3SchemaType = z.infer<typeof coaCategory3Schema>
