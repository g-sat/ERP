export interface ICountry {
  countryId: number
  countryCode: string
  countryName: string
  phoneCode: string
  companyId: number
  remarks: string
  isActive: boolean
  createBy?: string
  editBy?: string
  createDate: string
  editDate?: string
}

export interface ICountryFilter {
  isActive?: boolean
  region?: string
  search?: string
  sortOrder?: "asc" | "desc"
}
