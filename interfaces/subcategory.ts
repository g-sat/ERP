export interface ISubCategory {
  subcategoryId: number
  companyId: number
  subcategoryCode: string
  subcategoryName: string
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface ISubCategoryFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
