import * as z from "zod"

export const serviceModeSchema = z.object({
  serviceModeId: z.number(),
  serviceModeCode: z
    .string()
    .min(1, { message: "service mode code is required" })
    .max(50, { message: "service mode code cannot exceed 50 characters" }),
  serviceModeName: z
    .string()
    .min(2, { message: "service mode name must be at least 2 characters" })
    .max(150, { message: "service mode name cannot exceed 150 characters" }),

  seqNo: z.number().min(0, { message: "service mode order is required" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type ServiceModeSchemaType = z.infer<typeof serviceModeSchema>

export const serviceModeFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type ServiceModeFiltersValues = z.infer<typeof serviceModeFiltersSchema>

