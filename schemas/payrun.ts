import * as z from "zod"

// Payrun Dashboard Schema
export const payrollDashboardSchema = z.object({
  payrollRunId: z.number().min(0),
  month: z.string().min(1, "Month is required"),
  payPeriodStart: z.union([z.string(), z.date()]),
  payPeriodEnd: z.union([z.string(), z.date()]),
  paymentDate: z.union([z.string(), z.date()]),
  employeeCount: z.number().min(0),
  totalNetPay: z.string(),
  status: z.string(),
  warningMessage: z.string().optional(),
  showCreatePayRunButton: z.boolean(),
  showViewDetailsButton: z.boolean(),
  showViewDetailsAndPayButton: z.boolean(),
})

// Payrun Employee Detail Schema
export const payrollEmployeeDtSchema = z.object({
  id: z.number().min(0),
  type: z.string().min(1, "Type is required"),
  description: z.string().min(1, "Description is required"),
  amount: z.number().min(0, "Amount must be non-negative"),
})

// Payrun Employee Header Schema
export const payrollEmployeeHdSchema = z.object({
  payrollEmployeeId: z.number().min(0),
  employeeId: z.number().min(0),
  employeeCode: z.string().min(1, "Employee code is required"),
  employeeName: z.string().min(1, "Employee name is required"),
  presentDays: z.number().min(0, "Present days must be non-negative"),
  totalEarnings: z.number().min(0, "Total earnings must be non-negative"),
  totalDeductions: z.number().min(0, "Total deductions must be non-negative"),
  netSalary: z.number().min(0, "Net salary must be non-negative"),
  remarks: z.string().optional(),
  isDraft: z.boolean(),
  data_details: z.array(payrollEmployeeDtSchema).optional(),
  paymentMode: z.string().optional(),
  paymentStatus: z.string().optional(),
})

// Payrun History Schema
export const payRunHistorySchema = z.object({
  id: z.number().min(0),
  paymentDate: z.string().min(1, "Payment date is required"),
  payrollType: z.string().min(1, "Payroll type is required"),
  payrollPeriod: z.string().min(1, "Payroll period is required"),
  status: z.string().min(1, "Status is required"),
  totalAmount: z.number().min(0, "Total amount must be non-negative"),
  employeeCount: z.number().min(0, "Employee count must be non-negative"),
})

// Payrun Summary Schema
export const payRunSummarySchema = z.object({
  id: z.number().min(0),
  payrollType: z.string().min(1, "Payroll type is required"),
  period: z.string().min(1, "Period is required"),
  baseDays: z.number().min(1, "Base days must be at least 1"),
  payDay: z
    .number()
    .min(1, "Pay day must be at least 1")
    .max(31, "Pay day cannot exceed 31"),
  month: z.string().min(1, "Month is required"),
  year: z
    .number()
    .min(2020, "Year must be 2020 or later")
    .max(2030, "Year must be 2030 or earlier"),
  employeeCount: z.number().min(0, "Employee count must be non-negative"),
  status: z.string().min(1, "Status is required"),
  payrollCost: z.number().min(0, "Payroll cost must be non-negative"),
  totalNetPay: z.number().min(0, "Total net pay must be non-negative"),
  totalDeductions: z.number().min(0, "Total deductions must be non-negative"),
  totalBenefits: z.number().min(0, "Total benefits must be non-negative"),
  totalDonations: z.number().min(0, "Total donations must be non-negative"),
})

