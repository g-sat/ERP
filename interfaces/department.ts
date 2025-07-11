export interface IDepartment {
  departmentId: number
  companyId: number
  departmentCode: string
  departmentName: string
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface IDepartmentFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface IDepartmentLookup {
  id: number
  code: string
  name: string
}
