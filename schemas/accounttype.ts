import * as z from "zod"

export const accountTypeSchema = z.object({
  accTypeId: z.number(),
  accTypeCode: z
    .string()
    .min(1, { message: "account type code is required" })
    .max(50, { message: "account type code cannot exceed 50 characters" }),
  accTypeName: z
    .string()
    .min(2, { message: "account type name must be at least 2 characters" })
    .max(150, { message: "account type name cannot exceed 150 characters" }),
  seqNo: z.number(),
  accGroupName: z
    .string()
    .min(2, { message: "account group name must be at least 2 characters" })
    .max(150, { message: "account group name cannot exceed 150 characters" }),

  isActive: z.boolean(),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
})

export type AccountTypeSchemaType = z.infer<typeof accountTypeSchema>

export const accountTypeFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type AccountTypeFiltersValues = z.infer<typeof accountTypeFiltersSchema>
