export interface ICurrency {
  currencyId: number
  companyId: number
  currencyCode: string
  currencyName: string
  currencySign: string
  isMultiply: boolean
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface ICurrencyFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface ICurrencyDt {
  currencyId: number
  currencyCode: string
  currencyName: string
  companyId: number
  exhRate: number
  validFrom: Date | string
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
}

export interface ICurrencyDtFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface ICurrencyLocalDt {
  currencyId: number
  currencyCode: string
  currencyName: string
  companyId: number
  exhRate: number
  validFrom: Date | string
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
}

export interface ICurrencyLocalDtFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
