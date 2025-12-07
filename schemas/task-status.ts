import * as z from "zod"

export const taskStatusSchema = z.object({
  taskStatusId: z.number(),
  taskStatusCode: z
    .string()
    .min(1, { message: "task status code is required" })
    .max(50, { message: "task status code cannot exceed 50 characters" }),
  taskStatusName: z
    .string()
    .min(2, { message: "task status name must be at least 2 characters" })
    .max(150, { message: "task status name cannot exceed 150 characters" }),

  seqNo: z.number().min(0, { message: "task status order is required" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type TaskStatusSchemaType = z.infer<typeof taskStatusSchema>

export const taskStatusFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type TaskStatusFiltersValues = z.infer<typeof taskStatusFiltersSchema>

