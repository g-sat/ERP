export interface IVATServiceCategory {
  vatServiceCategoryId: number
  companyId: number
  vatServiceCategoryCode: string
  vatServiceCategoryName: string
  serviceCategoryId: number
  seqNo: number
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface IVATServiceCategoryFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

