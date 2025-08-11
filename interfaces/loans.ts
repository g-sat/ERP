// LoanRequests.ts
export interface ILoanRequest {
  loanRequestId: number
  employeeId: number
  employeeName?: string
  employeeCode?: string
  loanTypeId: number
  loanTypeName?: string
  requestedAmount: number
  requestDate: string | Date
  emiStartDate: string
  desiredEMIAmount: number
  calculatedTermMonths: number
  statusId: number
  statusName: string
  createdById: number
  createdDate: string | Date
  editedById?: number
  editedDate?: string | Date
  createdBy: string
  editedBy?: string
  remarks?: string
}

// LoanApprovals.ts
export interface ILoanApproval {
  approvalId: number
  loanRequestId: number
  approverId: number
  approvalDate: string | Date
  approvedAmount: number
  revisedEMIStartDate?: string
  revisedEMIAmount?: number
  comments?: string
  decisionId: number
  createdById: number
  createdDate: string | Date
  createdBy: string
}

// LoanDisbursements.ts
export interface ILoanDisbursement {
  disbursementId: number
  loanRequestId: number
  disbursementDate: string
  amount: number
  transactionReference?: string
  methodId: number
  methodName: string
  createdById: number
  createdDate: string | Date
  createdBy: string
  editedById?: number
  editedDate?: string | Date
  editedBy?: string
}

// LoanRepaymentSchedule.ts
export interface ILoanRepayment {
  repaymentId: number
  loanRequestId: number
  installmentNumber: number
  dueDate: string
  emiAmount: number
  principalComponent: number
  interestComponent: number
  outstandingBalance: number
  statusId: number
  statusName: string
  paidDate?: string | Date
  totalRepaid?: number
  createdById: number
  createdDate: string | Date
  createdBy: string
  editedById?: number
  editedDate?: string | Date
  editedBy?: string
}

// LoanSkipRequests.ts
export interface ILoanSkipRequest {
  skipRequestId: number
  repaymentId: number
  loanRequestId: number
  employeeId: number
  skipRequestDate: string
  intendedResumeDate: string
  approverId: number
  approvalDate?: string | Date
  statusId: number
  statusName: string
  comments?: string
  createdById: number
  createdDate: string | Date
  createdBy: string
  editedById?: number
  editedDate?: string | Date
  editedBy?: string
}
// LoanType.ts
export interface ILoanType {
  loanTypeId: number
  loanTypeCode?: string
  loanTypeName: string
  interestRatePct: number
  maxTermMonths: number
  minTermMonths: number
  createById: number
  createDate?: string
}

export interface LoanRequestSchedule {
  loanRequestId: number
  employeeId: number
  employeeCode: string
  employeeName: string
  loanTypeId: number
  loanTypeName: string
  requestDate: string
  requestedAmount: number
  emiStartDate: string
  desiredEMIAmount: number
  calculatedTermMonths: number
  statusId: number
  requestStatus: string
  remarks: string
  disbursementDate: string
  closingDate?: string
  loanStatus: string
  nextInstallmentDueDate: string

  dueDate: string // ISO date string
  paidDate?: string | null // Optional ISO date string
  emi: number
  totalAmountRepaid: number
  remaining_Amount: number
  installmentStatusId: number
  installmentStatus: string

  // Aggregates
  pendingInstallments: number
  totalRepaidAmount: number
  totalRemainingAmount: number
}
