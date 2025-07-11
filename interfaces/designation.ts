export interface IDesignation {
  designationId: number
  companyId: number
  designationCode: string
  designationName: string
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface IDesignationFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
