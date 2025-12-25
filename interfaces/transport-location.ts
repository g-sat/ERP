export interface ITransportLocation {
  transportLocationId: number
  companyId: number
  transportLocationCode: string
  transportLocationName: string
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

export interface ITransportLocationFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
