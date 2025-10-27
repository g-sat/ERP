import * as z from "zod"

export const currencySchema = z.object({
  currencyId: z.number().optional(),
  currencyCode: z
    .string({ message: "Currency code is required" })
    .min(2)
    .max(50, { message: "Maximum length is 50" }),
  currencyName: z
    .string({ message: "Currency name is required" })
    .min(2)
    .max(150, { message: "Maximum length is 150" }),
  currencySign: z.string().optional(),
  isMultiply: z.boolean(),
  isActive: z.boolean(),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
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
  validFrom: z.union([z.date(), z.string()], {
    message: "Valid from is required and must be a valid date",
  }),
})

export type CurrencyDtSchemaType = z.infer<typeof currencyDtSchema>

export const currencyLocalDtSchema = z.object({
  currencyId: z.number().min(1, { message: "Currency is required" }),
  exhRate: z.number().min(0.0000000001).max(99999999.9999999999),
  validFrom: z.union([z.date(), z.string()], {
    message: "Valid from is required and must be a valid date",
  }),
})

export type CurrencyLocalDtSchemaType = z.infer<typeof currencyLocalDtSchema>
