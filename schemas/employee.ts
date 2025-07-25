import * as z from "zod"

export const employeeSchema = z.object({
  employeeId: z.number(),
  companyId: z.number(),
  code: z.string().min(1, { message: "Employee code is required" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  otherName: z.string().optional().default(""),
  photo: z.string().optional().default(""),
  signature: z.string().optional().default(""),
  empCategoryId: z
    .number()
    .min(1, { message: "Employee category is required" }),
  departmentId: z.number().min(1, { message: "Department is required" }),
  gender: z.string().min(1, { message: "Gender is required" }),
  martialStatus: z.string().optional().default(""),
  dob: z
    .union([z.date(), z.string()])
    .refine((val) => val !== "" && val !== null && val !== undefined, {
      message: "Date of birth is required",
    }),
  joinDate: z
    .union([z.date(), z.string()])
    .refine((val) => val !== "" && val !== null && val !== undefined, {
      message: "Join date is required",
    }),
  lastDate: z.union([z.date(), z.string()]).optional().default(""),
  phoneNo: z.string().optional().default(""),
  offEmailAdd: z
    .string()
    .email({ message: "Invalid office email format" })
    .optional()
    .default(""),
  otherEmailAdd: z
    .string()
    .optional()
    .default("")
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Invalid other email format",
    }),
  isActive: z.boolean().default(true),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional()
    .default(""),
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
