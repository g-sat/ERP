import { z } from "zod"

// ILeaveType Schema
export const leaveTypeSchema = z.object({
  leaveTypeId: z.number().min(1, "Leave type ID must be greater than 0"),
  code: z
    .string()
    .min(1, "Code is required")
    .max(20, "Code must be less than 20 characters"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional(),
  isActive: z.boolean().optional(),
})

export type LeaveTypeSchemaType = z.infer<typeof leaveTypeSchema>

// ILeavePolicy Schema
export const leavePolicySchema = z.object({
  leavePolicyId: z.number().min(1, "Policy ID must be greater than 0"),
  companyId: z.number().min(1, "Company ID must be greater than 0"),
  leaveTypeId: z.number().min(1, "Leave type ID must be greater than 0"),
  name: z
    .string()
    .min(1, "Policy name is required")
    .max(100, "Policy name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  defaultDays: z
    .number()
    .min(0, "Default days must be 0 or greater")
    .max(365, "Default days cannot exceed 365"),
  maxDays: z
    .number()
    .min(1, "Maximum days must be at least 1")
    .max(365, "Maximum days cannot exceed 365"),
  minDays: z
    .number()
    .min(0, "Minimum days must be 0 or greater")
    .max(365, "Minimum days cannot exceed 365"),
  advanceNoticeDays: z
    .number()
    .min(0, "Advance notice days must be 0 or greater")
    .max(365, "Advance notice days cannot exceed 365"),
  maxConsecutiveDays: z
    .number()
    .min(1, "Maximum consecutive days must be at least 1")
    .max(365, "Maximum consecutive days cannot exceed 365"),
  requiresApproval: z.boolean().optional(),
  requiresDocument: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

export type LeavePolicySchemaType = z.infer<typeof leavePolicySchema>

// ILeaveBalance Schema
export const leaveBalanceSchema = z.object({
  leaveBalanceId: z.number().min(1, "Balance ID must be greater than 0"),
  employeeId: z.number().min(1, "Employee ID must be greater than 0"),
  leaveTypeId: z.number().min(1, "Leave type ID must be greater than 0"),
  totalAllocated: z
    .number()
    .min(0, "Total allocated must be 0 or greater")
    .max(365, "Total allocated cannot exceed 365"),
  totalUsed: z
    .number()
    .min(0, "Total used must be 0 or greater")
    .max(365, "Total used cannot exceed 365"),
  totalPending: z
    .number()
    .min(0, "Total pending must be 0 or greater")
    .max(365, "Total pending cannot exceed 365"),
  remainingBalance: z
    .number()
    .min(0, "Remaining balance must be 0 or greater")
    .max(365, "Remaining balance cannot exceed 365"),
  year: z
    .number()
    .min(2000, "Year must be 2000 or greater")
    .max(2100, "Year cannot exceed 2100"),
})

export type LeaveBalanceSchemaType = z.infer<typeof leaveBalanceSchema>

// ILeaveRequest Schema
export const leaveRequestSchema = z
  .object({
    leaveRequestId: z.number().min(1, "Request ID must be greater than 0"),
    employeeId: z.number().min(0, "Employee ID must be greater than 0"),
    leaveTypeId: z.number().min(1, "Leave type ID must be greater than 0"),
    startDate: z.union([z.string(), z.date()]).refine((date) => {
      const startDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return startDate >= today
    }, "Start date cannot be in the past"),
    endDate: z.union([z.string(), z.date()]),
    totalDays: z
      .number()
      .min(0.5, "Total days must be at least 0.5")
      .max(365, "Total days cannot exceed 365"),
    reason: z
      .string()
      .min(1, "Reason is required")
      .max(500, "Reason must be less than 500 characters"),
    statusId: z.number().min(1, "Status ID must be greater than 0"),
    actionById: z
      .number()
      .min(1, "Action by ID must be greater than 0")
      .optional(),
    actionDate: z.union([z.string(), z.date()]).optional(),
    remarks: z
      .string()
      .max(500, "Remarks must be less than 500 characters")
      .optional(),
    attachments: z
      .string()
      .max(1000, "Attachments path must be less than 1000 characters"),
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

export type LeaveRequestSchemaType = z.infer<typeof leaveRequestSchema>

// ILeaveApproval Schema
export const leaveApprovalSchema = z.object({
  leaveApprovalId: z.number().min(1, "Approval ID must be greater than 0"),
  leaveRequestId: z.number().min(1, "Leave request ID must be greater than 0"),
  approverId: z.number().min(1, "Approver ID must be greater than 0"),
  approvalLevel: z
    .number()
    .min(1, "Approval level must be at least 1")
    .max(10, "Approval level cannot exceed 10"),
  statusId: z.number().min(1, "Status ID must be greater than 0"),
  comments: z
    .string()
    .max(500, "Comments must be less than 500 characters")
    .optional(),
  approvedDate: z.union([z.string(), z.date()]).optional(),
})

export type LeaveApprovalSchemaType = z.infer<typeof leaveApprovalSchema>

// ILeaveCalendar Schema
export const leaveCalendarSchema = z.object({
  leaveCalendarId: z.number().min(1, "Calendar ID must be greater than 0"),
  date: z.union([z.string(), z.date()]),
  employeeId: z.number().min(1, "Employee ID must be greater than 0"),
  leaveRequestId: z
    .number()
    .min(1, "Leave request ID must be greater than 0")
    .optional(),
  statusId: z.number().min(1, "Status ID must be greater than 0"),
  leaveTypeId: z
    .number()
    .min(1, "Leave type ID must be greater than 0")
    .optional(),
})

export type LeaveCalendarSchemaType = z.infer<typeof leaveCalendarSchema>

// ILeaveSetting Schema
export const leaveSettingSchema = z.object({
  leaveSettingId: z.number().min(1, "Setting ID must be greater than 0"),
  companyId: z.number().min(1, "Company ID must be greater than 0"),
  autoApproveLeaves: z.boolean().optional(),
  requireManagerApproval: z.boolean().optional(),
  requireHrApproval: z.boolean().optional(),
  allowNegativeBalance: z.boolean().optional(),
  maxAdvanceBookingDays: z
    .number()
    .min(0, "Max advance booking days must be 0 or greater")
    .max(365, "Max advance booking days cannot exceed 365")
    .optional(),
  minAdvanceNoticeDays: z
    .number()
    .min(0, "Min advance notice days must be 0 or greater")
    .max(365, "Min advance notice days cannot exceed 365")
    .optional(),
  weekendDays: z
    .string()
    .max(50, "Weekend days must be less than 50 characters")
    .optional(),
  holidays: z
    .string()
    .max(1000, "Holidays must be less than 1000 characters")
    .optional(),
  workingHours: z
    .string()
    .max(100, "Working hours must be less than 100 characters")
    .optional(),
})

export type LeaveSettingSchemaType = z.infer<typeof leaveSettingSchema>
