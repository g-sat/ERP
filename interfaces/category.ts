export interface ICategory {
  categoryId: number
  companyId: number
  categoryCode: string
  categoryName: string
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface ICategoryFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
