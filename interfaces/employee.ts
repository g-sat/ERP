export interface IEmployee {
  employeeId: number
  companyId: number
  companyName?: string
  code: string
  firstName?: string
  lastName?: string
  otherName?: string
  photo?: string
  signature?: string
  empCategoryId: number
  empCategoryName?: string
  departmentId: number
  departmentName?: string
  gender?: string
  martialStatus?: string
  dob?: Date | string
  joinDate?: Date | string
  lastDate?: Date | string
  phoneNo?: string
  offEmailAdd?: string
  otherEmailAdd?: string
  remarks?: string
  isActive?: boolean
  createDate?: Date | string
  editDate?: Date | string
  createBy?: string
  editBy?: string
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
