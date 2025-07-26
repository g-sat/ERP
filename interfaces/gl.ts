export interface IGLPeriodClose {
  companyId: number
  finYear: number
  finMonth: number
  startDate: Date | string
  endDate: Date | string
  isArClose: boolean
  arCloseById?: number
  arCloseDate?: Date | string
  isApClose: boolean
  apCloseById?: number
  apCloseDate?: Date | string
  isCbClose: boolean
  cbCloseById?: number
  cbCloseDate?: Date | string
  isGlClose: boolean
  glCloseById?: number
  glCloseDate?: Date | string
  createById: number
  createDate: Date | string
  editById?: number
  editDate?: Date | string
  editBy?: string
  createBy?: string
}
