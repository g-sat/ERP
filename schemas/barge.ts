import * as z from "zod"

export const bargeSchema = z.object({
  bargeId: z.number().optional(),
  bargeCode: z
    .string()
    .min(1, { message: "barge code is required" })
    .max(50, { message: "barge code cannot exceed 50 characters" }),
  bargeName: z
    .string()
    .min(2, { message: "barge name must be at least 2 characters" })
    .max(150, { message: "barge name cannot exceed 150 characters" }),
  callSign: z
    .string()
    .max(150, { message: "call sign cannot exceed 150 characters" })
    .optional()
    .default(""),
  imoCode: z
    .string()
    .max(150, { message: "IMO code cannot exceed 150 characters" })
    .optional()
    .default(""),
  grt: z
    .string()
    .max(150, { message: "GRT cannot exceed 150 characters" })
    .optional()
    .default(""),
  licenseNo: z
    .string()
    .max(150, { message: "license number cannot exceed 150 characters" })
    .optional()
    .default(""),
  bargeType: z
    .string()
    .max(150, { message: "barge type cannot exceed 150 characters" })
    .optional()
    .default(""),
  flag: z
    .string()
    .max(150, { message: "flag cannot exceed 150 characters" })
    .optional()
    .default(""),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional()
    .default(""),
  isActive: z.boolean().default(true),
  isOwn: z.boolean().default(true),
})

export type BargeSchemaType = z.infer<typeof bargeSchema>

export const bargeFiltersSchema = z.object({
  isOwn: z.boolean().optional(),
  isActive: z.boolean().optional(),
  region: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["name", "code", "region"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type BargeFiltersValues = z.infer<typeof bargeFiltersSchema>
