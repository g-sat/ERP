import * as z from "zod"

export const vesselSchema = z.object({
  vesselId: z.number().min(0, { message: "vessel id is required" }),
  vesselCode: z
    .string()
    .min(1, { message: "vessel code is required" })
    .max(50, { message: "vessel code cannot exceed 50 characters" }),
  vesselName: z
    .string()
    .min(2, { message: "vessel name must be at least 2 characters" })
    .max(150, { message: "vessel name cannot exceed 150 characters" }),
  callSign: z
    .string()
    .min(1, { message: "call sign is required" })
    .max(150, { message: "call sign cannot exceed 150 characters" })
    .default(""),
  imoCode: z
    .string()
    .min(1, { message: "IMO code is required" })
    .max(150, { message: "IMO code cannot exceed 150 characters" })
    .default(""),
  grt: z
    .string()
    .min(1, { message: "GRT is required" })
    .max(150, { message: "GRT cannot exceed 150 characters" })
    .optional()
    .default(""),
  licenseNo: z
    .string()
    .max(150, { message: "license number cannot exceed 150 characters" })
    .optional()
    .default(""),
  vesselType: z
    .string()
    .min(1, { message: "vessel type is required" })
    .max(150, { message: "vessel type cannot exceed 150 characters" })
    .optional()
    .default(""),
  flag: z
    .string()
    .max(150, { message: "flag cannot exceed 150 characters" })
    .optional()
    .default(""),
  isActive: z.boolean().default(true),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional()
    .default(""),
})

export type VesselFormValues = z.infer<typeof vesselSchema>
