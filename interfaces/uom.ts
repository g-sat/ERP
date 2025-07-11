export interface IUom {
  uomId: number
  companyId: number
  uomCode: string
  uomName: string
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface IUomFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface IUomDt {
  uomId: number
  companyId: number
  uomCode: string
  uomName: string
  packUomId: number
  packUomCode: string
  packUomName: string
  uomFactor: number
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
}

export interface IUomDtFilter {
  search?: string
  sortOrder?: "asc" | "desc"
}
