import * as z from "zod"

export const leaveSchema = z
  .object({
    employeeId: z.string().min(1, "Employee is required"),
    leaveType: z.enum(
      [
        "CASUAL",
        "SICK",
        "ANNUAL",
        "MATERNITY",
        "PATERNITY",
        "BEREAVEMENT",
        "UNPAID",
        "COMPENSATORY",
        "OTHER",
      ],
      {
        required_error: "Leave type is required",
      }
    ),
    leaveCategory: z.enum(["FULL_DAY", "HALF_DAY", "HOURLY", "MULTIPLE_DAYS"], {
      required_error: "Leave category is required",
    }),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    reason: z
      .string()
      .min(1, "Reason is required")
      .max(500, "Reason must be less than 500 characters"),
    notes: z.string().optional(),
    attachments: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      const startDate = new Date(data.startDate)
      const endDate = new Date(data.endDate)
      return endDate >= startDate
    },
    {
      message: "End date must be after or equal to start date",
      path: ["endDate"],
    }
  )

export const leaveRequestSchema = z
  .object({
    employeeId: z.string().min(1, "Employee is required"),
    leaveType: z.enum(
      [
        "CASUAL",
        "SICK",
        "ANNUAL",
        "MATERNITY",
        "PATERNITY",
        "BEREAVEMENT",
        "UNPAID",
        "COMPENSATORY",
        "OTHER",
      ],
      {
        required_error: "Leave type is required",
      }
    ),
    leaveCategory: z.enum(["FULL_DAY", "HALF_DAY", "HOURLY", "MULTIPLE_DAYS"], {
      required_error: "Leave category is required",
    }),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    reason: z
      .string()
      .min(1, "Reason is required")
      .max(500, "Reason must be less than 500 characters"),
    notes: z.string().optional(),
    attachments: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      const startDate = new Date(data.startDate)
      const endDate = new Date(data.endDate)
      return endDate >= startDate
    },
    {
      message: "End date must be after or equal to start date",
      path: ["endDate"],
    }
  )

export const leaveApprovalSchema = z.object({
  leaveId: z.string().min(1, "Leave ID is required"),
  status: z.enum(["APPROVED", "REJECTED"], {
    required_error: "Approval status is required",
  }),
  comments: z.string().optional(),
})

export const leaveFilterSchema = z.object({
  employeeId: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  leaveType: z
    .enum([
      "CASUAL",
      "SICK",
      "ANNUAL",
      "MATERNITY",
      "PATERNITY",
      "BEREAVEMENT",
      "UNPAID",
      "COMPENSATORY",
      "OTHER",
    ])
    .optional(),
  status: z
    .enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED", "COMPLETED"])
    .optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  approvedBy: z.string().optional(),
})

export const leavePolicySchema = z.object({
  leaveType: z.enum(
    [
      "CASUAL",
      "SICK",
      "ANNUAL",
      "MATERNITY",
      "PATERNITY",
      "BEREAVEMENT",
      "UNPAID",
      "COMPENSATORY",
      "OTHER",
    ],
    {
      required_error: "Leave type is required",
    }
  ),
  name: z.string().min(1, "Policy name is required"),
  description: z.string().optional(),
  defaultDays: z.number().min(0, "Default days must be 0 or greater"),
  maxDays: z.number().min(1, "Maximum days must be at least 1"),
  minDays: z.number().min(0, "Minimum days must be 0 or greater"),
  advanceNoticeDays: z
    .number()
    .min(0, "Advance notice days must be 0 or greater"),
  maxConsecutiveDays: z
    .number()
    .min(1, "Maximum consecutive days must be at least 1"),
  requiresApproval: z.boolean().default(true),
  requiresDocument: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

export const leaveBalanceSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  leaveType: z.enum(
    [
      "CASUAL",
      "SICK",
      "ANNUAL",
      "MATERNITY",
      "PATERNITY",
      "BEREAVEMENT",
      "UNPAID",
      "COMPENSATORY",
      "OTHER",
    ],
    {
      required_error: "Leave type is required",
    }
  ),
  totalAllocated: z.number().min(0, "Total allocated must be 0 or greater"),
  year: z.number().min(2020, "Year must be 2020 or later"),
})

export const leaveSettingsSchema = z.object({
  autoApproveLeaves: z.boolean().default(false),
  requireManagerApproval: z.boolean().default(true),
  requireHRApproval: z.boolean().default(true),
  allowNegativeBalance: z.boolean().default(false),
  maxAdvanceBookingDays: z
    .number()
    .min(1, "Maximum advance booking days must be at least 1"),
  minAdvanceNoticeDays: z
    .number()
    .min(0, "Minimum advance notice days must be 0 or greater"),
  weekendDays: z.array(z.string()).default(["Saturday", "Sunday"]),
  holidays: z.array(z.string()).default([]),
  workingHours: z.object({
    start: z.string().min(1, "Working hours start time is required"),
    end: z.string().min(1, "Working hours end time is required"),
  }),
})

export const bulkLeaveApprovalSchema = z.object({
  leaveIds: z.array(z.string()).min(1, "At least one leave must be selected"),
  status: z.enum(["APPROVED", "REJECTED"], {
    required_error: "Approval status is required",
  }),
  comments: z.string().optional(),
})

export const leaveReportSchema = z.object({
  employeeId: z.string().optional(),
  department: z.string().optional(),
  leaveType: z
    .enum([
      "CASUAL",
      "SICK",
      "ANNUAL",
      "MATERNITY",
      "PATERNITY",
      "BEREAVEMENT",
      "UNPAID",
      "COMPENSATORY",
      "OTHER",
    ])
    .optional(),
  year: z.number().min(2020, "Year must be 2020 or later"),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
})

// Export types
export type LeaveFormData = z.infer<typeof leaveSchema>
export type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>
export type LeaveApprovalFormData = z.infer<typeof leaveApprovalSchema>
export type LeaveFilterFormData = z.infer<typeof leaveFilterSchema>
export type LeavePolicyFormData = z.infer<typeof leavePolicySchema>
export type LeaveBalanceFormData = z.infer<typeof leaveBalanceSchema>
export type LeaveSettingsFormData = z.infer<typeof leaveSettingsSchema>
export type BulkLeaveApprovalFormData = z.infer<typeof bulkLeaveApprovalSchema>
export type LeaveReportFormData = z.infer<typeof leaveReportSchema>
