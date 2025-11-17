import * as z from "zod"

export const employeeSchema = z.object({
  employeeId: z.number(),
  companyId: z.number().min(1, { message: "Company is required" }),
  employeeCode: z.string().min(1, { message: "Employee code is required" }),
  employeeName: z.string().min(1, { message: "Employee name is required" }),
  photo: z.string().optional(),
  departmentId: z.number().min(1, { message: "Department is required" }),
  designationId: z.number().min(1, { message: "Designation is required" }),
  workLocationId: z.number().min(1, { message: "Work location is required" }),
  genderId: z.number().min(1, { message: "Gender is required" }),
  martialStatus: z.string().optional(),
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
  lastDate: z.union([z.date(), z.string()]).optional(),
  phoneNo: z.string().optional(),
  offPhoneNo: z.string().optional(),
  bankName: z.string().min(1, { message: "Bank name is required" }),
  accountNo: z.string().min(1, { message: "Account number is required" }),
  swiftCode: z.string().min(1, { message: "Swift code is required" }),
  iban: z.string().min(1, { message: "IBAN is required" }),
  offEmailAdd: z
    .string()
    .email({ message: "Invalid office email format" })
    .optional(),
  otherEmailAdd: z
    .string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Invalid other email format",
    }),
  passportNo: z.string().optional(),
  passportExpiry: z.union([z.date(), z.string()]).optional(),
  visaNo: z.string().optional(),
  visaExpiry: z.union([z.date(), z.string()]).optional(),
  isGCCEmployeeNational: z.boolean(),
  nationalityId: z.number().min(1, { message: "Nationality is required" }),
  emiratesIDNo: z.string().optional(),
  emiratesIDExpiry: z.union([z.date(), z.string()]).optional(),
  moiNo: z.string().optional(),
  moiExpiry: z.union([z.date(), z.string()]).optional(),
  isActive: z.boolean(),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
})

export type EmployeeSchemaType = z.infer<typeof employeeSchema>

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
  employerId: z.number().min(1, { message: "Employer is required" }),
  employeeCode: z.string().min(1, { message: "Employee code is required" }),
  employeeName: z.string().min(1, { message: "Employee name is required" }),
  photo: z.string().optional(),
  departmentId: z.number().min(1, { message: "Department is required" }),
  designationId: z.number().min(1, { message: "Designation is required" }),
  workLocationId: z.number().min(1, { message: "Work location is required" }),
  genderId: z.number().min(1, { message: "Gender is required" }),
  joinDate: z
    .union([z.date(), z.string()])
    .refine((val) => val !== "" && val !== null && val !== undefined, {
      message: "Join date is required",
    }),
  lastDate: z.union([z.date(), z.string()]).optional(),
  phoneNo: z.string().optional(),
  offPhoneNo: z.string().optional(),
  offEmailAdd: z
    .string()
    .email({ message: "Invalid office email format" })
    .optional(),
  nationalityId: z.number().min(1, { message: "Nationality is required" }),
  employmentType: z.string().optional(),
  contractType: z.string().optional(),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
  dayOfWeek: z.number().min(1, { message: "Day of week is required" }),
})

export type EmployeeBasicValues = z.infer<typeof employeeBasicSchema>

export const employeePersonalDetailsSchema = z.object({
  employeeId: z.number().min(1, { message: "Employee is required" }),
  dob: z
    .union([z.date(), z.string()])
    .refine((val) => val !== "" && val !== null && val !== undefined, {
      message: "Date of birth is required",
    }),
  fatherName: z.string().optional(),
  age: z.number().optional(),
  permanentAddress: z.string().optional(),
  currentAddress: z.string().optional(),
  workPermitNo: z.string().optional(),
  personalNo: z.string().optional(),
  emailAdd: z.string().optional(),
  passportNo: z.string().optional(),
  passportExpiryDate: z.union([z.date(), z.string()]).optional(),
  emiratesIdNo: z.string().optional(),
  emiratesIdExpiryDate: z.union([z.date(), z.string()]).optional(),
  emergencyContactNo: z.string().optional(),
  personalContactNo: z.string().optional(),
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
  glId: z.number(),
})

export type EmployeeBankValues = z.infer<typeof employeeBankSchema>
