import * as z from "zod"

export const approvalProcessSchema = z.object({
  processId: z.number().min(0),
  processName: z.string().min(1, { message: "Process name is required" }),
  moduleId: z.number().min(1, { message: "Module is required" }),
  transactionId: z.number().optional(),
  companyId: z.number().optional(),
  isActive: z.boolean(),
  createById: z.number().min(1, { message: "Creator is required" }),
  createdDate: z.date().optional(),
})

export type ApprovalProcessSchemaType = z.infer<typeof approvalProcessSchema>

export const approvalLevelSchema = z.object({
  levelId: z.number().min(0),
  processId: z.number().min(1, { message: "Process is required" }),
  levelNumber: z.number().min(1, { message: "Level number is required" }),
  userRoleId: z.number().min(1, { message: "User role is required" }),
  isFinal: z.boolean(),
})

export type ApprovalLevelSchemaType = z.infer<typeof approvalLevelSchema>

export const approvalRequestSchema = z.object({
  requestId: z.number().min(0),
  processId: z.number().min(1, { message: "Process is required" }),
  companyId: z.number().min(1, { message: "Company is required" }),
  referenceId: z.string().min(1, { message: "Reference ID is required" }),
  requestedById: z.number().min(1, { message: "Requested by is required" }),
  requestedDate: z.string().optional(),
  currentLevelId: z.number().min(1, { message: "Current level is required" }),
  statusId: z.number().min(1, { message: "Status type is required" }),
})

export type ApprovalRequestSchemaType = z.infer<typeof approvalRequestSchema>

export const approvalActionSchema = z.object({
  actionId: z.number().min(0),
  requestId: z.number().min(1, { message: "Request is required" }),
  levelId: z.number().min(1, { message: "Level is required" }),
  actionById: z.number().min(1, { message: "Action by is required" }),
  actionDate: z.string().optional(),
  statusId: z.number().min(1, { message: "Action type is required" }),
  remarks: z
    .string()
    .max(500, { message: "Remarks cannot exceed 500 characters" })
    .optional(),
})

export type ApprovalActionSchemaType = z.infer<typeof approvalActionSchema>

// Filter schemas
export const approvalProcessFilterSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type ApprovalProcessFilterValues = z.infer<
  typeof approvalProcessFilterSchema
>

export const approvalLevelFilterSchema = z.object({
  processId: z.number().optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type ApprovalLevelFilterValues = z.infer<
  typeof approvalLevelFilterSchema
>

export const approvalRequestFilterSchema = z.object({
  companyId: z.number().optional(),
  processId: z.number().optional(),
  status: z.enum(["Pending", "Approved", "Rejected", "Cancelled"]).optional(),
  requestedBy: z.number().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type ApprovalRequestFilterValues = z.infer<
  typeof approvalRequestFilterSchema
>

export const approvalActionFilterSchema = z.object({
  requestId: z.number().optional(),
  levelId: z.number().optional(),
  actionType: z.string().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type ApprovalActionFilterValues = z.infer<
  typeof approvalActionFilterSchema
>
