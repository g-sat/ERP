export interface IPartyType {
  partyTypeId: number
  companyId: number
  partyTypeCode: string
  partyTypeName: string
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface IPartyTypeFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
