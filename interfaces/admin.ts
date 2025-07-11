export interface IUser {
  userId: number
  userCode: string
  userName: string
  userEmail: string
  userRoleId: number
  remarks: string
  isActive: boolean
  isLocked: boolean
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
}

export interface IUserGroup {
  userGroupId: number
  userGroupName: string
  remarks: string
  isActive: boolean
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
}

export interface IUserRole {
  userRoleId: number
  userRoleName: string
  remarks: string
  isActive: boolean
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
}

export interface IUserFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface IUserGroupFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface IUserRoleFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface IResetPassword {
  userId: number
  userPassword: string
  confirmPassword: string
}

export interface IUserGroupRights {
  userGroupId: number
  moduleId: number
  moduleName: string
  transactionId: number
  transactionName: string
  isRead: boolean
  isCreate: boolean
  isEdit: boolean
  isDelete: boolean
  isExport: boolean
  isPrint: boolean
}

export interface IShareData {
  userGroupId: number
  moduleId: number
  moduleName: string
  transactionId: number
  transactionName: string
  shareToAll: boolean
  setId: number
}

export interface IUserRightsv1 {
  userId: number
  moduleId: number
  moduleName: string
  transactionId: number
  transactionName: string
  isRead: boolean
  isCreate: boolean
  isEdit: boolean
  isDelete: boolean
  isExport: boolean
  isPrint: boolean
}

export interface IUserRights {
  companyId: number
  companyCode: string
  companyName: string
  isAccess: boolean
  userId: number
  userGroupId: number
}

export interface ICloneUserGroupRights {
  fromUserGroupId: number
  toUserGroupId: number
}
