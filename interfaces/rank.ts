export interface IRank {
  rankId: number
  companyId: number
  rankCode: string
  rankName: string
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

export interface IRankFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
