export interface IPaymentType {
  paymentTypeId: number
  companyId: number
  paymentTypeCode: string
  paymentTypeName: string
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface IPaymentTypeFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
