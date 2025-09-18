export interface IDocumentType {
  companyId: number
  docTypeId: number
  docTypeCode: string
  docTypeName: string
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface IDocumentTypeFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
