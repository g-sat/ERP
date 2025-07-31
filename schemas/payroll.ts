import * as z from "zod"

export const payrollPeriodSchema = z
  .object({
    periodName: z.string().min(1, "Period name is required"),
    startDate: z.date({
      required_error: "Start date is required",
    }),
    endDate: z.date({
      required_error: "End date is required",
    }),
    remarks: z.string().optional(),
    isActive: z.boolean().default(true),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  })

export type PayrollPeriodFormData = z.infer<typeof payrollPeriodSchema>

export const payrollEmployeeSchema = z.object({
  employeeId: z.number().min(1, "Employee is required"),
  payrollPeriodId: z.number().min(1, "Payroll period is required"),
  basicSalary: z.number().min(0, "Basic salary must be non-negative"),
  housingAllowance: z.number().min(0, "Housing allowance must be non-negative"),
  transportAllowance: z
    .number()
    .min(0, "Transport allowance must be non-negative"),
  otherAllowances: z.number().min(0, "Other allowances must be non-negative"),
  overtimeHours: z
    .number()
    .min(0, "Overtime hours must be non-negative")
    .optional(),
  overtimeRate: z
    .number()
    .min(0, "Overtime rate must be non-negative")
    .optional(),
  overtimeAmount: z
    .number()
    .min(0, "Overtime amount must be non-negative")
    .optional(),
  bonusAmount: z
    .number()
    .min(0, "Bonus amount must be non-negative")
    .optional(),
  commissionAmount: z
    .number()
    .min(0, "Commission amount must be non-negative")
    .optional(),
  leaveDeduction: z
    .number()
    .min(0, "Leave deduction must be non-negative")
    .optional(),
  lateDeduction: z
    .number()
    .min(0, "Late deduction must be non-negative")
    .optional(),
  otherEarnings: z
    .number()
    .min(0, "Other earnings must be non-negative")
    .optional(),
  otherDeductions: z
    .number()
    .min(0, "Other deductions must be non-negative")
    .optional(),
  remarks: z.string().optional(),
})

export type PayrollEmployeeFormData = z.infer<typeof payrollEmployeeSchema>

export const payrollComponentSchema = z
  .object({
    componentCode: z.string().min(1, "Component code is required"),
    componentName: z.string().min(1, "Component name is required"),
    componentType: z.enum(["EARNING", "DEDUCTION"], {
      required_error: "Component type is required",
    }),
    isTaxable: z.boolean().default(false),
    isOvertime: z.boolean().default(false),
    isBonus: z.boolean().default(false),
    isCommission: z.boolean().default(false),
    isLeave: z.boolean().default(false),
    isLate: z.boolean().default(false),
    isSocialInsurance: z.boolean().default(false),
    calculationType: z.enum(["FIXED", "PERCENTAGE", "FORMULA"], {
      required_error: "Calculation type is required",
    }),
    calculationValue: z.number().optional(),
    calculationFormula: z.string().optional(),
    sortOrder: z.number().min(1, "Sort order is required"),
    remarks: z.string().optional(),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.calculationType === "FORMULA") {
        return (
          data.calculationFormula && data.calculationFormula.trim().length > 0
        )
      } else {
        return data.calculationValue !== undefined && data.calculationValue >= 0
      }
    },
    {
      message: "Calculation value or formula is required",
      path: ["calculationValue"],
    }
  )

export type PayrollComponentFormData = z.infer<typeof payrollComponentSchema>

export const payrollComponentGroupDtSchema = z.object({
  payrollComponentId: z.number().min(1, "Payroll component is required"),
  payrollGroupId: z.number().min(1, "Payroll group is required"),
  sortOrder: z.number().min(1, "Sort order is required"),
})

export type PayrollComponentGroupDtFormData = z.infer<
  typeof payrollComponentGroupDtSchema
>

export const payrollComponentGroupSchema = z.object({
  groupId: z.number().min(1, "Group ID is required"),
  groupCode: z.string().min(1, "Group code is required"),
  groupName: z.string().min(1, "Group name is required"),
  remarks: z.string().optional(),
  isActive: z.boolean().default(true),
  data_details: z.array(payrollComponentGroupDtSchema).min(1),
})

export type PayrollComponentGroupFormData = z.infer<
  typeof payrollComponentGroupSchema
>

export const payrollComponentGLMappingSchema = z.object({
  mappingId: z.number().min(0, "Mapping ID must be non-negative"),
  payrollComponentId: z.number().min(0, "Payroll component is required"),
  companyId: z.number().min(0, "Company is required"),
  departmentId: z.number().min(0, "Department is required"),
  expenseGLId: z.number().min(0, "Expense GL is required"),
  isActive: z.boolean().default(true),
})

export type PayrollComponentGLMappingFormData = z.infer<
  typeof payrollComponentGLMappingSchema
>

export const payrollTaxSchema = z.object({
  taxCode: z.string().min(1, "Tax code is required"),
  taxName: z.string().min(1, "Tax name is required"),
  taxType: z.enum(["INCOME_TAX", "SOCIAL_INSURANCE", "OTHER"], {
    required_error: "Tax type is required",
  }),
  minAmount: z.number().min(0, "Minimum amount must be non-negative"),
  maxAmount: z.number().optional(),
  taxRate: z.number().min(0, "Tax rate must be non-negative"),
  fixedAmount: z.number().optional(),
  remarks: z.string().optional(),
  isActive: z.boolean().default(true),
})

export type PayrollTaxFormData = z.infer<typeof payrollTaxSchema>

export const payrollBankTransferSchema = z.object({
  payrollPeriodId: z.number().min(1, "Payroll period is required"),
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  transferDate: z.date({
    required_error: "Transfer date is required",
  }),
  transferReference: z.string().min(1, "Transfer reference is required"),
  remarks: z.string().optional(),
})

export type PayrollBankTransferFormData = z.infer<
  typeof payrollBankTransferSchema
>

export const payrollEmployeeComponentSchema = z.object({
  payrollEmployeeId: z.number().min(1, "Payroll employee is required"),
  payrollComponentId: z.number().min(1, "Payroll component is required"),
  amount: z.number().min(0, "Amount must be non-negative"),
  remarks: z.string().optional(),
})

export type PayrollEmployeeComponentFormData = z.infer<
  typeof payrollEmployeeComponentSchema
>

export const payrollProcessingSchema = z.object({
  payrollPeriodId: z.number().min(1, "Payroll period is required"),
  employeeIds: z
    .array(z.number())
    .min(1, "At least one employee must be selected"),
  processOvertime: z.boolean().default(true),
  processBonus: z.boolean().default(true),
  processCommission: z.boolean().default(true),
  processDeductions: z.boolean().default(true),
  remarks: z.string().optional(),
})

export type PayrollProcessingFormData = z.infer<typeof payrollProcessingSchema>

export const payrollPaymentSchema = z.object({
  payrollPeriodId: z.number().min(1, "Payroll period is required"),
  employeeIds: z
    .array(z.number())
    .min(1, "At least one employee must be selected"),
  paymentMethod: z.enum(["BANK_TRANSFER", "CASH", "CHEQUE"], {
    required_error: "Payment method is required",
  }),
  paymentDate: z.date({
    required_error: "Payment date is required",
  }),
  bankTransferRef: z.string().optional(),
  remarks: z.string().optional(),
})

export type PayrollPaymentFormData = z.infer<typeof payrollPaymentSchema>
