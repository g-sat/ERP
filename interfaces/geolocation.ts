export interface IGeoLocation {
  geoLocationId: number
  companyId: number
  geoLocationCode: string
  geoLocationName: string
  portId: number
  latitude: string | null
  longitude: string | null
  remarks: string | null
  isActive: boolean
  createById: number
  editById: number | null
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string | null
}

export interface IGeoLocationFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
