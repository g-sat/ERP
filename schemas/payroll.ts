import * as z from "zod"

export const componentSchema = z.object({
  componentId: z.number().min(0, "Payroll component ID is required"),
  componentCode: z.string().min(1, "Component code is required"),
  componentName: z.string().min(1, "Component name is required"),
  componentType: z.enum(["Earning", "Deduction"], {
    message: "Component type is required",
  }),
  isBonus: z.boolean(),
  isLeave: z.boolean(),
  isSalaryComponent: z.boolean(),
  sortOrder: z.number().min(1, "Sort order is required"),
  remarks: z.string().optional(),
  isActive: z.boolean(),
})

export type PayrollComponentFormData = z.infer<typeof componentSchema>

export const componentGroupDtSchema = z.object({
  componentId: z.number().min(1, "Payroll component is required"),
  payrollGroupId: z.number().min(1, "Payroll group is required"),
  sortOrder: z.number().min(1, "Sort order is required"),
})

export type PayrollComponentGroupDtFormData = z.infer<
  typeof componentGroupDtSchema
>

export const componentGroupSchema = z.object({
  groupId: z.number().min(1, "Group ID is required"),
  groupCode: z.string().min(1, "Group code is required"),
  groupName: z.string().min(1, "Group name is required"),
  remarks: z.string().optional(),
  isActive: z.boolean(),
  data_details: z.array(componentGroupDtSchema).min(1),
})

export type PayrollComponentGroupFormData = z.infer<typeof componentGroupSchema>

export const componentGLMappingSchema = z.object({
  mappingId: z.number().min(0, "Mapping ID must be non-negative"),
  componentId: z.number().min(0, "Payroll component is required"),
  companyId: z.number().min(0, "Company is required"),
  departmentId: z.number().min(0, "Department is required"),
  glId: z.number().min(0, "Expense GL is required"),
  isActive: z.boolean(),
})

export type PayrollComponentGLMappingFormData = z.infer<
  typeof componentGLMappingSchema
>

export const payrollEmployeeComponentSchema = z.object({
  payrollEmployeeId: z.number().min(0, "Payroll employee is required"),
  componentId: z.number().min(1, "Payroll component is required"),
  amount: z.number().min(0, "Amount must be non-negative"),
  remarks: z.string().optional(),
})

export type PayrollEmployeeComponentFormData = z.infer<
  typeof payrollEmployeeComponentSchema
>

export const payrollEmployeeSchema = z.object({
  payrollEmployeeId: z
    .number()
    .min(0, "Payroll employee ID must be non-negative"),
  employeeId: z.number().min(1, "Employee is required"),
  totalEarnings: z.number().min(0, "Total earnings must be non-negative"),
  totalDeductions: z.number().min(0, "Total deductions must be non-negative"),
  netSalary: z.number().min(0, "Net salary must be non-negative"),
  remarks: z.string().optional(),
  data_details: z.array(payrollEmployeeComponentSchema).min(1),
})

export type PayrollEmployeeFormData = z.infer<typeof payrollEmployeeSchema>

export const payrollTaxSchema = z.object({
  taxCode: z.string().min(1, "Tax code is required"),
  taxName: z.string().min(1, "Tax name is required"),
  taxType: z.enum(["INCOME_TAX", "SOCIAL_INSURANCE", "OTHER"], {
    message: "Tax type is required",
  }),
  minAmount: z.number().min(0, "Minimum amount must be non-negative"),
  maxAmount: z.number().optional(),
  taxRate: z.number().min(0, "Tax rate must be non-negative"),
  fixedAmount: z.number().optional(),
  remarks: z.string().optional(),
  isActive: z.boolean(),
})

export type PayrollTaxFormData = z.infer<typeof payrollTaxSchema>

export const payrollBankTransferSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  transferDate: z.date({
    message: "Transfer date is required",
  }),
  transferReference: z.string().min(1, "Transfer reference is required"),
  remarks: z.string().optional(),
})

export type PayrollBankTransferFormData = z.infer<
  typeof payrollBankTransferSchema
>

export const payrollProcessingSchema = z.object({
  employeeIds: z
    .array(z.number())
    .min(1, "At least one employee must be selected"),
  processOvertime: z.boolean(),
  processBonus: z.boolean(),
  processCommission: z.boolean(),
  processDeductions: z.boolean(),
  remarks: z.string().optional(),
})

export type PayrollProcessingFormData = z.infer<typeof payrollProcessingSchema>

export const payrollPaymentSchema = z.object({
  employeeIds: z
    .array(z.number())
    .min(1, "At least one employee must be selected"),
  paymentMethod: z.enum(["BANK_TRANSFER", "CASH", "CHEQUE"], {
    message: "Payment method is required",
  }),
  paymentDate: z.date({
    message: "Payment date is required",
  }),
  bankTransferRef: z.string().optional(),
  remarks: z.string().optional(),
})

export type PayrollPaymentFormData = z.infer<typeof payrollPaymentSchema>

//settings

export const employeeSalaryComponentSchema = z.object({
  employeeId: z.number().min(1, "Employee is required"),
  componentId: z.number().min(1, "Payroll component is required"),
  amount: z.number().min(0, "Amount must be non-negative"),
  effectiveFromDate: z.date({
    message: "Effective from date is required",
  }),
})

export type SalaryComponentFormData = z.infer<
  typeof employeeSalaryComponentSchema
>
