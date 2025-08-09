import { z } from "zod"

export const workLocationSchema = z.object({
  workLocationId: z.number().min(0, "Work location is required"),
  workLocationCode: z.string().optional(),
  workLocationName: z.string().min(1, "Work location name is required"),
  address1: z.string().min(1, "Address 1 is required"),
  address2: z.string().optional().default(""),
  city: z.string().optional().default(""),
  postalCode: z.string().optional().default(""),
  countryId: z.number().min(1, "Country is required"),
  isActive: z.boolean().default(true),
})

export type WorkLocationFormData = z.infer<typeof workLocationSchema>
