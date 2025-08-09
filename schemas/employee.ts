import * as z from "zod"

export const employeeSchema = z.object({
  employeeId: z.number(),
  companyId: z.number().min(1, { message: "Company is required" }),
  employeeCode: z.string().min(1, { message: "Employee code is required" }),
  employeeName: z.string().min(1, { message: "Employee name is required" }),
  otherName: z.string().optional().default(""),
  photo: z.string().optional().default(""),
  signature: z.string().optional().default(""),
  departmentId: z.number().min(1, { message: "Department is required" }),
  designationId: z.number().min(1, { message: "Designation is required" }),
  workLocationId: z.number().min(1, { message: "Work location is required" }),
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
  isGCCEmployeeNational: z.boolean().default(false),
  nationalityId: z.number().min(1, { message: "Nationality is required" }),
  emiratesIDNo: z.string().optional().default(""),
  emiratesIDExpiry: z.union([z.date(), z.string()]).optional().default(""),
  moiNo: z.string().optional().default(""),
  moiExpiry: z.union([z.date(), z.string()]).optional().default(""),
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

export const employeeBasicSchema = z.object({
  employeeId: z.number().min(0, { message: "Employee is required" }),
  companyId: z.number().min(1, { message: "Company is required" }),
  companyName: z.string().optional().default(""),
  employeeCode: z.string().min(1, { message: "Employee code is required" }),
  employeeName: z.string().min(1, { message: "Employee name is required" }),
  otherName: z.string().optional().default(""),
  photo: z.string().optional().default(""),
  signature: z.string().optional().default(""),
  departmentId: z.number().min(1, { message: "Department is required" }),
  designationId: z.number().min(1, { message: "Designation is required" }),
  workLocationId: z.number().min(1, { message: "Work location is required" }),
  genderId: z.number().min(1, { message: "Gender is required" }),
  joinDate: z
    .union([z.date(), z.string()])
    .refine((val) => val !== "" && val !== null && val !== undefined, {
      message: "Join date is required",
    }),
  confirmationDate: z.union([z.date(), z.string()]).optional().default(""),
  lastDate: z.union([z.date(), z.string()]).optional().default(""),
  phoneNo: z.string().optional().default(""),
  offPhoneNo: z.string().optional().default(""),
  offEmailAdd: z
    .string()
    .email({ message: "Invalid office email format" })
    .optional()
    .default(""),
  nationalityId: z.number().min(1, { message: "Nationality is required" }),
  employmentType: z.string().optional().default(""),
  contractType: z.string().optional().default(""),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional()
    .default(""),
  isActive: z.boolean().default(true),
})

export type EmployeeBasicValues = z.infer<typeof employeeBasicSchema>

export const employeePersonalDetailsSchema = z.object({
  employeeId: z.number().min(1, { message: "Employee is required" }),
  dateOfBirth: z
    .union([z.date(), z.string()])
    .refine((val) => val !== "" && val !== null && val !== undefined, {
      message: "Date of birth is required",
    }),
  fatherName: z.string().optional().default(""),
  age: z.number().optional().default(0),
  permanentAddress: z.string().optional().default(""),
  currentAddress: z.string().optional().default(""),
  molId: z.string().optional().default(""),
  emailAdd: z.string().optional().default(""),
})

export type EmployeePersonalDetailsValues = z.infer<
  typeof employeePersonalDetailsSchema
>

export const employeeBankSchema = z.object({
  employeeId: z.number().min(1, { message: "Employee is required" }),
  bankName: z.string().min(1, { message: "Bank name is required" }),
  accountNo: z.string().min(1, { message: "Account number is required" }),
  swiftCode: z.string().min(1, { message: "Swift code is required" }),
  iban: z.string().min(1, { message: "IBAN is required" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional()
    .default(""),
  isActive: z.boolean().default(true),
})

export type EmployeeBankValues = z.infer<typeof employeeBankSchema>
