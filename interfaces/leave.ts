export interface Leave {
  id: string
  employeeId: string
  employeeName: string
  employeePhoto?: string
  employeeCode: string
  department?: string
  location?: string
  leaveType: LeaveType
  leaveCategory: LeaveCategory
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: LeaveStatus
  approvedBy?: string
  approvedAt?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string
  attachments?: string[]
  notes?: string
  createdDate: string
  editDate: string
}

export type LeaveType =
  | "CASUAL"
  | "SICK"
  | "ANNUAL"
  | "MATERNITY"
  | "PATERNITY"
  | "BEREAVEMENT"
  | "UNPAID"
  | "COMPENSATORY"
  | "OTHER"

export type LeaveCategory = "FULL_DAY" | "HALF_DAY" | "HOURLY" | "MULTIPLE_DAYS"

export type LeaveStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED"

export interface LeaveBalance {
  id: string
  employeeId: string
  employeeName: string
  employeeCode: string
  leaveType: LeaveType
  totalAllocated: number
  totalUsed: number
  totalPending: number
  remainingBalance: number
  year: number
  createdDate: string
  editDate: string
}

export interface LeavePolicy {
  id: string
  companyId: string
  leaveType: LeaveType
  name: string
  description: string
  defaultDays: number
  maxDays: number
  minDays: number
  advanceNoticeDays: number
  maxConsecutiveDays: number
  requiresApproval: boolean
  requiresDocument: boolean
  isActive: boolean
  createdDate: string
  editDate: string
}

export interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  employeeCode: string
  department?: string
  location?: string
  leaveType: LeaveType
  leaveCategory: LeaveCategory
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: LeaveStatus
  attachments?: string[]
  notes?: string
  createdDate: string
  editDate: string
}

export interface LeaveApproval {
  id: string
  leaveId: string
  approverId: string
  approverName: string
  approvalLevel: number
  status: "APPROVED" | "REJECTED"
  comments?: string
  approvedAt: string
}

export interface LeaveFilter {
  employeeId?: string
  department?: string
  location?: string
  leaveType?: LeaveType
  status?: LeaveStatus
  dateFrom?: string
  dateTo?: string
  approvedBy?: string
}

export interface LeaveSummary {
  employeeId: string
  employeeName: string
  employeeCode: string
  department?: string
  totalLeaves: number
  approvedLeaves: number
  pendingLeaves: number
  rejectedLeaves: number
  totalDays: number
  approvedDays: number
  pendingDays: number
  rejectedDays: number
}

export interface LeaveCalendar {
  date: string
  leaves: Leave[]
  totalEmployees: number
  employeesOnLeave: number
  employeesPresent: number
}

export interface LeaveReport {
  employeeId: string
  employeeName: string
  employeeCode: string
  department?: string
  leaveType: LeaveType
  totalDays: number
  usedDays: number
  remainingDays: number
  year: number
}

export interface LeaveSettings {
  id: string
  companyId: string
  autoApproveLeaves: boolean
  requireManagerApproval: boolean
  requireHRApproval: boolean
  allowNegativeBalance: boolean
  maxAdvanceBookingDays: number
  minAdvanceNoticeDays: number
  weekendDays: string[] // ["Saturday", "Sunday"]
  holidays: string[] // ["2024-01-01", "2024-12-25"]
  workingHours: {
    start: string
    end: string
  }
  createdDate: string
  editDate: string
}

// Form Data Interfaces
export interface LeaveFormData {
  employeeId: string
  leaveType: LeaveType
  leaveCategory: LeaveCategory
  startDate: string
  endDate: string
  reason: string
  notes?: string
  attachments?: string[]
}

export interface LeavePolicyFormData {
  companyId: string
  leaveType: LeaveType
  name: string
  description: string
  defaultDays: number
  maxDays: number
  minDays: number
  advanceNoticeDays: number
  maxConsecutiveDays: number
  requiresApproval: boolean
  requiresDocument: boolean
  isActive: boolean
}

export interface LeaveBalanceFormData {
  employeeId: string
  leaveType: LeaveType
  totalAllocated: number
  year: number
}

export interface LeaveSettingsFormData {
  companyId: string
  autoApproveLeaves: boolean
  requireManagerApproval: boolean
  requireHRApproval: boolean
  allowNegativeBalance: boolean
  maxAdvanceBookingDays: number
  minAdvanceNoticeDays: number
  weekendDays: string[]
  holidays: string[]
  workingHours: {
    start: string
    end: string
  }
}
