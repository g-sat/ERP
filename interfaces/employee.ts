export interface IEmployee {
  employeeId: number
  companyId: number
  employeeCode: string
  employeeName: string
  employeeOtherName: string
  employeePhoto: string
  employeeSignature: string
  empCategoryId: number
  departmentId: number
  employeeSex: string
  martialStatus: string
  employeeDOB?: Date
  employeeJoinDate?: Date
  employeeLastDate?: Date
  employeeOffEmailAdd: string
  employeeOtherEmailAdd: string
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface IEmployeeFilter {
  isActive?: boolean
  departmentId?: number
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface IEmployeeLookup {
  id: number
  code: string
  name: string
}
