export interface IConsignmentType {
  consignmentTypeId: number
  companyId: number
  consignmentTypeCode: string
  consignmentTypeName: string
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

export interface IConsignmentTypeFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

