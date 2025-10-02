import * as z from "zod"

export const designationSchema = z.object({
  designationId: z.number(),

  designationCode: z
    .string()
    .min(1, { message: "designation code is required" })
    .max(50, { message: "designation code cannot exceed 50 characters" }),
  designationName: z
    .string()
    .min(2, { message: "designation name must be at least 2 characters" })
    .max(150, { message: "designation name cannot exceed 150 characters" }),

  isActive: z.boolean(),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
})

export type DesignationSchemaType = z.infer<typeof designationSchema>

export const designationFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type DesignationFiltersValues = z.infer<typeof designationFiltersSchema>
