import * as z from "zod"

export const currencySchema = z.object({
  currencyId: z.number().optional(),
  currencyCode: z
    .string({ required_error: "Currency code is required" })
    .min(2)
    .max(50, { message: "Maximum length is 50" }),
  currencyName: z
    .string({ required_error: "Currency name is required" })
    .min(2)
    .max(150, { message: "Maximum length is 150" }),
  currencySign: z.string().optional().default(""),
  isMultiply: z.boolean().default(false),
  isActive: z.boolean().default(true),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional()
    .default(""),
})

export type CurrencySchemaType = z.infer<typeof currencySchema>

export const currencyFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type CurrencyFiltersValues = z.infer<typeof currencyFiltersSchema>

export const currencyDtSchema = z.object({
  currencyId: z.number().min(1, { message: "Currency is required" }),
  exhRate: z.number().min(0.0000000001).max(99999999.9999999999),
  validFrom: z.union([z.string(), z.date()]).refine(
    (val) => {
      // Ensure it's not empty string or invalid date
      if (typeof val === "string") return val.trim().length > 0
      if (val instanceof Date) return !isNaN(val.getTime())
      return false
    },
    { message: "Valid from is required and must be a valid date" }
  ),
})

export type CurrencyDtSchemaType = z.infer<typeof currencyDtSchema>

export const currencyLocalDtSchema = z.object({
  currencyId: z.number().min(1, { message: "Currency is required" }),
  exhRate: z.number().min(0.0000000001).max(99999999.9999999999),
  validFrom: z.union([z.string(), z.date()]).refine(
    (val) => {
      // Ensure it's not empty string or invalid date
      if (typeof val === "string") return val.trim().length > 0
      if (val instanceof Date) return !isNaN(val.getTime())
      return false
    },
    { message: "Valid from is required and must be a valid date" }
  ),
})

export type CurrencyLocalDtSchemaType = z.infer<typeof currencyLocalDtSchema>
