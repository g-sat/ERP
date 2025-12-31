export interface ISupplyType {
  supplyTypeId: number
  companyId: number
  supplyTypeCode: string
  supplyTypeName: string
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface ISupplyTypeFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
