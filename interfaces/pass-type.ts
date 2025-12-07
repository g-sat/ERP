export interface IPassType {
  passTypeId: number
  companyId: number
  passTypeCode: string
  passTypeName: string
  seqNo: number
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface IPassTypeFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

