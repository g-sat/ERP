import { z } from "zod"

export const customerSchema = z.object({
  customerId: z.number(),

  customerCode: z.string(),
  customerName: z.string(),

  customerOtherName: z.string().optional().default(""),
  customerShortName: z.string().optional().default(""),
  customerRegNo: z.string().optional().default(""),
  parentCustomerId: z.number().optional().default(0),

  currencyId: z.number(),
  bankId: z.number(),
  creditTermId: z.number(),
  accSetupId: z.number(),
  supplierId: z.number().default(0),

  isCustomer: z.boolean().optional().default(false),
  isVendor: z.boolean().optional().default(false),
  isTrader: z.boolean().optional().default(false),
  isSupplier: z.boolean().optional().default(false),

  remarks: z.string().optional().default(""),
  isActive: z.boolean().optional().default(true),
})
export type CustomerFormValues = z.infer<typeof customerSchema>

export const customerContactSchema = z.object({
  contactId: z.number(),
  customerId: z.number(),
  contactName: z.string().min(1, "Contact name is required"),
  otherName: z.string().optional().default(""),
  mobileNo: z.string().optional().default(""),
  offNo: z.string().optional().default(""),
  faxNo: z.string().optional().default(""),
  emailAdd: z.string().email("Invalid email format").optional().default(""),
  messId: z.string().optional().default(""),
  contactMessType: z.string().optional().default(""),
  isDefault: z.boolean().default(false),
  isFinance: z.boolean().default(false),
  isSales: z.boolean().default(false),
  isActive: z.boolean().default(true),
})
export type CustomerContactFormValues = z.infer<typeof customerContactSchema>

export const customerAddressSchema = z.object({
  customerId: z.number(),
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
export type CustomerAddressFormValues = z.infer<typeof customerAddressSchema>
