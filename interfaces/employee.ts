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
  departmentName?: string
  designationName?: string
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

export interface IEmployeeCategory {
  companyId: number
  empCategoryId: number
  empCategoryCode: string
  empCategoryName: string
  remarks: string
  isActive: boolean
  createById?: number
  createDate?: Date | string
  editById?: number
  editDate?: Date | string
  createBy?: string
  editBy?: string
}

export interface IEmployeeBank {
  employeeId: number
  itemNo: number
  bankName: string
  accountNo: string
  swiftCode: string
  iban: string
  remarks: string
  isDefaultBank: boolean
  isActive: boolean
  createById?: number
  createDate?: Date | string
  editById?: number
  editDate?: Date | string
  createBy?: string
  editBy?: string
}
