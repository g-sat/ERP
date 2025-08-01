import * as z from "zod"

export const portSchema = z.object({
  portId: z.number().optional(),
  portName: z
    .string()
    .min(2, { message: "port name must be at least 2 characters" })
    .max(150, { message: "port name cannot exceed 150 characters" }),
  portCode: z
    .string()
    .min(1, { message: "port code is required" })
    .max(50, { message: "port code cannot exceed 50 characters" }),
  portRegionId: z.number().optional(),

  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean().default(true),
})

export type PortFormValues = z.infer<typeof portSchema>

export const portFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["name", "code", "region"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type PortFiltersValues = z.infer<typeof portFiltersSchema>
