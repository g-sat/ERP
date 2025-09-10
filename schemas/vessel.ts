import * as z from "zod"

export const vesselSchema = z.object({
  vesselId: z.number(),
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
    .max(50, { message: "call sign cannot exceed 50 characters" })
    .optional(),
  imoCode: z
    .string()
    .max(50, { message: "IMO code cannot exceed 50 characters" })
    .optional(),
  grt: z
    .string()
    .max(50, { message: "GRT cannot exceed 50 characters" })
    .optional(),
  licenseNo: z
    .string()
    .max(50, { message: "license number cannot exceed 50 characters" })
    .optional(),
  vesselType: z
    .string()
    .max(50, { message: "vessel type cannot exceed 50 characters" })
    .optional(),
  flag: z
    .string()
    .max(50, { message: "flag cannot exceed 50 characters" })
    .optional(),

  isActive: z.boolean().default(true),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional()
    .default(""),
})

export type VesselFormValues = z.infer<typeof vesselSchema>
