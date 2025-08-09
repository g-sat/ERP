export interface IWorkLocation {
  workLocationId: number
  workLocationCode?: string
  workLocationName: string
  address1?: string
  address2?: string
  city?: string
  postalCode?: string
  countryId: number
  countryName?: string
  isActive: boolean
  createBy: string
  createDate: string | Date
  editBy?: string
  editDate?: string | Date
}

export interface IWorkLocationFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
