import * as z from "zod"

export const employeeSchema = z.object({
  employeeId: z.number(),

  employeeCode: z
    .string()
    .min(1, { message: "employee code is required" })
    .max(50, { message: "employee code cannot exceed 50 characters" }),
  employeeName: z
    .string()
    .min(2, { message: "employee name must be at least 2 characters" })
    .max(150, { message: "employee name cannot exceed 150 characters" }),
  employeeOtherName: z
    .string()
    .max(150, { message: "other name cannot exceed 150 characters" })
    .optional(),
  employeePhoto: z.string().optional(),
  employeeSignature: z.string().optional(),
  empCategoryId: z.number(),
  departmentId: z.number(),
  employeeSex: z.string(),
  martialStatus: z.string(),
  employeeDOB: z.date().optional(),
  employeeJoinDate: z.date().optional(),
  employeeLastDate: z.date().optional(),
  employeeOffEmailAdd: z.string().email().optional(),
  employeeOtherEmailAdd: z.string().email().optional(),

  isActive: z.boolean().default(true),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
})

export type EmployeeFormValues = z.infer<typeof employeeSchema>

export const employeeFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  departmentId: z.number().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type EmployeeFiltersValues = z.infer<typeof employeeFiltersSchema>

export const employeeCategorySchema = z.object({
  companyId: z.number(),
  empCategoryId: z.number(),
  empCategoryCode: z.string(),
  empCategoryName: z.string(),
  remarks: z.string(),
  isActive: z.boolean(),
})

export type EmployeeCategoryValues = z.infer<typeof employeeCategorySchema>

export const employeeBankSchema = z.object({
  employeeId: z.number(),
  itemNo: z.number(),
  bankName: z.string(),
  accountNo: z.string(),
  swiftCode: z.string(),
  iban: z.string(),
  remarks: z.string(),
  isDefaultBank: z.boolean(),
  isActive: z.boolean(),
})

export type EmployeeBankValues = z.infer<typeof employeeBankSchema>
