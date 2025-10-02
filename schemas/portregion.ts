import * as z from "zod"

export const portregionSchema = z.object({
  portRegionId: z.number().optional(),
  portRegionName: z
    .string()
    .min(2, { message: "port region name must be at least 2 characters" })
    .max(150, { message: "port region name cannot exceed 150 characters" }),
  portRegionCode: z
    .string()
    .min(1, { message: "port region code is required" })
    .max(50, { message: "port region code cannot exceed 50 characters" }),
  countryId: z.number().min(1, { message: "country id is required" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type PortRegionSchemaType = z.infer<typeof portregionSchema>

export const portregionFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["name", "code", "region"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type PortRegionFiltersValues = z.infer<typeof portregionFiltersSchema>
