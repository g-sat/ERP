// Payrun Dashboard Interface
export interface IPayrollDashboard {
  payrollRunId: number
  month: string
  payPeriodStart: string | Date
  payPeriodEnd: string | Date
  paymentDate: string | Date
  employeeCount: number
  totalNetPay: string
  status: string
  isPaid: boolean
  isSubmitted: boolean
  isPayruns: boolean
  warningMessage: string
  showCreatePayRunButton: boolean
  showViewDetailsButton: boolean
  showViewDetailsAndPayButton: boolean
}

export interface IPayrollDashboardDetails {
  payrollRunId: number
  payName: string
  payPeriodStart: string // ISO date string
  payPeriodEnd: string // ISO date string
  paymentDate: string // ISO date string
  payDate: string // ISO date string
  status: string
  workingDaysPerMonth: number
  payDayOfMonth: number
}

// Payrun Employee Header Interface
export interface IPayrollEmployeeHd {
  payrollEmployeeId: number
  payName: string
  companyId: number
  companyName: string
  departmentId: number
  departmentName: string
  designationId: number
  designationName: string
  employeeId: number
  employeeCode: string
  employeeName: string
  presentDays: number
  pastDays: number
  basicSalary: number
  totalEarnings: number
  totalDeductions: number
  netSalary: number
  remarks: string
  isDraft: boolean
  isSubmitted: boolean
  isPaid: boolean
  isRejected: boolean
  isPreviousPaid: boolean
  status: string
  data_details?: IPayrollEmployeeDt[]
  paymentMode?: string
  paymentStatus?: string
  whatsUpPhoneNo?: string
  emailAdd?: string
  workPermitNo?: string
  personalNo?: string
  iban?: string
  bankName?: string
  address?: string
  phoneNo?: string
  email?: string
  joinDate?: string
}

// Payrun Employee Detail Interface
export interface IPayrollEmployeeDt {
  payrollEmployeeId: number
  componentId: number
  componentCode: string
  componentName: string
  componentType: string
  amount: number
  basicAmount: number
  remarks: string
}

// Payrun History Interface
export interface IPayRunHistory {
  payrollRunId: number
  payName: string
  payPeriodStart: string
  payPeriodEnd: string
  payDate: string
  status: string
  isPost: boolean
}

// Payrun Summary Interface
export interface IPayRunSummary {
  id: number
  payrollType: string
  period: string
  baseDays: number
  payDay: number
  month: string
  year: number
  employeeCount: number
  status: string
  payrollCost: number
  totalNetPay: number
  totalDeductions: number
  totalBenefits: number
  totalDonations: number
}

// Employee Interface for Payrun
export interface IEmployee {
  id: number
  name: string
  employeeId: string
  paidDays: number
  grossPay: number
  benefits: number
  netPay: number
  earnings: {
    basic: number
    housingAllowance: number
    costOfLivingAllowance: number
    otherAllowance: number
  }
  deductions: {
    personalLoans: number
    actualLoanAmount: number
  }
}

// Payrun Filter Interface
export interface IPayRunFilter {
  status?: string
  payrollType?: string
  dateFrom?: string
  dateTo?: string
  employeeId?: string
  search?: string
}

// Payrun Process Interface
export interface IPayRunProcess {
  payrollRunId: number
  action: "process" | "approve" | "reject" | "draft"
  processedBy: string
  processedDate: string
  remarks?: string
}

// Payrun Payment Interface
export interface IPayRunPayment {
  payrollRunId: number
  employeeIds: number[]
  paymentMode: string
  paymentDate: string
  totalAmount: number
  paymentReference?: string
  remarks?: string
}

// Payrun Component Interface
export interface IPayRunComponent {
  componentId: number
  componentName: string
  componentType: "EARNING" | "DEDUCTION" | "BENEFIT"
  amount: number
  percentage?: number
  isActive: boolean
}

// Payrun Settings Interface
export interface IPayRunSettings {
  companyId: string
  defaultPaymentMode: string
  autoApprove: boolean
  requireApproval: boolean
  notificationEnabled: boolean
  taxCalculationMethod: string
  roundingMethod: string
}

export interface ISavePayrunComponentViewModel {
  payrollEmployeeId: number
  payrollRunId: number
  employeeId: number
  componentId: number
  amount: number
  presentDays: number
  pastDays: number
}

export interface ISIFEmployee {
  companyName: string
  companyMOLNo: string
  employeeCode: string
  employeeName: string
  workNo: string
  departmentName: string
  employeeMOLId: string
  bankName: string
  accountNo: string
  iban: string
  leaveDays: string
  fixAmount: number
  variableAmount: number
  total: number
}
