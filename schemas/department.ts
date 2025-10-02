import * as z from "zod"

export const departmentSchema = z.object({
  departmentId: z.number(),

  departmentCode: z
    .string()
    .min(1, { message: "department code is required" })
    .max(50, { message: "department code cannot exceed 50 characters" }),
  departmentName: z
    .string()
    .min(2, { message: "department name must be at least 2 characters" })
    .max(150, { message: "department name cannot exceed 150 characters" }),

  isActive: z.boolean(),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
})

export type DepartmentSchemaType = z.infer<typeof departmentSchema>

export const departmentFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type DepartmentFiltersValues = z.infer<typeof departmentFiltersSchema>
