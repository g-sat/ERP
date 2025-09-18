import * as z from "zod"

export const chargeSchema = z.object({
  chargeId: z.number(),
  chargeCode: z
    .string()
    .min(1, { message: "charge code is required" })
    .max(50, { message: "charge code cannot exceed 50 characters" }),
  chargeName: z
    .string()
    .min(2, { message: "charge name must be at least 2 characters" })
    .max(200, { message: "charge name cannot exceed 200 characters" }),

  taskId: z.number().min(1, { message: "task is required" }),
  chargeOrder: z.number().min(0, { message: "charge order is required" }),
  itemNo: z.number().min(0, { message: "item no is required" }),
  glId: z.number().min(1, { message: "gl account is required" }),
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
