export interface IGLPeriodClose {
  id: string
  companyId: string
  year: number
  month: number
  startDate: string
  closeDate: string

  // AR (Accounts Receivable)
  arClosed: boolean
  arVatClosed: boolean
  arCloseBy?: string
  arCloseDate?: string

  // AP (Accounts Payable)
  apClosed: boolean
  apVatClosed: boolean
  apCloseBy?: string
  apCloseDate?: string

  // CB (Cash Book)
  cbClosed: boolean
  cbCloseBy?: string
  cbCloseDate?: string

  // GL (General Ledger)
  glClosed: boolean
  glCloseBy?: string
  glCloseDate?: string

  // Metadata
  isActive: boolean
  createDate?: string
  editDate?: string
  createBy?: string
  editBy?: string
}

export interface IGLPeriodCloseFilter {
  companyId?: string
  year?: number
  month?: number
  isActive?: boolean
}

export interface IGLPeriodCloseFormData {
  companyId: string
  year: number
  month: number
  startDate: string
  closeDate: string
  arClosed: boolean
  arVatClosed: boolean
  apClosed: boolean
  apVatClosed: boolean
  cbClosed: boolean
  glClosed: boolean
}

export interface IGLPeriodCloseBulkAction {
  periodIds: string[]
  action: "close" | "reopen"
  module: "AR" | "AP" | "CB" | "GL"
  closeBy: string
}

export interface IGLPeriodCloseSummary {
  totalPeriods: number
  closedPeriods: number
  openPeriods: number
  arClosedCount: number
  apClosedCount: number
  cbClosedCount: number
  glClosedCount: number
  currentYear: number
  currentMonth: number
}
