import * as z from "zod"

export const jobStatusSchema = z.object({
  jobStatusId: z.number(),
  jobStatusCode: z
    .string()
    .min(1, { message: "job status code is required" })
    .max(50, { message: "job status code cannot exceed 50 characters" }),
  jobStatusName: z
    .string()
    .min(2, { message: "job status name must be at least 2 characters" })
    .max(150, { message: "job status name cannot exceed 150 characters" }),

  seqNo: z.number().min(0, { message: "job status order is required" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type JobStatusSchemaType = z.infer<typeof jobStatusSchema>

export const jobStatusFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type JobStatusFiltersValues = z.infer<typeof jobStatusFiltersSchema>

