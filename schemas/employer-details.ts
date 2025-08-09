import { z } from "zod"

export const employerdetailsschema = z.object({
  employerDetailsId: z.number().optional().default(0),
  companyId: z.number(),
  establishmentId: z.string(),
  establishmentCardExpiry: z.union([z.date(), z.string()]).optional(),
  employerRefno: z.string().optional(),
  wpsBankCode: z.string().optional(),
  wpsFileReference: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  iban: z.string().optional(),
  isActive: z.boolean(),
  remarks: z.string().optional(),
})

export type EmployerDetailsFormValues = z.infer<typeof employerdetailsschema>
