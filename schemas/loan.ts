import * as z from "zod"

export const loanApplicationSchema = z.object({
  applicationId: z.number().optional(),
  employeeId: z.number().min(1, "Employee is required"),
  loanType: z.enum(
    ["Personal", "Housing", "Vehicle", "Education", "Emergency"],
    {
      required_error: "Loan type is required",
    }
  ),
  requestedAmount: z
    .number()
    .min(1000, "Minimum loan amount is 1,000")
    .max(1000000, "Maximum loan amount is 1,000,000"),
  purpose: z
    .string()
    .min(10, "Purpose must be at least 10 characters")
    .max(500, "Purpose must be less than 500 characters"),
  repaymentPeriod: z
    .number()
    .min(6, "Minimum repayment period is 6 months")
    .max(120, "Maximum repayment period is 120 months"),
  monthlyIncome: z.number().min(1000, "Monthly income must be at least 1,000"),
  existingLoans: z.number().min(0, "Existing loans cannot be negative"),
  remarks: z.string().optional(),
})

export const loanApprovalSchema = z.object({
  approvalId: z.number().optional(),
  applicationId: z.number().min(1, "Application is required"),
  approvalStatus: z.enum(["Approved", "Rejected"], {
    required_error: "Approval status is required",
  }),
  approvedAmount: z
    .number()
    .min(1000, "Approved amount must be at least 1,000")
    .optional(),
  approvedInterestRate: z
    .number()
    .min(0, "Interest rate must be positive")
    .max(20, "Interest rate cannot exceed 20%")
    .optional(),
  approvedRepaymentPeriod: z
    .number()
    .min(6, "Repayment period must be at least 6 months")
    .max(120, "Repayment period cannot exceed 120 months")
    .optional(),
  rejectionReason: z
    .string()
    .min(10, "Rejection reason must be at least 10 characters")
    .max(500, "Rejection reason must be less than 500 characters")
    .optional(),
  remarks: z.string().optional(),
})

export const loanRepaymentSchema = z.object({
  repaymentId: z.number().optional(),
  loanId: z.number().min(1, "Loan is required"),
  paymentDate: z.date({
    required_error: "Payment date is required",
  }),
  paymentAmount: z.number().min(1, "Payment amount must be positive"),
  paymentMethod: z.enum(["Salary Deduction", "Bank Transfer", "Cash"], {
    required_error: "Payment method is required",
  }),
  referenceNumber: z.string().optional(),
  remarks: z.string().optional(),
})

export const loanFilterSchema = z.object({
  employeeId: z.number().optional(),
  loanType: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  amountFrom: z.number().optional(),
  amountTo: z.number().optional(),
})

export const loanApplicationFilterSchema = z.object({
  employeeId: z.number().optional(),
  loanType: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  amountFrom: z.number().optional(),
  amountTo: z.number().optional(),
})

export const loanRepaymentFilterSchema = z.object({
  loanId: z.number().optional(),
  employeeId: z.number().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  paymentMethod: z.string().optional(),
})

// Form schemas
export const loanApplicationFormSchema = z.object({
  employeeId: z.number().min(1, "Employee is required"),
  loanType: z.enum(
    ["Personal", "Housing", "Vehicle", "Education", "Emergency"],
    {
      required_error: "Loan type is required",
    }
  ),
  requestedAmount: z
    .number()
    .min(1000, "Minimum loan amount is 1,000")
    .max(1000000, "Maximum loan amount is 1,000,000"),
  purpose: z
    .string()
    .min(10, "Purpose must be at least 10 characters")
    .max(500, "Purpose must be less than 500 characters"),
  repaymentPeriod: z
    .number()
    .min(6, "Minimum repayment period is 6 months")
    .max(120, "Maximum repayment period is 120 months"),
  monthlyIncome: z.number().min(1000, "Monthly income must be at least 1,000"),
  existingLoans: z.number().min(0, "Existing loans cannot be negative"),
  remarks: z.string().optional(),
})

export const loanApprovalFormSchema = z.object({
  applicationId: z.number().min(1, "Application is required"),
  approvalStatus: z.enum(["Approved", "Rejected"], {
    required_error: "Approval status is required",
  }),
  approvedAmount: z
    .number()
    .min(1000, "Approved amount must be at least 1,000")
    .optional(),
  approvedInterestRate: z
    .number()
    .min(0, "Interest rate must be positive")
    .max(20, "Interest rate cannot exceed 20%")
    .optional(),
  approvedRepaymentPeriod: z
    .number()
    .min(6, "Repayment period must be at least 6 months")
    .max(120, "Repayment period cannot exceed 120 months")
    .optional(),
  rejectionReason: z
    .string()
    .min(10, "Rejection reason must be at least 10 characters")
    .max(500, "Rejection reason must be less than 500 characters")
    .optional(),
  remarks: z.string().optional(),
})

export const loanRepaymentFormSchema = z.object({
  loanId: z.number().min(1, "Loan is required"),
  paymentDate: z.date({
    required_error: "Payment date is required",
  }),
  paymentAmount: z.number().min(1, "Payment amount must be positive"),
  paymentMethod: z.enum(["Salary Deduction", "Bank Transfer", "Cash"], {
    required_error: "Payment method is required",
  }),
  referenceNumber: z.string().optional(),
  remarks: z.string().optional(),
})

// Type exports
export type LoanApplicationFormData = z.infer<typeof loanApplicationFormSchema>
export type LoanApprovalFormData = z.infer<typeof loanApprovalFormSchema>
export type LoanRepaymentFormData = z.infer<typeof loanRepaymentFormSchema>
export type LoanFilterData = z.infer<typeof loanFilterSchema>
export type LoanApplicationFilterData = z.infer<
  typeof loanApplicationFilterSchema
>
export type LoanRepaymentFilterData = z.infer<typeof loanRepaymentFilterSchema>
