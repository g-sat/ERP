export interface ILoan {
  loanId: number
  employeeId: number
  loanType: string // 'Personal' | 'Housing' | 'Vehicle' | 'Education' | 'Emergency'
  loanAmount: number
  loanDate: Date
  interestRate: number
  repaymentTerms: string
  monthlyPayment: number
  totalPayable: number
  status: string // 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Paid' | 'Defaulted'
  approvedBy?: number
  approvedDate?: Date
  rejectionReason?: string
  remarks?: string
  // Related data
  employeeName?: string
  employeeCode?: string
  departmentName?: string
  designationName?: string
  approvedByName?: string
  createDate?: Date
  createBy?: string
  editDate?: Date
  editBy?: string
}

export interface ILoanApplication {
  applicationId: number
  employeeId: number
  loanType: string
  requestedAmount: number
  purpose: string
  repaymentPeriod: number // in months
  monthlyIncome: number
  existingLoans: number
  applicationDate: Date
  status: string // 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected'
  submittedDate?: Date
  reviewedBy?: number
  reviewedDate?: Date
  approvedBy?: number
  approvedDate?: Date
  rejectionReason?: string
  remarks?: string
  // Related data
  employeeName?: string
  employeeCode?: string
  departmentName?: string
  designationName?: string
  reviewedByName?: string
  approvedByName?: string
  createDate?: Date
  createBy?: string
  editDate?: Date
  editBy?: string
}

export interface ILoanRepayment {
  repaymentId: number
  loanId: number
  employeeId: number
  paymentDate: Date
  paymentAmount: number
  principalAmount: number
  interestAmount: number
  remainingBalance: number
  paymentMethod: string // 'Salary Deduction' | 'Bank Transfer' | 'Cash'
  referenceNumber?: string
  remarks?: string
  // Related data
  employeeName?: string
  employeeCode?: string
  loanType?: string
  createDate?: Date
  createBy?: string
}

export interface ILoanApproval {
  approvalId: number
  applicationId: number
  approverId: number
  approvalStatus: string // 'Approved' | 'Rejected'
  approvalDate: Date
  approvedAmount?: number
  approvedInterestRate?: number
  approvedRepaymentPeriod?: number
  rejectionReason?: string
  remarks?: string
  // Related data
  employeeName?: string
  employeeCode?: string
  loanType?: string
  requestedAmount?: number
  approverName?: string
  createDate?: Date
  createBy?: string
}

export interface ILoanDashboard {
  totalLoans: number
  activeLoans: number
  pendingApplications: number
  totalLoanAmount: number
  totalOutstandingAmount: number
  monthlyRepayments: number
  overdueLoans: number
  recentApplications: ILoanApplication[]
  recentRepayments: ILoanRepayment[]
}

export interface ILoanFilter {
  employeeId?: number
  loanType?: string
  status?: string
  dateFrom?: Date
  dateTo?: Date
  amountFrom?: number
  amountTo?: number
}

export interface ILoanApplicationFilter {
  employeeId?: number
  loanType?: string
  status?: string
  dateFrom?: Date
  dateTo?: Date
  amountFrom?: number
  amountTo?: number
}

export interface ILoanRepaymentFilter {
  loanId?: number
  employeeId?: number
  dateFrom?: Date
  dateTo?: Date
  paymentMethod?: string
}

// Form data interfaces
export interface ILoanApplicationFormData {
  employeeId: number
  loanType: string
  requestedAmount: number
  purpose: string
  repaymentPeriod: number
  monthlyIncome: number
  existingLoans: number
  remarks?: string
}

export interface ILoanApprovalFormData {
  applicationId: number
  approvalStatus: string
  approvedAmount?: number
  approvedInterestRate?: number
  approvedRepaymentPeriod?: number
  rejectionReason?: string
  remarks?: string
}

export interface ILoanRepaymentFormData {
  loanId: number
  paymentDate: Date
  paymentAmount: number
  paymentMethod: string
  referenceNumber?: string
  remarks?: string
}
