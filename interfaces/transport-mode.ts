export interface ITransportMode {
  transportModeId: number
  companyId: number
  transportModeCode: string
  transportModeName: string
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

export interface ITransportModeFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

