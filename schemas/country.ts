import * as z from "zod"

export const countrySchema = z.object({
  countryId: z.number().optional(),
  countryName: z
    .string()
    .min(2, { message: "Country name must be at least 2 characters" })
    .max(150, { message: "Country name cannot exceed 150 characters" }),
  countryCode: z
    .string()
    .min(1, { message: "Country code is required" })
    .max(50, { message: "Country code cannot exceed 50 characters" }),
  phoneCode: z.string().optional(),

  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type CountrySchemaType = z.infer<typeof countrySchema>

export const countryFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["name", "code", "phoneCode"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type CountryFiltersValues = z.infer<typeof countryFiltersSchema>
