import * as z from "zod"

// ILeave interface schema
export const leaveSchema = z
  .object({
    leaveId: z.number().optional(),
    employeeId: z.number().min(1, "Employee is required"),
    employeeName: z.string().min(1, "Employee name is required"),
    employeePhoto: z.string().optional(),
    employeeCode: z.string().min(1, "Employee code is required"),
    departmentId: z.number().min(1, "Department is required"),
    departmentName: z.string().optional(),
    leaveTypeId: z.number().min(1, "Leave type is required"),
    leaveTypeName: z.string().min(1, "Leave type name is required"),
    leaveCategoryId: z.number().min(1, "Leave category is required"),
    leaveCategoryName: z.string().min(1, "Leave category name is required"),
    startDate: z.union([z.date(), z.string()]).refine((val) => {
      if (typeof val === "string") {
        return !isNaN(Date.parse(val))
      }
      return true
    }, "Start date is required"),
    endDate: z.union([z.date(), z.string()]).refine((val) => {
      if (typeof val === "string") {
        return !isNaN(Date.parse(val))
      }
      return true
    }, "End date is required"),
    totalDays: z.number().min(0, "Total days must be 0 or greater"),
    reason: z
      .string()
      .min(1, "Reason is required")
      .max(500, "Reason must be less than 500 characters"),
    statusName: z.string().min(1, "Status is required"),
    actionById: z.number().optional(),
    actionBy: z.string().optional(),
    actionDate: z.union([z.date(), z.string()]).optional(),
    actionRemarks: z.string().optional(),
    attachments: z.array(z.string()).optional(),
    notes: z.string().optional(),
    createDate: z.union([z.date(), z.string()]).optional(),
    editDate: z.union([z.date(), z.string()]).optional(),
    createBy: z.string().optional(),
    editBy: z.string().optional(),
  })
  .refine(
    (data) => {
      const startDate =
        typeof data.startDate === "string"
          ? new Date(data.startDate)
          : data.startDate
      const endDate =
        typeof data.endDate === "string" ? new Date(data.endDate) : data.endDate
      return endDate >= startDate
    },
    {
      message: "End date must be after or equal to start date",
      path: ["endDate"],
    }
  )

// ILeaveType interface schema
export const leaveTypeSchema = z.object({
  leaveTypeId: z.number().optional(),
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  remarks: z.string().optional(),
  isActive: z.boolean().default(true),
  createById: z.number().min(1, "Create by ID is required"),
  createDate: z.union([z.date(), z.string()]).optional(),
  editById: z.number().optional(),
  editDate: z.union([z.date(), z.string()]).optional(),
})

// ILeaveBalance interface schema
export const leaveBalanceSchema = z.object({
  leaveBalanceId: z.number().optional(),
  employeeId: z.number().min(1, "Employee is required"),
  leaveTypeId: z.number().min(1, "Leave type is required"),
  totalAllocated: z.number().min(0, "Total allocated must be 0 or greater"),
  totalUsed: z.number().min(0, "Total used must be 0 or greater"),
  totalPending: z.number().min(0, "Total pending must be 0 or greater"),
  remainingBalance: z.number().min(0, "Remaining balance must be 0 or greater"),
  year: z.number().min(2020, "Year must be 2020 or later"),
  createById: z.number().optional(),
  createDate: z.union([z.date(), z.string()]).optional(),
  editById: z.number().optional(),
  editDate: z.union([z.date(), z.string()]).optional(),
})

// ILeavePolicy interface schema
export const leavePolicySchema = z.object({
  leavePolicyId: z.number().optional(),
  companyId: z.number().min(1, "Company is required"),
  leaveTypeId: z.number().min(1, "Leave type is required"),
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
  createById: z.number().min(1, "Create by ID is required"),
  createDate: z.union([z.date(), z.string()]).optional(),
  editById: z.number().optional(),
  editDate: z.union([z.date(), z.string()]).optional(),
})

