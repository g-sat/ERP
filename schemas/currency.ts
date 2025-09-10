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
  currencySign: z.string().nullable(),
  isMultiply: z.boolean(),
  isActive: z.boolean().default(true),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional()
    .default(""),
})

export type CurrencyFormValues = z.infer<typeof currencySchema>

export const currencyFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type CurrencyFiltersValues = z.infer<typeof currencyFiltersSchema>

export const currencyDtSchema = z.object({
  currencyId: z.number({ required_error: "Currency is required" }),
  exhRate: z.number().min(0.0000000001).max(99999999.9999999999),
  validFrom: z.union([z.date(), z.string()]),
})

export type CurrencyDtFormValues = z.infer<typeof currencyDtSchema>

export const currencyLocalDtSchema = z.object({
  currencyId: z.number({ required_error: "Currency is required" }),
  exhRate: z.number().min(0.0000000001).max(99999999.9999999999),
  validFrom: z.union([z.date(), z.string()]),
})

export type CurrencyLocalDtFormValues = z.infer<typeof currencyLocalDtSchema>
