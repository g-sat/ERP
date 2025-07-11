import { z } from "zod"

export const supplierSchema = z.object({
  supplierId: z.number(),

  supplierCode: z.string(),
  supplierName: z.string(),

  supplierOtherName: z.string().optional().default(""),
  supplierShortName: z.string().optional().default(""),
  supplierRegNo: z.string().optional().default(""),
  parentSupplierId: z.number().optional().default(0),

  currencyId: z.number(),
  bankId: z.number(),
  creditTermId: z.number(),
  accSetupId: z.number(),
  customerId: z.number().default(0),

  isSupplier: z.boolean().optional().default(false),
  isVendor: z.boolean().optional().default(false),
  isTrader: z.boolean().optional().default(false),
  isCustomer: z.boolean().optional().default(false),

  remarks: z.string().optional().default(""),
  isActive: z.boolean().optional().default(true),
})
export type SupplierFormValues = z.infer<typeof supplierSchema>

export const supplierContactSchema = z.object({
  contactId: z.number(),
  supplierId: z.number(),
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
export type SupplierContactFormValues = z.infer<typeof supplierContactSchema>

export const supplierAddressSchema = z.object({
  supplierId: z.number(),
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
export type SupplierAddressFormValues = z.infer<typeof supplierAddressSchema>
