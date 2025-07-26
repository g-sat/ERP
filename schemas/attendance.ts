import * as z from "zod"

export const attendanceSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  date: z.string().min(1, "Date is required"),
  status: z.enum(["P", "A", "L", "HL", "CL", "PL", "WK", "REJECTED"], {
    required_error: "Status is required",
  }),
  clockIn: z.string().optional(),
  clockOut: z.string().optional(),
  totalWorkingHours: z.string().optional(),
  earlyOutHours: z.string().optional(),
  lateInHours: z.string().optional(),
  leaveType: z
    .enum([
      "FIRST_HALF",
      "SECOND_HALF",
      "FULL_DAY",
      "CASUAL",
      "PAID",
      "SICK",
      "ANNUAL",
    ])
    .optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  isBiometric: z.boolean().default(false),
  isPhysical: z.boolean().default(false),
  notes: z.string().optional(),
})

export const attendanceFilterSchema = z.object({
  department: z.string().optional(),
  location: z.string().optional(),
  employeeId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: z
    .enum(["P", "A", "L", "HL", "CL", "PL", "WK", "REJECTED"])
    .optional(),
  type: z.enum(["ALL", "BIOMETRIC", "PHYSICAL"]).default("ALL"),
})

export const attendanceBulkUpdateSchema = z.object({
  employeeIds: z
    .array(z.string())
    .min(1, "At least one employee must be selected"),
  date: z.string().min(1, "Date is required"),
  status: z.enum(["P", "A", "L", "HL", "CL", "PL", "WK", "REJECTED"], {
    required_error: "Status is required",
  }),
  clockIn: z.string().optional(),
  clockOut: z.string().optional(),
  notes: z.string().optional(),
})

export type AttendanceFormData = z.infer<typeof attendanceSchema>
export type AttendanceFilterData = z.infer<typeof attendanceFilterSchema>
export type AttendanceBulkUpdateData = z.infer<
  typeof attendanceBulkUpdateSchema
>
