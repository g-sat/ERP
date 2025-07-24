// export interface IUser {
//   id: string
//   name: string
//   email: string
//   role: string
// }

export interface IUser {
  userId: string
  userCode: string
  userName: string
  userEmail: string
  remarks: string
  isActive: boolean
  isLocked: boolean
  failedLoginAttempts: number
  userGroupId: string
  userGroupName: string
  userRoleId: string
  userRoleName: string
  profilePicture: string
}

export interface ICompany {
  companyId: string
  companyName: string
  companyCode: string
}

export interface IDecimal {
  amtDec: number
  locAmtDec: number
  ctyAmtDec: number
  priceDec: number
  qtyDec: number
  exhRateDec: number
  dateFormat: string
  longDateFormat: string
}

export interface IApiErrorResponse {
  status: number
  message: string
  errors?: Record<string, string[]>
  timestamp?: string
}

export interface IApiSuccessResponse<T> {
  result: number
  message: string
  data: T
}

export interface ApiResponse<T> {
  result: number
  message: string
  data: T[] // Array of items (e.g., ICountry[])
  totalRecords?: number
}
