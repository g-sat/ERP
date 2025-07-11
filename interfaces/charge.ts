export interface ICharge {
  chargeId: number
  companyId: number
  chargeCode: string
  chargeName: string
  chargeOrder: number
  taskId: number
  itemNo: number
  glId: number
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface IChargeFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
