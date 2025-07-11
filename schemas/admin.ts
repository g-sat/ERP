import * as z from "zod"

export const userSchema = z.object({
  userId: z.number().min(0),
  userCode: z.string().min(1, { message: "User code is required" }),
  userName: z.string().min(1, { message: "User name is required" }),
  userEmail: z.string().email({ message: "Invalid email format" }),
  userGroupId: z.number().min(0, { message: "User group is required" }),
  userRoleId: z.number().min(0, { message: "User role is required" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean().default(true),
  isLocked: z.boolean().default(false),
})

export type UserFormValues = z.infer<typeof userSchema>

export const userGroupSchema = z.object({
  userGroupId: z
    .number()
    .min(1, { message: "User group ID must be greater than 0" }),
  userGroupCode: z.string().min(1, { message: "User group code is required" }),
  userGroupName: z.string().min(1, { message: "User group name is required" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type UserGroupFormValues = z.infer<typeof userGroupSchema>

export const userRoleSchema = z.object({
  userRoleId: z
    .number()
    .min(1, { message: "User role ID must be greater than 0" }),
  userRoleCode: z.string().min(1, { message: "User role code is required" }),
  userRoleName: z.string().min(1, { message: "User role name is required" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type UserRoleFormValues = z.infer<typeof userRoleSchema>

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
  userPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
  confirmPassword: z
    .string()
    .min(8, { message: "Confirm password must be at least 8 characters long" }),
})

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

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
  isRead: z.boolean(),
  isCreate: z.boolean(),
  isEdit: z.boolean(),
  isDelete: z.boolean(),
  isExport: z.boolean(),
  isPrint: z.boolean(),
})

export type UserGroupRightsFormValues = z.infer<typeof userGroupRightsSchema>

export const userRightsSchema = z.object({
  companyId: z
    .number()
    .min(1, { message: "Company ID must be greater than 0" }),
  companyCode: z.string().min(1, { message: "Company code is required" }),
  companyName: z.string().min(1, { message: "Company name is required" }),
  isAccess: z.boolean(),
  userId: z.number(),
  userGroupId: z.number(),
  createById: z
    .number()
    .min(1, { message: "Creator ID must be greater than 0" }),
  createBy: z.string().min(1, { message: "Creator name is required" }),
})

export type UserRightsFormValues = z.infer<typeof userRightsSchema>

export const cloneUserGroupRightsSchema = z.object({
  fromUserGroupId: z
    .number()
    .min(1, { message: "Source user group ID must be greater than 0" }),
  toUserGroupId: z
    .number()
    .min(1, { message: "Target user group ID must be greater than 0" }),
})

export type CloneUserGroupRightsFormValues = z.infer<
  typeof cloneUserGroupRightsSchema
>
