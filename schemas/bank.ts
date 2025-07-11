import { z } from "zod"

export const bankSchema = z.object({
  bankId: z.number(),

  bankCode: z.string(),
  bankName: z.string(),

  currencyId: z.number(),

  accountNo: z.string().optional().default(""),
  swiftCode: z.string().optional().default(""),
  remarks1: z.string().optional().default(""),
  remarks2: z.string().optional().default(""),
  remarks3: z.string().optional().default(""),
  glId: z.number().optional().default(0),

  isPettyCashBank: z.boolean().optional().default(false),
  isOwnBank: z.boolean().optional().default(false),
  remarks: z.string().optional().default(""),
  isActive: z.boolean().optional().default(true),
})
export type BankFormValues = z.infer<typeof bankSchema>

export const bankContactSchema = z.object({
  contactId: z.number(),
  bankId: z.number(),
  contactName: z.string(),
  otherName: z.string(),
  mobileNo: z.string(),
  offNo: z.string(),
  faxNo: z.string(),
  emailAdd: z.string().email(),
  messId: z.string(),
  contactMessType: z.string(),
  isDefault: z.boolean(),
  isFinance: z.boolean(),
  isSales: z.boolean(),
  isActive: z.boolean(),
})
export type BankContactFormValues = z.infer<typeof bankContactSchema>

export const bankAddressSchema = z.object({
  bankId: z.number(),
  addressId: z.number(),
  address1: z.string(),
  address2: z.string(),
  address3: z.string(),
  address4: z.string(),
  pinCode: z.union([z.string(), z.number(), z.null()]),
  countryId: z.number(),
  phoneNo: z.string(),
  faxNo: z.string().nullable(),
  emailAdd: z.string().email(),
  webUrl: z.string().nullable(),
  isDefaultAdd: z.boolean(),
  isDeliveryAdd: z.boolean(),
  isFinAdd: z.boolean(),
  isSalesAdd: z.boolean(),
  isActive: z.boolean(),
})
export type BankAddressFormValues = z.infer<typeof bankAddressSchema>
