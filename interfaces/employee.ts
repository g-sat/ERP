export interface IEmployee {
  employeeId: number
  companyId: number
  companyName?: string
  employeeCode: string
  employeeName?: string
  photo?: string
  departmentId: number
  departmentName?: string
  designationId: number
  designationName?: string
  workLocationId?: number
  workLocationName?: string
  genderId?: number
  genderName?: string
  martialStatus?: string
  dob?: Date | string
  joinDate?: Date | string
  lastDate?: Date | string
  phoneNo?: string
  offPhoneNo?: string
  bankName?: string
  accountNo?: string
  swiftCode?: string
  iban?: string
  offEmailAdd?: string
  otherEmailAdd?: string
  passportNo?: string
  passportExpiry?: Date | string
  visaNo?: string
  visaExpiry?: Date | string
  isGCCEmployeeNational?: boolean
  nationalityId?: number
  nationalityName?: string
  emiratesIDNo?: string
  emiratesIDExpiry?: Date | string
  moiNo?: string
  moiExpiry?: Date | string
  employmentType?: string
  contractType?: string
  remarks?: string
  isActive?: boolean
  dateOfBirth?: Date | string
  fatherName?: string
  motherName?: string
  spouseName?: string
  permanentAddress?: string
  currentAddress?: string
  emergencyContactName?: string
  molId?: string
  emailAdd?: string
  dayOfWeek?: string
  glId?: number
  glName?: string
  glCode?: string
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

export interface IEmployeeBasic {
  employeeId: number
  employerId: number
  employerName?: string
  employeeCode: string
  employeeName?: string
  photo?: string
  departmentId: number
  departmentName?: string
  designationId: number
  designationName?: string
  workLocationId?: number
  workLocationName?: string
  genderId?: number
  genderName?: string
  joinDate?: Date | string
  lastDate?: Date | string
  phoneNo?: string
  offPhoneNo?: string
  offEmailAdd?: string
  nationalityId?: number
  nationalityName?: string
  employmentType?: string
  contractType?: string
  remarks?: string
  isActive?: boolean
  createDate?: Date | string
  editDate?: Date | string
  createBy?: string
  editBy?: string
  dayOfWeek?: number
}

export interface IEmployeePersonalDetails {
  employeeId: number
  dob?: Date | string
  fatherName?: string
  age?: number
  permanentAddress?: string
  currentAddress?: string
  workPermitNo?: string
  personalNo?: string
  emailAdd?: string
  passportNo?: string
  passportExpiryDate?: Date | string
  emiratesIdNo?: string
  emiratesIdExpiryDate?: Date | string
  emergencyContactNo?: string
  personalContactNo?: string
  createDate?: Date | string
  editDate?: Date | string
  createBy?: string
  editBy?: string
}

export interface IEmployeeBank {
  employeeId: number
  bankName: string
  accountNo: string
  swiftCode: string
  iban: string
  glId?: number
  glName?: string
  glCode?: string
  createDate?: Date | string
  editDate?: Date | string
  createBy?: string
  editBy?: string
}
