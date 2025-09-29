import { z } from "zod"

export const employerschema = z.object({
  employerId: z.number().optional().default(0),
  companyId: z.number(),
  address: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  email: z.string().optional().default(""),
  establishmentId: z.string().optional().default(""),
  bankAccountNumber: z.string().optional(),
  iban: z.string().optional(),
  isActive: z.boolean(),
  remarks: z.string().optional(),
  bankName: z.string().optional(),
  branch: z.string().optional(),
})

export type EmployerSchemaType = z.infer<typeof employerschema>
