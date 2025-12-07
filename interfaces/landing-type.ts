export interface ILandingType {
  landingTypeId: number
  companyId: number
  landingTypeCode: string
  landingTypeName: string
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

export interface ILandingTypeFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

