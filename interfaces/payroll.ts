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

export interface IPayrollEmployee {
  payrollEmployeeId: number
  companyId: number
  employeeId: number
  employeeCode?: string
  employeeName?: string
  departmentName?: string
  payrollPeriodId: number
  periodName?: string
  basicSalary: number
  housingAllowance: number
  transportAllowance: number
  otherAllowances: number
  totalEarnings: number
  socialInsurance: number
  otherDeductions: number
  totalDeductions: number
  netSalary: number
  overtimeHours?: number
  overtimeRate?: number
  overtimeAmount?: number
  bonusAmount?: number
  commissionAmount?: number
  leaveDeduction?: number
  lateDeduction?: number
  otherEarnings?: number
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
}

export interface IPayrollComponent {
  payrollComponentId: number
  companyId: number
  componentCode: string
  componentName: string
  componentType: "EARNING" | "DEDUCTION"
  isTaxable: boolean
  isOvertime: boolean
  isBonus: boolean
  isCommission: boolean
  isLeave: boolean
  isLate: boolean
  isSocialInsurance: boolean
  calculationType: "FIXED" | "PERCENTAGE" | "FORMULA"
  calculationValue?: number
  calculationFormula?: string
  sortOrder: number
  remarks?: string
  isActive: boolean
  createDate?: Date | string
  editDate?: Date | string
  createBy?: string
  editBy?: string
}

export interface IPayrollEmployeeComponent {
  payrollEmployeeComponentId: number
  companyId: number
  payrollEmployeeId: number
  payrollComponentId: number
  componentCode?: string
  componentName?: string
  componentType?: string
  amount: number
  remarks?: string
  createDate?: Date | string
  editDate?: Date | string
  createBy?: string
  editBy?: string
}

export interface IPayrollTax {
  payrollTaxId: number
  companyId: number
  taxCode: string
  taxName: string
  taxType: "INCOME_TAX" | "SOCIAL_INSURANCE" | "OTHER"
  minAmount: number
  maxAmount?: number
  taxRate: number
  fixedAmount?: number
  isActive: boolean
  remarks?: string
  createDate?: Date | string
  editDate?: Date | string
  createBy?: string
  editBy?: string
}

export interface IPayrollBankTransfer {
  payrollBankTransferId: number
  companyId: number
  payrollPeriodId: number
  periodName?: string
  bankName: string
  accountNumber: string
  transferDate: Date | string
  totalAmount: number
  employeeCount: number
  transferReference: string
  status: "PENDING" | "PROCESSED" | "COMPLETED" | "FAILED"
  remarks?: string
  createDate?: Date | string
  editDate?: Date | string
  createBy?: string
  editBy?: string
}

export interface IPayrollReport {
  payrollReportId: number
  companyId: number
  payrollPeriodId: number
  periodName?: string
  reportType:
    | "PAYROLL_SUMMARY"
    | "EMPLOYEE_DETAIL"
    | "BANK_TRANSFER"
    | "TAX_REPORT"
  reportDate: Date | string
  reportData: string
  fileName?: string
  filePath?: string
  remarks?: string
  createDate?: Date | string
  createBy?: string
}

export interface IPayrollFilter {
  isActive?: boolean
  payrollPeriodId?: number
  employeeId?: number
  departmentId?: number
  isProcessed?: boolean
  isPaid?: boolean
  startDate?: Date | string
  endDate?: Date | string
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface IPayrollPeriodFilter {
  isActive?: boolean
  isClosed?: boolean
  startDate?: Date | string
  endDate?: Date | string
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface IPayrollComponentFilter {
  isActive?: boolean
  componentType?: string
  search?: string
  sortOrder?: "asc" | "desc"
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