// ILeaveRequest interface schema
export const leaveRequestSchema = z
  .object({
    leaveRequestId: z.number().optional(),
    employeeId: z.number().min(1, "Employee is required"),
    leaveTypeId: z.number().min(1, "Leave type is required"),
    startDate: z.union([z.date(), z.string()]).refine((val) => {
      if (typeof val === "string") {
        return !isNaN(Date.parse(val))
      }
      return true
    }, "Start date is required"),
    endDate: z.union([z.date(), z.string()]).refine((val) => {
      if (typeof val === "string") {
        return !isNaN(Date.parse(val))
      }
      return true
    }, "End date is required"),
    totalDays: z.number().min(0, "Total days must be 0 or greater"),
    reason: z
      .string()
      .min(1, "Reason is required")
      .max(500, "Reason must be less than 500 characters"),
    statusId: z.number().min(1, "Status is required"),
    actionById: z.number().optional(),
    actionDate: z.union([z.date(), z.string()]).optional(),
    remarks: z.string().optional(),
    attachments: z.string().optional(),
    createById: z.number().min(1, "Create by ID is required"),
    createDate: z.string().min(1, "Create date is required"),
    editById: z.number().optional(),
    editDate: z.union([z.date(), z.string()]).optional(),
  })
  .refine(
    (data) => {
      const startDate =
        typeof data.startDate === "string"
          ? new Date(data.startDate)
          : data.startDate
      const endDate =
        typeof data.endDate === "string" ? new Date(data.endDate) : data.endDate
      return endDate >= startDate
    },
    {
      message: "End date must be after or equal to start date",
      path: ["endDate"],
    }
  )

// ILeaveApproval interface schema
export const leaveApprovalSchema = z.object({
  leaveApprovalId: z.number().optional(),
  leaveRequestId: z.number().min(1, "Leave request is required"),
  approverId: z.number().min(1, "Approver is required"),
  approvalLevel: z.number().min(1, "Approval level is required"),
  statusId: z.number().min(1, "Status is required"),
  comments: z.string().optional(),
  approvedDate: z.union([z.date(), z.string()]).optional(),
  createDate: z.union([z.date(), z.string()]).optional(),
})

// ILeaveCalendar interface schema
export const leaveCalendarSchema = z.object({
  leaveCalendarId: z.number().optional(),
  date: z.union([z.date(), z.string()]).refine((val) => {
    if (typeof val === "string") {
      return !isNaN(Date.parse(val))
    }
    return true
  }, "Date is required"),
  employeeId: z.number().min(1, "Employee is required"),
  leaveRequestId: z.number().optional(),
  statusId: z.number().min(1, "Status is required"),
  leaveTypeId: z.number().optional(),
})

// ILeaveSetting interface schema
export const leaveSettingSchema = z.object({
  leaveSettingId: z.number().optional(),
  companyId: z.number().min(1, "Company is required"),
  autoApproveLeaves: z.boolean().default(false),
  requireManagerApproval: z.boolean().default(true),
  requireHrApproval: z.boolean().default(true),
  allowNegativeBalance: z.boolean().default(false),
  maxAdvanceBookingDays: z
    .number()
    .min(1, "Maximum advance booking days must be at least 1"),
  minAdvanceNoticeDays: z
    .number()
    .min(0, "Minimum advance notice days must be 0 or greater"),
  weekendDays: z.string().optional(),
  holidays: z.string().optional(),
  workingHours: z.string().optional(),
  createById: z.number().optional(),
  createDate: z.union([z.date(), z.string()]).optional(),
  editById: z.number().optional(),
  editDate: z.union([z.date(), z.string()]).optional(),
})

// LeaveFilter interface schema
export const leaveFilterSchema = z.object({
  employeeId: z.string().optional(),
  departmentId: z.number().optional(),
  departmentName: z.string().optional(),
  locationId: z.number().optional(),
  locationName: z.string().optional(),
  leaveType: z
    .object({
      leaveTypeId: z.number(),
      code: z.string(),
      name: z.string(),
    })
    .optional(),
  status: z.string().optional(),
  dateFrom: z.union([z.date(), z.string()]).optional(),
  dateTo: z.union([z.date(), z.string()]).optional(),
  approvedBy: z.string().optional(),
})

// LeaveSummary interface schema
export const leaveSummarySchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  employeeName: z.string().min(1, "Employee name is required"),
  employeeCode: z.string().min(1, "Employee code is required"),
  department: z.string().optional(),
  totalLeaves: z.number().min(0, "Total leaves must be 0 or greater"),
  approvedLeaves: z.number().min(0, "Approved leaves must be 0 or greater"),
  pendingLeaves: z.number().min(0, "Pending leaves must be 0 or greater"),
  rejectedLeaves: z.number().min(0, "Rejected leaves must be 0 or greater"),
  totalDays: z.number().min(0, "Total days must be 0 or greater"),
  approvedDays: z.number().min(0, "Approved days must be 0 or greater"),
  pendingDays: z.number().min(0, "Pending days must be 0 or greater"),
  rejectedDays: z.number().min(0, "Rejected days must be 0 or greater"),
})

