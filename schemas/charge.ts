import * as z from "zod"

export const chargeSchema = z.object({
  chargeId: z.number().optional(),
  chargeName: z
    .string()
    .min(2, { message: "charge name must be at least 2 characters" })
    .max(150, { message: "charge name cannot exceed 150 characters" }),
  chargeCode: z
    .string()
    .min(1, { message: "charge code is required" })
    .max(50, { message: "charge code cannot exceed 50 characters" }),

  taskId: z.number(),
  chargeOrder: z.number().optional(),
  itemNo: z.number().optional(),
  glId: z.number().optional(),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean().default(true),
})

export type ChargeFormValues = z.infer<typeof chargeSchema>

export const chargeFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type ChargeFiltersValues = z.infer<typeof chargeFiltersSchema>
