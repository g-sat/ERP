import * as z from "zod"

export const transportModeSchema = z.object({
  transportModeId: z.number(),
  transportModeCode: z
    .string()
    .min(1, { message: "transport mode code is required" })
    .max(50, { message: "transport mode code cannot exceed 50 characters" }),
  transportModeName: z
    .string()
    .min(2, { message: "transport mode name must be at least 2 characters" })
    .max(150, { message: "transport mode name cannot exceed 150 characters" }),

  seqNo: z.number().min(0, { message: "transport mode order is required" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type TransportModeSchemaType = z.infer<typeof transportModeSchema>

export const transportModeFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type TransportModeFiltersValues = z.infer<typeof transportModeFiltersSchema>

