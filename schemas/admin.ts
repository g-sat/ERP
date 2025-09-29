import * as z from "zod"

export const userSchema = z.object({
  userId: z.number().min(0),
  userCode: z
    .string()
    .min(3, { message: "User code must be at least 3 characters" })
    .max(50, { message: "User code must be less than 50 characters" }),
  userName: z
    .string()
    .min(3, { message: "User name must be at least 3 characters" })
    .max(150, { message: "User name must be less than 150 characters" }),
  userEmail: z
    .string()
    .email({ message: "Invalid email format" })
    .max(50, { message: "User email must be less than 150 characters" }),
  userGroupId: z.number().min(1, { message: "User group is required" }),
  userRoleId: z.number().min(1, { message: "User role is required" }),
  employeeId: z.number().min(0, { message: "Employee is required" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional()
    .default(""),
  isActive: z.boolean().default(true),
  isLocked: z.boolean().default(false),
})

export type UserSchemaType = z.infer<typeof userSchema>

export const userGroupSchema = z.object({
  userGroupId: z
    .number()
    .min(0, { message: "User group ID must be 0 or greater" }),
  userGroupCode: z
    .string()
    .min(5, { message: "User group code must be at least 5 characters" })
    .max(50, { message: "User group code must be less than 50 characters" }),
  userGroupName: z
    .string()
    .min(5, { message: "User group name must be at least 5 characters" })
    .max(100, { message: "User group name must be less than 10 characters" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional()
    .default(""),
  isActive: z.boolean().default(true),
})

export type UserGroupSchemaType = z.infer<typeof userGroupSchema>

export const userRoleSchema = z.object({
  userRoleId: z
    .number()
    .min(0, { message: "User role ID must be 0 or greater" }),
  userRoleCode: z
    .string()
    .min(5, { message: "User role code must be at least 5 characters" })
    .max(50, { message: "User role code must be less than 50 characters" }),
  userRoleName: z
    .string()
    .min(5, { message: "User role name must be at least 5 characters" })
    .max(100, { message: "User role name must be less than 100 characters" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional()
    .default(""),
  isActive: z.boolean().default(true),
})

export type UserRoleSchemaType = z.infer<typeof userRoleSchema>

export const userFilterSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type UserFilterValues = z.infer<typeof userFilterSchema>

export const userGroupFilterSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type UserGroupFilterValues = z.infer<typeof userGroupFilterSchema>

export const userRoleFilterSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type UserRoleFilterValues = z.infer<typeof userRoleFilterSchema>

export const resetPasswordSchema = z.object({
  userId: z.number().min(1, { message: "User ID must be greater than 0" }),
  userCode: z.string().min(1, { message: "User code is required" }),
  userPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
  confirmPassword: z
    .string()
    .min(8, { message: "Confirm password must be at least 8 characters long" }),
})

export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>

export const userGroupRightsSchema = z.object({
  userGroupId: z
    .number()
    .min(1, { message: "User group ID must be greater than 0" }),
  moduleId: z.number().min(1, { message: "Module ID must be greater than 0" }),
  moduleName: z.string().min(1, { message: "Module name is required" }),
  transactionId: z
    .number()
    .min(1, { message: "Transaction ID must be greater than 0" }),
  transactionName: z
    .string()
    .min(1, { message: "Transaction name is required" }),
  isRead: z.boolean().default(false),
  isCreate: z.boolean().default(false),
  isEdit: z.boolean().default(false),
  isDelete: z.boolean().default(false),
  isExport: z.boolean().default(false),
  isPrint: z.boolean().default(false),
})

export type UserGroupRightsSchemaType = z.infer<typeof userGroupRightsSchema>

export const userRightsSchema = z.object({
  companyId: z
    .number()
    .min(1, { message: "Company ID must be greater than 0" }),
  companyCode: z.string().min(1, { message: "Company code is required" }),
  companyName: z.string().min(1, { message: "Company name is required" }),
  isAccess: z.boolean().default(false),
  userId: z.number(),
  userGroupId: z.number(),
})

export type UserRightsSchemaType = z.infer<typeof userRightsSchema>

export const cloneUserGroupRightsSchema = z.object({
  fromUserGroupId: z
    .number()
    .min(1, { message: "Source user group ID must be greater than 0" }),
  toUserGroupId: z
    .number()
    .min(1, { message: "Target user group ID must be greater than 0" }),
})

export type CloneUserGroupRightsSchemaType = z.infer<
  typeof cloneUserGroupRightsSchema
>

export const userProfileSchema = z.object({
  userId: z.number(),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  birthDate: z.string().optional().default(""),
  gender: z.enum(["M", "F", "O"]).optional().default("M"),
  profilePicture: z.string().optional().default(""),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),

  // Contact Information
  primaryContactType: z
    .enum(["Phone", "Email", "WhatsApp", "Skype", "Other"])
    .optional()
    .default("Phone"),
  primaryContactValue: z.string().optional().default(""),
  secondaryContactType: z
    .enum(["Phone", "Email", "WhatsApp", "Skype", "Other"])
    .optional()
    .default("Phone"),
  secondaryContactValue: z.string().optional().default(""),

  // Address Information
  addressType: z
    .enum(["Home", "Office", "Billing", "Shipping", "Other"])
    .optional()
    .default("Home"),
  street: z.string().optional().default(""),
  city: z.string().optional().default(""),
  state: z.string().optional().default(""),
  postalCode: z.string().optional().default(""),
  country: z.string().optional().default(""),

  // Preferences
  languagePreference: z.string().optional().default(""),
  themePreference: z
    .enum(["light", "dark", "system"])
    .optional()
    .default("light"),
  timezonePreference: z.string().optional().default(""),
})

export type UserProfileSchemaType = z.infer<typeof userProfileSchema>

// Password Schema
export const userPasswordSchema = z
  .object({
    userPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.userPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export type UserPasswordSchemaType = z.infer<typeof userPasswordSchema>
