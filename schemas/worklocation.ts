import { z } from "zod"

export const workLocationSchema = z.object({
  workLocationId: z.number().min(0, "Work location is required"),
  workLocationCode: z.string().optional(),
  workLocationName: z.string().min(1, "Work location name is required"),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  countryId: z.number().min(1, "Country is required"),
  isActive: z.boolean(),
})

export type WorkLocationSchemaType = z.infer<typeof workLocationSchema>
export type WorkLocationFormData = z.infer<typeof workLocationSchema>
