export interface IGLPeriodClose {
  companyId: number
  finYear: number
  finMonth: number
  startDate: string
  endDate: string

  // AR (Accounts Receivable)
  isArClose: boolean
  arCloseById?: number
  arCloseBy?: string
  arCloseDate?: string

  // AP (Accounts Payable)
  isApClose: boolean
  apCloseById?: number
  apCloseBy?: string
  apCloseDate?: string

  // CB (Cash Book)
  isCbClose: boolean
  cbCloseById?: number
  cbCloseBy?: string
  cbCloseDate?: string

  // GL (General Ledger)
  isGlClose: boolean
  glCloseById?: number
  glCloseBy?: string
  glCloseDate?: string

  // Metadata
  createById: number
  createDate: string
  createBy?: string

  editById?: number
  editDate?: string
  editBy?: string
}

export interface IGeneratePeriodRequest {
  yearId: number
  monthId: number
  totalPeriod: number
}
