export interface IServiceMode {
  serviceModeId: number
  companyId: number
  serviceModeCode: string
  serviceModeName: string
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

export interface IServiceModeFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