// Employee Schema for Payrun
export const employeeSchema = z.object({
  id: z.number().min(0),
  name: z.string().min(1, "Name is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  paidDays: z.number().min(0, "Paid days must be non-negative"),
  grossPay: z.number().min(0, "Gross pay must be non-negative"),
  benefits: z.number().min(0, "Benefits must be non-negative"),
  netPay: z.number().min(0, "Net pay must be non-negative"),
  earnings: z.object({
    basic: z.number().min(0, "Basic salary must be non-negative"),
    housingAllowance: z
      .number()
      .min(0, "Housing allowance must be non-negative"),
    costOfLivingAllowance: z
      .number()
      .min(0, "Cost of living allowance must be non-negative"),
    otherAllowance: z.number().min(0, "Other allowance must be non-negative"),
  }),
  deductions: z.object({
    personalLoans: z.number().min(0, "Personal loans must be non-negative"),
    actualLoanAmount: z
      .number()
      .min(0, "Actual loan amount must be non-negative"),
  }),
})

// Payrun Filter Schema
export const payRunFilterSchema = z.object({
  status: z.string().optional(),
  payrollType: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  employeeId: z.string().optional(),
  search: z.string().optional(),
})

// Payrun Process Schema
export const payRunProcessSchema = z.object({
  payrollRunId: z.number().min(0, "Payroll run ID is required"),
  action: z.enum(["process", "approve", "reject", "draft"], {
    message: "Action is required",
  }),
  processedBy: z.string().min(1, "Processed by is required"),
  processedDate: z.string().min(1, "Processed date is required"),
  remarks: z.string().optional(),
})

// Payrun Payment Schema
export const payRunPaymentSchema = z.object({
  payrollRunId: z.number().min(0, "Payroll run ID is required"),
  employeeIds: z
    .array(z.number().min(0))
    .min(1, "At least one employee must be selected"),
  paymentMode: z.string().min(1, "Payment mode is required"),
  paymentDate: z.string().min(1, "Payment date is required"),
  totalAmount: z.number().min(0, "Total amount must be non-negative"),
  paymentReference: z.string().optional(),
  remarks: z.string().optional(),
})

// Payrun Component Schema
export const payRunComponentSchema = z.object({
  componentId: z.number().min(0),
  componentName: z.string().min(1, "Component name is required"),
  componentType: z.enum(["EARNING", "DEDUCTION", "BENEFIT"], {
    message: "Component type is required",
  }),
  amount: z.number().min(0, "Amount must be non-negative"),
  percentage: z.number().min(0).max(100).optional(),
  isActive: z.boolean(),
})

// Save Payrun Component Schema
export const savePayrunComponentSchema = z.object({
  payrollEmployeeId: z.number().min(1, "Payroll employee ID is required"),
  payrollRunId: z.number().min(1, "Payroll run ID is required"),
  employeeId: z.number().min(1, "Employee ID is required"),
  componentId: z.number().min(1, "Component ID is required"),
  amount: z.number().min(0, "Amount must be non-negative"),
  presentDays: z
    .number()
    .min(0)
    .max(30, "Present days must be between 0 and 30"),
  pastDays: z.number().min(0).max(30, "Past days must be between 0 and 30"),
})

// Payrun Settings Schema
export const payRunSettingsSchema = z.object({
  companyId: z.string().min(1, "Company ID is required"),
  defaultPaymentMode: z.string().min(1, "Default payment mode is required"),
  autoApprove: z.boolean(),
  requireApproval: z.boolean(),
  notificationEnabled: z.boolean(),
  taxCalculationMethod: z.string().min(1, "Tax calculation method is required"),
  roundingMethod: z.string().min(1, "Rounding method is required"),
})

// Export types
export type PayrollDashboardSchemaType = z.infer<typeof payrollDashboardSchema>
export type PayrollEmployeeHdSchemaType = z.infer<
  typeof payrollEmployeeHdSchema
>
export type PayrollEmployeeDtSchemaType = z.infer<
  typeof payrollEmployeeDtSchema
>
export type PayRunHistorySchemaType = z.infer<typeof payRunHistorySchema>
export type PayRunSummarySchemaType = z.infer<typeof payRunSummarySchema>
export type EmployeeSchemaType = z.infer<typeof employeeSchema>
export type PayRunFilterSchemaType = z.infer<typeof payRunFilterSchema>
export type PayRunProcessSchemaType = z.infer<typeof payRunProcessSchema>
export type PayRunPaymentSchemaType = z.infer<typeof payRunPaymentSchema>
export type PayRunComponentSchemaType = z.infer<typeof payRunComponentSchema>
export type SavePayrunComponentSchemaType = z.infer<
  typeof savePayrunComponentSchema
>
export type PayRunSettingsSchemaType = z.infer<typeof payRunSettingsSchema>
