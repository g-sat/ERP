export interface ApprovalProcess {
  processId: number
  processName: string
  moduleId: number
  transactionId?: number
  companyId?: number
  isActive: boolean
  createById: number
  createdDate: string | Date
}

export interface ApprovalLevel {
  levelId: number
  processId: number
  levelNumber: number
  userRoleId: number
  levelName: string
  isFinal: boolean
}

export interface ApprovalRequest {
  requestId: number
  processId: number
  companyId: number
  referenceId: string
  requestedBy: number
  requestedOn: string | Date
  currentLevelId: number
  status: "Pending" | "Approved" | "Rejected" | "Cancelled"
  statusTypeId: number
}

export interface ApprovalAction {
  actionId: number
  requestId: number
  levelId: number
  actionById: number
  actionDate: string | Date
  actionType: "Approved" | "Rejected" | string
  actionTypeId?: number
  comments?: string
}

// Filter interfaces
export interface ApprovalProcessFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface ApprovalLevelFilter {
  processId?: number
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface ApprovalRequestFilter {
  companyId?: number
  processId?: number
  status?: "Pending" | "Approved" | "Rejected" | "Cancelled"
  requestedBy?: number
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface ApprovalActionFilter {
  requestId?: number
  levelId?: number
  actionType?: "Approved" | "Rejected" | string
  search?: string
  sortOrder?: "asc" | "desc"
}
