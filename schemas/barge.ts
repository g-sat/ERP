import * as z from "zod"

export const bargeSchema = z.object({
  bargeId: z.number().optional(),
  bargeName: z
    .string()
    .min(2, { message: "barge name must be at least 2 characters" })
    .max(150, { message: "barge name cannot exceed 150 characters" }),
  bargeCode: z
    .string()
    .min(1, { message: "barge code is required" })
    .max(50, { message: "barge code cannot exceed 50 characters" }),
  callSign: z
    .string()
    .max(50, { message: "call sign cannot exceed 50 characters" })
    .optional(),
  imoCode: z
    .string()
    .max(50, { message: "IMO code cannot exceed 50 characters" })
    .optional(),
  grt: z
    .string()
    .max(50, { message: "GRT cannot exceed 50 characters" })
    .optional(),
  licenseNo: z
    .string()
    .max(50, { message: "license number cannot exceed 50 characters" })
    .optional(),
  bargeType: z
    .string()
    .max(50, { message: "barge type cannot exceed 50 characters" })
    .optional(),
  flag: z
    .string()
    .max(50, { message: "flag cannot exceed 50 characters" })
    .optional(),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean().default(true),
  isOwn: z.boolean().default(true),
})

export type BargeFormValues = z.infer<typeof bargeSchema>

export const bargeFiltersSchema = z.object({
  isOwn: z.boolean().optional(),
  isActive: z.boolean().optional(),
  region: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["name", "code", "region"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type BargeFiltersValues = z.infer<typeof bargeFiltersSchema>
