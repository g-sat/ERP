export interface IProduct {
  productId: number
  companyId: number
  productCode: string
  productName: string
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface IProductFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
