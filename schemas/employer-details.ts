import { z } from "zod"

export const employerdetailsschema = z.object({
  employerDetailsId: z.number().optional().default(0),
  companyId: z.number(),
  establishmentId: z.string(),
  bankAccountNumber: z.string().optional(),
  iban: z.string().optional(),
  isActive: z.boolean(),
  remarks: z.string().optional(),
  bankName: z.string().optional(),
  branch: z.string().optional(),
})

export type EmployerDetailsFormValues = z.infer<typeof employerdetailsschema>
