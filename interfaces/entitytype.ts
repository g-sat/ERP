export interface IEntityType {
  companyId: number
  entityTypeId: number
  entityTypeCode: string
  entityTypeName: string
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
}

export interface IEntityTypeFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
