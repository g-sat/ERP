export interface ILeaveType {
  companyId: number
  leaveTypeId: number
  leaveTypeCode: string
  leaveTypeName: string
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface ILeaveTypeFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
