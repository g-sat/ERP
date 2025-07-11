import * as z from "zod"

export const taskSchema = z.object({
  taskId: z.number().optional(),
  taskName: z
    .string()
    .min(2, { message: "task name must be at least 2 characters" })
    .max(150, { message: "task name cannot exceed 150 characters" }),
  taskCode: z
    .string()
    .min(1, { message: "task code is required" })
    .max(50, { message: "task code cannot exceed 50 characters" }),

  taskOrder: z.number().optional(),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean().default(true),
  isOwn: z.boolean().default(true),
})

export type TaskFormValues = z.infer<typeof taskSchema>

export const taskFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type TaskFiltersValues = z.infer<typeof taskFiltersSchema>
