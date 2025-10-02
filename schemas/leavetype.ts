import * as z from "zod"

export const leaveTypeSchema = z.object({
  leaveTypeId: z.number(),
  leaveTypeCode: z
    .string()
    .min(1, { message: "leave type code is required" })
    .max(50, { message: "leave type code cannot exceed 50 characters" }),
  leaveTypeName: z
    .string()
    .min(2, { message: "leave type name must be at least 2 characters" })
    .max(150, { message: "leave type name cannot exceed 150 characters" }),

  isActive: z.boolean(),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
})

export type LeaveTypeSchemaType = z.infer<typeof leaveTypeSchema>

export const leaveTypeFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type LeaveTypeFiltersValues = z.infer<typeof leaveTypeFiltersSchema>