// LeaveReport interface schema
export const leaveReportSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  employeeName: z.string().min(1, "Employee name is required"),
  employeeCode: z.string().min(1, "Employee code is required"),
  departmentId: z.number().optional(),
  departmentName: z.string().optional(),
  leaveTypeId: z.number().optional(),
  leaveTypeName: z.string().optional(),
  totalDays: z.number().min(0, "Total days must be 0 or greater"),
  usedDays: z.number().min(0, "Used days must be 0 or greater"),
  remainingDays: z.number().min(0, "Remaining days must be 0 or greater"),
  year: z.number().min(2020, "Year must be 2020 or later"),
})

// Form Data Schemas
export const leaveFormDataSchema = z
  .object({
    employeeId: z.string().min(1, "Employee is required"),
    leaveTypeId: z.number().min(1, "Leave type is required"),
    leaveTypeName: z.string().min(1, "Leave type name is required"),
    startDate: z.union([z.date(), z.string()]).refine((val) => {
      if (typeof val === "string") {
        return !isNaN(Date.parse(val))
      }
      return true
    }, "Start date is required"),
    endDate: z.union([z.date(), z.string()]).refine((val) => {
      if (typeof val === "string") {
        return !isNaN(Date.parse(val))
      }
      return true
    }, "End date is required"),
    reason: z
      .string()
      .min(1, "Reason is required")
      .max(500, "Reason must be less than 500 characters"),
    notes: z.string().optional(),
    attachments: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      const startDate =
        typeof data.startDate === "string"
          ? new Date(data.startDate)
          : data.startDate
      const endDate =
        typeof data.endDate === "string" ? new Date(data.endDate) : data.endDate
      return endDate >= startDate
    },
    {
      message: "End date must be after or equal to start date",
      path: ["endDate"],
    }
  )

export const leavePolicyFormDataSchema = z.object({
  companyId: z.string().min(1, "Company is required"),
  leaveTypeId: z.number().min(1, "Leave type is required"),
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

export const leaveBalanceFormDataSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  leaveTypeId: z.number().min(1, "Leave type is required"),
  totalAllocated: z.number().min(0, "Total allocated must be 0 or greater"),
  year: z.number().min(2020, "Year must be 2020 or later"),
})

export const leaveSettingsFormDataSchema = z.object({
  companyId: z.string().min(1, "Company is required"),
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

// Bulk approval schema
export const bulkLeaveApprovalSchema = z.object({
  leaveIds: z.array(z.number()).min(1, "At least one leave must be selected"),
  statusId: z.number().min(1, "Status is required"),
  comments: z.string().optional(),
})

// Export types
export type ILeave = z.infer<typeof leaveSchema>
export type ILeaveType = z.infer<typeof leaveTypeSchema>
export type ILeaveBalance = z.infer<typeof leaveBalanceSchema>
export type ILeavePolicy = z.infer<typeof leavePolicySchema>
export type ILeaveRequest = z.infer<typeof leaveRequestSchema>
export type ILeaveApproval = z.infer<typeof leaveApprovalSchema>
export type ILeaveCalendar = z.infer<typeof leaveCalendarSchema>
export type ILeaveSetting = z.infer<typeof leaveSettingSchema>
export type LeaveFilter = z.infer<typeof leaveFilterSchema>
export type LeaveSummary = z.infer<typeof leaveSummarySchema>
export type LeaveReport = z.infer<typeof leaveReportSchema>
export type LeaveFormData = z.infer<typeof leaveFormDataSchema>
export type LeavePolicyFormData = z.infer<typeof leavePolicyFormDataSchema>
export type LeaveBalanceFormData = z.infer<typeof leaveBalanceFormDataSchema>
export type LeaveSettingsFormData = z.infer<typeof leaveSettingsFormDataSchema>
export type BulkLeaveApprovalFormData = z.infer<typeof bulkLeaveApprovalSchema>
