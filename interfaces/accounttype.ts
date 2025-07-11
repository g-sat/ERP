export interface IAccountType {
  companyId: number
  accTypeId: number
  accTypeCode: string
  accTypeName: string
  seqNo: number
  accGroupName: string
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface IAccountTypeFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
