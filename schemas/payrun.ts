import * as z from "zod"

export const payRunFormSchema = z
  .object({
    payrollType: z.enum(
      [
        "Regular Payroll",
        "Bonus Payroll",
        "Overtime Payroll",
        "Commission Payroll",
      ],
      {
        required_error: "Payroll type is required",
      }
    ),
    startDate: z.date({
      required_error: "Start date is required",
    }),
    endDate: z.date({
      required_error: "End date is required",
    }),
    paymentDate: z.date({
      required_error: "Payment date is required",
    }),
    employeeCount: z
      .number()
      .min(1, "Employee count must be at least 1")
      .max(1000, "Employee count cannot exceed 1000"),
    totalAmount: z
      .number()
      .min(0, "Total amount cannot be negative")
      .max(10000000, "Total amount cannot exceed 10,000,000"),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "Start date must be before or equal to end date",
    path: ["endDate"],
  })
  .refine((data) => data.endDate <= data.paymentDate, {
    message: "Payment date must be after or equal to end date",
    path: ["paymentDate"],
  })

export const payRunFilterSchema = z.object({
  payrollType: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  employeeCount: z.number().optional(),
})

// Type exports
export type PayRunFormData = z.infer<typeof payRunFormSchema>
export type PayRunFilterData = z.infer<typeof payRunFilterSchema>
