export interface ILeave {
  leaveId: number
  employeeId: number
  employeeName: string
  employeePhoto?: string
  employeeCode: string
  departmentId: number
  departmentName?: string
  leaveTypeId: number
  leaveTypeName: string
  leaveCategoryId: number
  leaveCategoryName: string
  startDate: Date | string
  endDate: Date | string
  totalDays: number
  reason: string
  statusName: string
  actionById?: number
  actionBy?: string
  actionDate?: Date | string
  actionRemarks?: string
  attachments?: string[]
  notes?: string
  createDate: Date | string
  editDate: Date | string
  createBy?: string
  editBy?: string
}

export interface ILeaveRequest {
  leaveRequestId: number
  employeeId: number
  leaveTypeId: number
  startDate: Date | string
  endDate: Date | string
  totalDays: number
  reason: string
  statusId: number
  actionById?: number
  actionDate?: Date | string
  remarks?: string
  attachments?: string
  createById: number
  createDate: string
  editById?: number
  editDate?: Date | string
}

export interface ILeaveType {
  leaveTypeId: number
  code: string
  name: string
  remarks?: string
  isActive?: boolean
  createById: number
  createDate: Date | string
  editById?: number
  editDate?: Date | string
}

export interface ILeaveBalance {
  leaveBalanceId: number
  employeeId: number
  employeeName: string
  leaveTypeName: string
  leaveTypeId: number
  totalAllocated: number
  totalUsed: number
  totalPending: number
  remainingBalance: number
  year: number
  createById?: number
  createDate?: Date | string
  editById?: number
  editDate?: Date | string
}

export interface ILeavePolicy {
  leavePolicyId: number
  companyId: number
  leaveTypeId: number
  leaveTypeName: string
  name: string
  description?: string
  defaultDays: number
  maxDays: number
  minDays: number
  advanceNoticeDays: number
  maxConsecutiveDays: number
  requiresApproval?: boolean
  requiresDocument?: boolean
  isActive?: boolean
  createById: number
  createDate: Date | string
  editById?: number
  editDate?: Date | string
}

export interface ILeaveApproval {
  leaveApprovalId: number
  leaveRequestId: number
  approverId: number
  approvalLevel: number
  statusId: number
  comments?: string
  approvedDate?: Date | string
  createDate?: Date | string
}

export interface ILeaveCalendar {
  leaveCalendarId: number
  date: Date | string
  employeeId: number
  leaveRequestId?: number
  statusId: number
  leaveTypeId?: number
  createDate: Date | string
}

export interface ILeaveSetting {
  leaveSettingId: number
  companyId: number
  autoApproveLeaves?: boolean
  requireManagerApproval?: boolean
  requireHrApproval?: boolean
  allowNegativeBalance?: boolean
  maxAdvanceBookingDays?: number
  minAdvanceNoticeDays?: number
  weekendDays?: string
  holidays?: string
  workingHours?: string
  createById?: number
  createDate?: Date | string
  editById?: number
  editDate?: Date | string
}
