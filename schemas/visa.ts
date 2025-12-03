import * as z from "zod"

export const visaSchema = z.object({
  visaId: z.number(),
  visaCode: z
    .string()
    .min(1, { message: "visa code is required" })
    .max(50, { message: "visa code cannot exceed 50 characters" }),
  visaName: z
    .string()
    .min(2, { message: "visa name must be at least 2 characters" })
    .max(150, { message: "visa name cannot exceed 150 characters" }),

  seqNo: z.number().min(0, { message: "visa order is required" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type VisaSchemaType = z.infer<typeof visaSchema>

export const visaFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type VisaFiltersValues = z.infer<typeof visaFiltersSchema>
