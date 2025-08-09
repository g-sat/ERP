export interface IPayrollPeriod {
  payrollPeriodId: number
  companyId: number
  periodName: string
  startDate: Date | string
  endDate: Date | string
  isClosed: boolean
  closedDate?: Date | string
  closedBy?: string
  remarks?: string
  isActive: boolean
  createDate?: Date | string
  editDate?: Date | string
  createBy?: string
  editBy?: string
}

export interface IPayrollComponent {
  payrollComponentId: number
  componentCode: string
  componentName: string
  componentType: "Earning" | "Deduction"
  isBonus: boolean
  isLeave: boolean
  isSalaryComponent: boolean
  sortOrder: number
  remarks?: string
  isActive: boolean
  createDate?: Date | string
  editDate?: Date | string
  createBy?: string
  editBy?: string
}

export interface IPayrollComponentGroup {
  componentGroupId: number
  groupCode: string
  groupName: string
  remarks?: string
  isActive: boolean
  createById?: number
  createDate?: Date
  editById?: number
  editDate?: Date
  data_details: IPayrollComponentGroupDt[]
}

export interface IPayrollComponentGroupDt {
  componentGroupId: number
  groupCode: string
  groupName: string
  payrollComponentId: number
  componentCode: string
  componentName: string
  componentType: string
  sortOrder?: number
}

export interface IPayrollComponentGLMapping {
  mappingId: number
  companyId: number
  companyName: string
  departmentId: number
  departmentName: string
  payrollComponentId: number
  componentCode: string
  componentName: string
  expenseGLId: number
  expenseGLCode: string
  expenseGLName: string
  isActive?: boolean
  createBy?: string
  createDate?: Date | string
  editBy?: string
  editDate?: Date | string
}

export interface IPayrollComponentGroupFilter {
  groupCode?: string
  groupName?: string
  isActive?: boolean
}

export interface IPayrollComponentGLMappingFilter {
  companyId?: number
  payrollComponentId?: number
  isActive?: boolean
}

export interface IPayrollEmployee {
  payrollEmployeeId: number
  employeeId: number
  payrollPeriodId: number
  totalEarnings: number
  totalDeductions: number
  netSalary: number
  remarks?: string
  isProcessed: boolean
  processedDate?: Date | string
  processedBy?: string
  isPaid: boolean
  paidDate?: Date | string
  paidBy?: string
  paymentMethod?: string
  bankTransferRef?: string
  createDate?: Date | string
  editDate?: Date | string
  createBy?: string
  editBy?: string
  data_details: IPayrollEmployeeComponent[]
}

export interface IPayrollEmployeeComponent {
  payrollEmployeeId: number
  payrollComponentId: number
  amount: number
  remarks?: string
  createById?: number
  createDate?: string | Date
  editById?: number
  editDate?: string | Date
}

//payroll setting

export interface IEmployeeSalaryComponent {
  employeeId: number
  employeeName: string
  employeeCode: string
  payrollComponentId: number
  componentName: string
  componentType: string
  amount: number
  effectiveFromDate: string | Date
  createDate: Date | string
  createBy?: string
}
