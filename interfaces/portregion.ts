export interface IPortRegion {
  companyId: number
  portRegionId: number
  portRegionCode: string
  portRegionName: string
  countryId: number
  countryCode: string
  countryName: string
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}
export interface IPortRegionFilter {
  isActive?: boolean
  region?: string
  search?: string
  sortOrder?: "asc" | "desc"
}
