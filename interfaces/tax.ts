export interface ITax {
  companyId: number
  taxId: number
  taxCode: string
  taxName: string
  taxCategoryId: number
  taxCategoryCode: string
  taxCategoryName: string
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface ITaxFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface ITaxDt {
  companyId: number
  taxId: number
  taxCode: string
  taxName: string
  taxPercentage: number
  validFrom: Date | string
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
}

export interface ITaxDtFilter {
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface ITaxCategory {
  taxCategoryId: number
  companyId: number
  taxCategoryCode: string
  taxCategoryName: string
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface ITaxCategoryFilter {
  search?: string
  sortOrder?: "asc" | "desc"
}
