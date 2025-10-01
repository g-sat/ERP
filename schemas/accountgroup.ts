import * as z from "zod"

export const accountGroupSchema = z.object({
  accGroupId: z
    .number()
    .min(0, { message: "account group must be 0 or greater" }),
  accGroupCode: z
    .string()
    .min(1, { message: "account group code is required" })
    .max(50, { message: "account group code cannot exceed 50 characters" }),
  accGroupName: z
    .string()
    .min(2, { message: "account group name must be at least 2 characters" })
    .max(150, { message: "account group name cannot exceed 150 characters" }),
  seqNo: z
    .number()
    .int()
    .min(0, { message: "sequence number must be 0 or greater" }),
  isActive: z.boolean(),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
})

export type AccountGroupSchemaType = z.infer<typeof accountGroupSchema>

export const accountGroupFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type AccountGroupFiltersValues = z.infer<
  typeof accountGroupFiltersSchema
>
