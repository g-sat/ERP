export interface IVessel {
  companyId: number
  vesselId: number
  vesselCode: string
  vesselName: string
  callSign: string
  imoCode: string
  grt: string
  licenseNo: string
  vesselType: string
  flag: string
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface IVesselFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
