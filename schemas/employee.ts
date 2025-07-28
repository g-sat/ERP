import * as z from "zod"

export const employeeSchema = z.object({
  employeeId: z.number(),
  companyId: z.number().min(1, { message: "Company is required" }),
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
  genderId: z.number().min(1, { message: "Gender is required" }),
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
  offPhoneNo: z.string().optional().default(""),
  bankName: z.string().min(1, { message: "Bank name is required" }),
  accountNo: z.string().min(1, { message: "Account number is required" }),
  swiftCode: z.string().min(1, { message: "Swift code is required" }),
  iban: z.string().min(1, { message: "IBAN is required" }),
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
  passportNo: z.string().optional().default(""),
  passportExpiry: z.union([z.date(), z.string()]).optional().default(""),
  visaNo: z.string().optional().default(""),
  visaExpiry: z.union([z.date(), z.string()]).optional().default(""),
  nationality: z.string().optional().default(""),
  emiratesIDNo: z.string().optional().default(""),
  emiratesIDExpiry: z.union([z.date(), z.string()]).optional().default(""),
  mohreContractIDNo: z.string().optional().default(""),
  mohreContractExpiry: z.union([z.date(), z.string()]).optional().default(""),
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
