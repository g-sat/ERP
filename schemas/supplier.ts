import { z } from "zod"

export const supplierSchema = z.object({
  supplierId: z.number(),

  supplierCode: z
    .string()
    .min(1, "Supplier code is required")
    .max(50, "Supplier code cannot exceed 50 characters"),
  supplierName: z
    .string()
    .min(1, "Supplier name is required")
    .max(150, "Supplier name cannot exceed 150 characters"),

  supplierOtherName: z
    .string()
    .max(150, "Supplier other name cannot exceed 150 characters")
    .optional()
    .default(""),
  supplierShortName: z
    .string()
    .max(150, "Supplier short name cannot exceed 150 characters")
    .optional()
    .default(""),
  supplierRegNo: z
    .string()
    .max(150, "Supplier registration number cannot exceed 50 characters")
    .optional()
    .default(""),
  parentSupplierId: z.number().optional().default(0),

  currencyId: z.number().min(1, "Currency is required"),
  bankId: z.number().min(1, "Bank is required"),
  creditTermId: z.number().min(1, "Credit term is required"),
  accSetupId: z.number().min(1, "Account setup is required"),
  customerId: z.number().optional().default(0),

  isSupplier: z.boolean().optional().default(false),
  isVendor: z.boolean().optional().default(false),
  isTrader: z.boolean().optional().default(false),
  isCustomer: z.boolean().optional().default(false),

  remarks: z
    .string()
    .max(255, "Remarks cannot exceed 255 characters")
    .optional()
    .default(""),
  isActive: z.boolean().default(true),
})
export type SupplierSchemaType = z.infer<typeof supplierSchema>

export const supplierContactSchema = z.object({
  contactId: z.number(),
  supplierId: z.number(),
  contactName: z
    .string()
    .min(1, "Contact name is required")
    .max(150, "Contact name cannot exceed 150 characters"),
  otherName: z
    .string()
    .max(150, "Other name cannot exceed 150 characters")
    .optional()
    .default(""),
  mobileNo: z
    .string()
    .max(20, "Mobile number cannot exceed 20 characters")
    .optional()
    .default(""),
  offNo: z
    .string()
    .max(20, "Office number cannot exceed 20 characters")
    .optional()
    .default(""),
  faxNo: z
    .string()
    .max(20, "Fax number cannot exceed 20 characters")
    .optional()
    .default(""),
  emailAdd: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .default(""),
  messId: z
    .string()
    .max(50, "Mess ID cannot exceed 50 characters")
    .optional()
    .default(""),
  contactMessType: z
    .string()
    .max(50, "Contact mess type cannot exceed 50 characters")
    .optional()
    .default(""),
  isDefault: z.boolean().optional().default(false),
  isFinance: z.boolean().optional().default(false),
  isSales: z.boolean().optional().default(false),
  isActive: z.boolean().default(true),
})
export type SupplierContactSchemaType = z.infer<typeof supplierContactSchema>

export const supplierAddressSchema = z.object({
  supplierId: z.number(),
  addressId: z.number(),
  address1: z
    .string()
    .min(1, "Address 1 is required")
    .max(255, "Address 1 cannot exceed 255 characters"),
  address2: z
    .string()
    .max(255, "Address 2 cannot exceed 255 characters")
    .optional()
    .default(""),
  address3: z
    .string()
    .max(255, "Address 3 cannot exceed 255 characters")
    .optional()
    .default(""),
  address4: z
    .string()
    .max(255, "Address 4 cannot exceed 255 characters")
    .optional()
    .default(""),
  pinCode: z
    .string()
    .max(20, "Pin code cannot exceed 20 characters")
    .optional()
    .default(""),
  countryId: z.number().min(1, "Country is required"),
  phoneNo: z
    .string()
    .max(20, "Phone number cannot exceed 20 characters")
    .optional()
    .default(""),
  faxNo: z
    .string()
    .max(20, "Fax number cannot exceed 20 characters")
    .optional()
    .default(""),
  emailAdd: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .default(""),
  webUrl: z.string().url("Please enter a valid URL").optional().default(""),
  isDefaultAdd: z.boolean().optional().default(false),
  isDeliveryAdd: z.boolean().optional().default(false),
  isFinAdd: z.boolean().optional().default(false),
  isSalesAdd: z.boolean().optional().default(false),
  isActive: z.boolean().default(true),
})
export type SupplierAddressSchemaType = z.infer<typeof supplierAddressSchema>
