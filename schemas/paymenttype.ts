import * as z from "zod"

export const paymentTypeSchema = z.object({
  paymentTypeId: z.number(),

  paymentTypeCode: z
    .string()
    .min(1, { message: "payment type code is required" })
    .max(50, { message: "payment type code cannot exceed 50 characters" }),
  paymentTypeName: z
    .string()
    .min(2, { message: "payment type name must be at least 2 characters" })
    .max(150, { message: "payment type name cannot exceed 150 characters" }),

  isActive: z.boolean(),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
})

export type PaymentTypeSchemaType = z.infer<typeof paymentTypeSchema>

export const paymentTypeFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type PaymentTypeFiltersValues = z.infer<typeof paymentTypeFiltersSchema>
