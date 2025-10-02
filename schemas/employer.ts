import { z } from "zod"

export const employerschema = z.object({
  employerId: z.number().optional(),
  companyId: z.number(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  establishmentId: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  iban: z.string().optional(),
  isActive: z.boolean(),
  remarks: z.string().optional(),
  bankName: z.string().optional(),
  branch: z.string().optional(),
})

export type EmployerSchemaType = z.infer<typeof employerschema>
