export interface ICargoType {
  cargoTypeId: number
  companyId: number
  cargoTypeCode: string
  cargoTypeName: string
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface ICargoTypeFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
