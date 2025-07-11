import { z } from "zod"

// HRMS Schemas based on database schema

export const hrDepartmentSchema = z.object({
  departmentId: z.number().optional(),
  departmentName: z
    .string()
    .min(1, "Department name is required")
    .max(50, "Department name must be less than 50 characters"),
  departmentCode: z
    .string()
    .min(1, "Department code is required")
    .max(50, "Department code must be less than 50 characters"),
  remarks: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const hrPositionSchema = z.object({
  positionId: z.number().optional(),
  positionName: z
    .string()
    .min(1, "Position name is required")
    .max(50, "Position name must be less than 50 characters"),
  positionCode: z
    .string()
    .min(1, "Position code is required")
    .max(50, "Position code must be less than 50 characters"),
  remarks: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const hrEmployeeSchema = z.object({
  employeeId: z.number().optional(),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  departmentId: z.number().min(1, "Department is required"),
  positionId: z.number().min(1, "Position is required"),
  hireDate: z.date().optional(),
  dateOfBirth: z.date().optional(),
  address: z
    .string()
    .max(100, "Address must be less than 100 characters")
    .optional(),
  phoneNumber: z
    .string()
    .max(20, "Phone number must be less than 20 characters")
    .optional(),
  email: z
    .string()
    .email("Invalid email format")
    .max(50, "Email must be less than 50 characters")
    .optional(),
})

export const hrSalaryComponentSchema = z.object({
  componentId: z.number().optional(),
  componentName: z
    .string()
    .min(1, "Component name is required")
    .max(50, "Component name must be less than 50 characters"),
  componentType: z.enum(["Allowance", "Deduction"], {
    required_error: "Component type is required",
  }),
})

export const hrEmployeeSalaryComponentSchema = z.object({
  employeeId: z.number().min(1, "Employee is required"),
  componentId: z.number().min(1, "Salary component is required"),
  amount: z.number().min(0, "Amount must be positive"),
  effectiveDate: z.date({
    required_error: "Effective date is required",
  }),
})

export const hrSalaryIncrementSchema = z.object({
  incrementId: z.number().optional(),
  employeeId: z.number().min(1, "Employee is required"),
  incrementAmount: z.number().min(0, "Increment amount must be positive"),
  incrementDate: z.date({
    required_error: "Increment date is required",
  }),
  reason: z
    .string()
    .max(100, "Reason must be less than 100 characters")
    .optional(),
  authorizedById: z.number().optional(),
})

export const hrLoanSchema = z.object({
  loanId: z.number().optional(),
  employeeId: z.number().min(1, "Employee is required"),
  loanAmount: z.number().min(0, "Loan amount must be positive"),
  loanDate: z.date({
    required_error: "Loan date is required",
  }),
  interestRate: z
    .number()
    .min(0, "Interest rate must be positive")
    .max(100, "Interest rate cannot exceed 100%")
    .optional(),
  repaymentTerms: z
    .string()
    .max(100, "Repayment terms must be less than 100 characters")
    .optional(),
  status: z.enum(["Active", "Paid", "Defaulted"], {
    required_error: "Status is required",
  }),
})

export const hrLeaveRequestSchema = z
  .object({
    requestId: z.number().optional(),
    employeeId: z.number().min(1, "Employee is required"),
    leaveType: z.enum(
      ["Annual", "Sick", "Personal", "Maternity", "Paternity"],
      {
        required_error: "Leave type is required",
      }
    ),
    startDate: z.date({
      required_error: "Start date is required",
    }),
    endDate: z.date({
      required_error: "End date is required",
    }),
    status: z.enum(["Pending", "Approved", "Rejected"]).default("Pending"),
    createdAt: z.number().optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  })

export const hrLeaveApprovalSchema = z.object({
  approvalId: z.number().optional(),
  requestId: z.number().min(1, "Leave request is required"),
  approverId: z.number().min(1, "Approver is required"),
  approvalStatus: z.enum(["Approved", "Rejected"], {
    required_error: "Approval status is required",
  }),
  approvalDate: z.date().optional(),
})

export const hrPayrollTransactionSchema = z
  .object({
    transactionId: z.number().optional(),
    employeeId: z.number().min(1, "Employee is required"),
    payPeriodStart: z.date({
      required_error: "Pay period start date is required",
    }),
    payPeriodEnd: z.date({
      required_error: "Pay period end date is required",
    }),
    basicSalary: z.number().min(0, "Basic salary must be positive"),
    totalAllowances: z.number().min(0, "Total allowances must be positive"),
    totalDeductions: z.number().min(0, "Total deductions must be positive"),
    netSalary: z.number().min(0, "Net salary must be positive"),
    paymentDate: z.date({
      required_error: "Payment date is required",
    }),
  })
  .refine((data) => data.payPeriodEnd >= data.payPeriodStart, {
    message: "Pay period end date must be after start date",
    path: ["payPeriodEnd"],
  })

export const hrPayrollDetailSchema = z.object({
  detailId: z.number().optional(),
  transactionId: z.number().min(1, "Payroll transaction is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(100, "Description must be less than 100 characters"),
  amount: z.number().min(0, "Amount must be positive"),
  type: z.enum(["Allowance", "Deduction"], {
    required_error: "Type is required",
  }),
})

// Form schemas for data entry
export const hrEmployeeFormSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  departmentId: z.number().min(1, "Department is required"),
  positionId: z.number().min(1, "Position is required"),
  hireDate: z.date().optional(),
  dateOfBirth: z.date().optional(),
  address: z
    .string()
    .max(100, "Address must be less than 100 characters")
    .optional(),
  phoneNumber: z
    .string()
    .max(20, "Phone number must be less than 20 characters")
    .optional(),
  email: z
    .string()
    .email("Invalid email format")
    .max(50, "Email must be less than 50 characters")
    .optional(),
})

export const hrLoanFormSchema = z.object({
  employeeId: z.number().min(1, "Employee is required"),
  loanAmount: z.number().min(0, "Loan amount must be positive"),
  loanDate: z.date({
    required_error: "Loan date is required",
  }),
  interestRate: z
    .number()
    .min(0, "Interest rate must be positive")
    .max(100, "Interest rate cannot exceed 100%")
    .optional(),
  repaymentTerms: z
    .string()
    .max(100, "Repayment terms must be less than 100 characters")
    .optional(),
})

export const hrLeaveRequestFormSchema = z
  .object({
    employeeId: z.number().min(1, "Employee is required"),
    leaveType: z.enum(
      ["Annual", "Sick", "Personal", "Maternity", "Paternity"],
      {
        required_error: "Leave type is required",
      }
    ),
    startDate: z.date({
      required_error: "Start date is required",
    }),
    endDate: z.date({
      required_error: "End date is required",
    }),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  })

export const hrSalaryIncrementFormSchema = z.object({
  employeeId: z.number().min(1, "Employee is required"),
  incrementAmount: z.number().min(0, "Increment amount must be positive"),
  incrementDate: z.date({
    required_error: "Increment date is required",
  }),
  reason: z
    .string()
    .max(100, "Reason must be less than 100 characters")
    .optional(),
  authorizedById: z.number().optional(),
})

// Search and filter schemas
export const hrEmployeeSearchSchema = z.object({
  search: z.string().optional(),
  departmentId: z.number().optional(),
  positionId: z.number().optional(),
  status: z.enum(["Active", "Inactive"]).optional(),
})

export const hrLoanSearchSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["Active", "Paid", "Defaulted"]).optional(),
  employeeId: z.number().optional(),
})

export const hrLeaveRequestSearchSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["Pending", "Approved", "Rejected"]).optional(),
  leaveType: z
    .enum(["Annual", "Sick", "Personal", "Maternity", "Paternity"])
    .optional(),
  employeeId: z.number().optional(),
})

export const hrPayrollSearchSchema = z.object({
  search: z.string().optional(),
  employeeId: z.number().optional(),
  payPeriodStart: z.date().optional(),
  payPeriodEnd: z.date().optional(),
})

// Type exports
export type HrDepartmentFormData = z.infer<typeof hrDepartmentSchema>
export type HrPositionFormData = z.infer<typeof hrPositionSchema>
export type HrEmployeeFormData = z.infer<typeof hrEmployeeFormSchema>
export type HrLoanFormData = z.infer<typeof hrLoanFormSchema>
export type HrLeaveRequestFormData = z.infer<typeof hrLeaveRequestFormSchema>
export type HrSalaryIncrementFormData = z.infer<
  typeof hrSalaryIncrementFormSchema
>
export type HrEmployeeSearchData = z.infer<typeof hrEmployeeSearchSchema>
export type HrLoanSearchData = z.infer<typeof hrLoanSearchSchema>
export type HrLeaveRequestSearchData = z.infer<
  typeof hrLeaveRequestSearchSchema
>
export type HrPayrollSearchData = z.infer<typeof hrPayrollSearchSchema>
