export interface IPort {
  companyId: number
  portId: number
  portCode: string
  portName: string
  portShortName: string
  portRegionId: number
  portRegionCode: string
  portRegionName: string
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface IPortFilter {
  isActive?: boolean
  region?: string
  search?: string
  sortOrder?: "asc" | "desc"
}
