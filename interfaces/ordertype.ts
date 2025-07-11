export interface IOrderType {
  companyId: number
  orderTypeId: number
  orderTypeCode: string
  orderTypeName: string
  orderTypeCategoryId: number
  orderTypeCategoryCode: string
  orderTypeCategoryName: string
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface IOrderTypeFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface IOrderTypeCategory {
  orderTypeCategoryId: number
  companyId: number
  orderTypeCategoryCode: string
  orderTypeCategoryName: string
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface IOrderTypeCategoryFilter {
  search?: string
  sortOrder?: "asc" | "desc"
}
