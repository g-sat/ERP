import { z } from "zod"

export const customerSchema = z.object({
  customerId: z.number(),

  customerCode: z
    .string()
    .min(1, "Customer code is required")
    .max(50, "Customer code cannot exceed 50 characters"),
  customerName: z
    .string()
    .min(1, "Customer name is required")
    .max(150, "Customer name cannot exceed 150 characters"),

  customerOtherName: z
    .string()
    .max(150, "Customer other name cannot exceed 150 characters")
    .optional()
    .default(""),
  customerShortName: z
    .string()
    .max(150, "Customer short name cannot exceed 150 characters")
    .optional()
    .default(""),
  customerRegNo: z
    .string()
    .max(150, "Customer registration number cannot exceed 50 characters")
    .optional()
    .default(""),

  currencyId: z.number().min(1, "Currency is required"),
  bankId: z.number().min(1, "Bank is required"),
  creditTermId: z.number().min(1, "Credit term is required"),
  accSetupId: z.number().min(1, "Account setup is required"),
  supplierId: z.number().optional().default(0),

  parentCustomerId: z.number().optional().default(0),

  isCustomer: z.boolean().optional().default(false),
  isVendor: z.boolean().optional().default(false),
  isTrader: z.boolean().optional().default(false),
  isSupplier: z.boolean().optional().default(false),

  remarks: z
    .string()
    .max(255, "Remarks cannot exceed 255 characters")
    .optional()
    .default(""),
  isActive: z.boolean().default(true),
})
export type CustomerFormValues = z.infer<typeof customerSchema>

export const customerContactSchema = z.object({
  customerId: z.number().min(1, "Customer is required"),
  contactId: z.number(),
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
    .max(150, "Mobile number cannot exceed 150 characters")
    .optional()
    .default(""),
  offNo: z
    .string()
    .max(150, "Office number cannot exceed 150 characters")
    .optional()
    .default(""),
  faxNo: z
    .string()
    .max(150, "Fax number cannot exceed 150 characters")
    .optional()
    .default(""),
  emailAdd: z
    .string()
    .optional()
    .default("")
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Invalid email format",
    }),
  messId: z
    .string()
    .max(150, "Mess ID cannot exceed 150 characters")
    .optional()
    .default(""),
  contactMessType: z
    .string()
    .max(150, "Contact mess type cannot exceed 150 characters")
    .optional()
    .default(""),
  isDefault: z.boolean().default(false),
  isFinance: z.boolean().default(false),
  isSales: z.boolean().default(false),
  isActive: z.boolean().default(true),
})
export type CustomerContactFormValues = z.infer<typeof customerContactSchema>

export const customerAddressSchema = z.object({
  customerId: z.number().min(1, "Customer is required"),
  addressId: z.number(),
  address1: z
    .string()
    .min(1, "Address 1 is required")
    .max(150, "Address 1 cannot exceed 150 characters"),
  address2: z
    .string()
    .min(1, "Address 2 is required")
    .max(150, "Address 2 cannot exceed 150 characters"),
  address3: z
    .string()
    .max(150, "Address 3 cannot exceed 150 characters")
    .optional()
    .default(""),
  address4: z
    .string()
    .max(150, "Address 4 cannot exceed 150 characters")
    .optional()
    .default(""),
  pinCode: z
    .string()
    .max(150, "PIN code cannot exceed 150 characters")
    .optional()
    .default(""),
  countryId: z.number().min(1, "Country is required"),
  phoneNo: z
    .string()
    .min(1, "Phone number is required")
    .max(150, "Phone number cannot exceed 150 characters"),
  faxNo: z
    .string()
    .max(150, "Fax number cannot exceed 150 characters")
    .optional()
    .default(""),
  emailAdd: z
    .string()
    .max(150, "Email address cannot exceed 150 characters")
    .optional()
    .default("")
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Invalid email format",
    }),
  webUrl: z
    .string()
    .max(150, "Web URL cannot exceed 150 characters")
    .optional()
    .default(""),
  isDefaultAdd: z.boolean().default(false),
  isDeliveryAdd: z.boolean().default(false),
  isFinAdd: z.boolean().default(false),
  isSalesAdd: z.boolean().default(false),
  isActive: z.boolean().default(true),
})
export type CustomerAddressFormValues = z.infer<typeof customerAddressSchema>
