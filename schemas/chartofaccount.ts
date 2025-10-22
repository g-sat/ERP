import * as z from "zod"

export const chartofAccountSchema = z.object({
  glId: z.number(),
  glCode: z
    .string()
    .min(1, { message: "GL code is required" })
    .max(50, { message: "GL code cannot exceed 50 characters" }),
  glName: z
    .string()
    .min(2, { message: "GL name must be at least 2 characters" })
    .max(150, { message: "GL name cannot exceed 150 characters" }),
  accTypeId: z.number().min(1, { message: "Account type is required" }),
  accGroupId: z.number().min(1, { message: "Account group is required" }),
  coaCategoryId1: z.number().min(1, { message: "Category 1 is required" }),
  coaCategoryId2: z.number().min(0, { message: "Category 2 is required" }),
  coaCategoryId3: z.number().min(0, { message: "Category 3 is required" }),
  isSysControl: z.boolean(),
  isDeptMandatory: z.boolean(),
  isBargeMandatory: z.boolean(),
  isJobSpecific: z.boolean(),
  isBankAccount: z.boolean(),
  isOperational: z.boolean(),
  isPayableAccount: z.boolean(),
  isReceivableAccount: z.boolean(),
  isUniversal: z.boolean(),
  seqNo: z.number(),
  isActive: z.boolean(),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
})

export type ChartOfAccountSchemaType = z.infer<typeof chartofAccountSchema>

export const chartofAccountFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  accTypeId: z.number().optional(),
  accGroupId: z.number().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type ChartOfAccountFiltersValues = z.infer<
  typeof chartofAccountFiltersSchema
>
