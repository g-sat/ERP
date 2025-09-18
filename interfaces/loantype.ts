export interface ILoanType {
  loanTypeId: number
  loanTypeCode: string
  loanTypeName: string
  interestRatePct: number
  maxTermMonths: number
  minTermMonths: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
}

export interface ILoanTypeFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
