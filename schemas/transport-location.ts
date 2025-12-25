import * as z from "zod"

export const transportLocationSchema = z.object({
  transportLocationId: z.number(),
  transportLocationCode: z
    .string()
    .min(1, { message: "transport location code is required" })
    .max(50, { message: "transport location code cannot exceed 50 characters" }),
  transportLocationName: z
    .string()
    .min(2, { message: "transport location name must be at least 2 characters" })
    .max(150, { message: "transport location name cannot exceed 150 characters" }),

  seqNo: z.number().min(0, { message: "transport location order is required" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type TransportLocationSchemaType = z.infer<typeof transportLocationSchema>

export const transportLocationFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type TransportLocationFiltersValues = z.infer<typeof transportLocationFiltersSchema>

