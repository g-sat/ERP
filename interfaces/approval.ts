export interface IApprovalProcess {
  processId: number
  processName: string
  moduleId: number
  transactionId?: number
  isActive: boolean
  createById: number
  createdDate: string
}

export interface IApprovalLevel {
  levelId: number
  processId: number
  levelNumber: number
  userRoleId: number
  isFinal: boolean
}

export interface IApprovalRequest {
  requestId: number
  processId: number
  companyId: number
  referenceId: string
  requestedById: number
  requestedDate: string
  currentLevelId: number
  statusId: number
  // Additional fields for UI
  processName?: string
  requestedByName?: string
  currentLevelNumber?: number
  statusName?: string
}

export interface IApprovalAction {
  actionId: number
  requestId: number
  levelId: number
  actionById: number
  actionDate: string
  statusId: number
  remarks?: string
  // Additional fields for UI
  actionByName?: string
  actionTypeName?: string
  levelNumber?: number
}

export interface IApprovalRequestDetail extends IApprovalRequest {
  process: IApprovalProcess
  levels: IApprovalLevel[]
  actions: IApprovalAction[]
  currentLevel: IApprovalLevel
}

export interface IApprovalActionRequest {
  requestId: number
  levelId: number
  statusId: number
  remarks?: string
}

export interface IApprovalFilter {
  statusId?: number
  processId?: number
  dateFrom?: string
  dateTo?: string
}

// Status and Action Type Constants
export const APPROVAL_STATUS = {
  PENDING: 1402,
  APPROVED: 1401,
  REJECTED: 1403,
} as const

export const APPROVAL_ACTION_TYPES = {
  APPROVED: 1401,
  REJECTED: 1403,
} as const

export const USER_ROLES = {
  ADMIN: 1,
  MANAGER: 2,
  CLERK: 3,
} as const

export type ApprovalStatusType =
  (typeof APPROVAL_STATUS)[keyof typeof APPROVAL_STATUS]
export type ApprovalActionType =
  (typeof APPROVAL_ACTION_TYPES)[keyof typeof APPROVAL_ACTION_TYPES]
export type UserRoleType = (typeof USER_ROLES)[keyof typeof USER_ROLES]
