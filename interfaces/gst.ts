export interface IGst {
  companyId: number
  gstId: number
  gstCode: string
  gstName: string
  gstCategoryId: number
  gstCategoryCode: string
  gstCategoryName: string
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface IGstFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface IGstDt {
  companyId: number
  gstId: number
  gstCode: string
  gstName: string
  gstPercentage: number
  validFrom: Date | string
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
}

export interface IGstDtFilter {
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface IGstCategory {
  gstCategoryId: number
  companyId: number
  gstCategoryCode: string
  gstCategoryName: string
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface IGstCategoryFilter {
  search?: string
  sortOrder?: "asc" | "desc"
}
