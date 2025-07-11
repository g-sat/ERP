export interface IAccountGroup {
  accGroupId: number
  companyId: number
  accGroupCode: string
  accGroupName: string
  seqNo: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface IAccountGroupFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
