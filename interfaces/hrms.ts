// HRMS Interfaces based on database schema

export interface HrDepartment {
  departmentId: number
  departmentName: string
  departmentCode: string
  remarks: string
  isActive: boolean
}

export interface HrPosition {
  positionId: number
  positionName: string
  positionCode: string
  remarks: string
  isActive: boolean
}

export interface HrEmployee {
  employeeId: number
  firstName: string
  lastName: string
  departmentId: number
  positionId: number
  hireDate?: Date
  dateOfBirth?: Date
  address?: string
  phoneNumber?: string
  email?: string
  // Related data (for display purposes)
  departmentName?: string
  positionName?: string
}

export interface HrSalaryComponent {
  componentId: number
  componentName: string
  componentType: string // 'Allowance' | 'Deduction'
}

export interface HrEmployeeSalaryComponent {
  employeeId: number
  componentId: number
  amount: number
  effectiveDate: Date
  // Related data
  componentName?: string
  componentType?: string
  employeeName?: string
}

export interface HrSalaryIncrement {
  incrementId: number
  employeeId: number
  incrementAmount: number
  incrementDate: Date
  reason?: string
  authorizedById?: number
  // Related data
  employeeName?: string
  authorizedByName?: string
}

export interface HrLoan {
  loanId: number
  employeeId: number
  loanAmount: number
  loanDate: Date
  interestRate?: number
  repaymentTerms?: string
  status: string // 'Active' | 'Paid' | 'Defaulted'
  // Related data
  employeeName?: string
}

export interface HrLeaveRequest {
  requestId: number
  employeeId: number
  leaveType: string // 'Annual' | 'Sick' | 'Personal' | 'Maternity' | 'Paternity'
  startDate: Date
  endDate: Date
  status: string // 'Pending' | 'Approved' | 'Rejected'
  createdAt: number
  // Related data
  employeeName?: string
  departmentName?: string
  positionName?: string
}

export interface HrLeaveApproval {
  approvalId: number
  requestId: number
  approverId: number
  approvalStatus: string // 'Approved' | 'Rejected'
  approvalDate?: Date
  // Related data
  employeeName?: string
  approverName?: string
  leaveType?: string
  startDate?: Date
  endDate?: Date
}

export interface HrPayrollTransaction {
  transactionId: number
  employeeId: number
  payPeriodStart: Date
  payPeriodEnd: Date
  basicSalary: number
  totalAllowances: number
  totalDeductions: number
  netSalary: number
  paymentDate: Date
  // Related data
  employeeName?: string
  departmentName?: string
  positionName?: string
}

export interface HrPayrollDetail {
  detailId: number
  transactionId: number
  description: string
  amount: number
  type: string // 'Allowance' | 'Deduction'
  // Related data
  employeeName?: string
  payPeriodStart?: Date
  payPeriodEnd?: Date
}

// Additional interfaces for forms and data management
export interface HrEmployeeFormData {
  firstName: string
  lastName: string
  departmentId: number
  positionId: number
  hireDate?: Date
  dateOfBirth?: Date
  address?: string
  phoneNumber?: string
  email?: string
}

export interface HrLoanFormData {
  employeeId: number
  loanAmount: number
  loanDate: Date
  interestRate?: number
  repaymentTerms?: string
}

export interface HrLeaveRequestFormData {
  employeeId: number
  leaveType: string
  startDate: Date
  endDate: Date
}

export interface HrSalaryIncrementFormData {
  employeeId: number
  incrementAmount: number
  incrementDate: Date
  reason?: string
  authorizedById?: number
}

// Dashboard interfaces
export interface HrDashboardStats {
  totalEmployees: number
  activeLoans: number
  pendingLeaveRequests: number
  totalPayrollThisMonth: number
  newHiresThisMonth: number
  departmentsCount: number
}

export interface HrEmployeeStats {
  employeeId: number
  employeeName: string
  departmentName: string
  positionName: string
  hireDate: Date
  currentSalary: number
  loanBalance: number
  leaveBalance: number
}
