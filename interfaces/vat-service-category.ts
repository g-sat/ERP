export interface IVATServiceCategory {
  serviceCategoryId: number
  companyId: number
  serviceCategoryCode: string
  serviceCategoryName: string
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
