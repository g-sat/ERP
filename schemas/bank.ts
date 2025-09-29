import { z } from "zod"

export const bankSchema = z.object({
  bankId: z.number(),

  bankCode: z
    .string()
    .min(1, "Bank code is required")
    .max(50, "Bank code cannot exceed 50 characters"),
  bankName: z
    .string()
    .min(1, "Bank name is required")
    .max(150, "Bank name cannot exceed 150 characters"),

  currencyId: z.number().min(1, "Currency is required"),

  accountNo: z
    .string()
    .max(50, "Account number cannot exceed 50 characters")
    .optional()
    .default(""),
  swiftCode: z
    .string()
    .max(50, "SWIFT code cannot exceed 50 characters")
    .optional()
    .default(""),
  remarks1: z
    .string()
    .max(255, "Remarks1 cannot exceed 255 characters")
    .optional()
    .default(""),
  remarks2: z
    .string()
    .max(255, "Remarks2 cannot exceed 255 characters")
    .optional()
    .default(""),
  remarks3: z
    .string()
    .max(255, "Remarks3 cannot exceed 255 characters")
    .optional()
    .default(""),
  glId: z.number().optional().default(0),

  isPettyCashBank: z.boolean().optional().default(false),
  isOwnBank: z.boolean().optional().default(false),
  remarks: z
    .string()
    .max(255, "Remarks cannot exceed 255 characters")
    .optional()
    .default(""),
  isActive: z.boolean().default(true),
})
export type BankSchemaType = z.infer<typeof bankSchema>

export const bankContactSchema = z.object({
  contactId: z.number(),
  bankId: z.number(),
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
export type BankContactSchemaType = z.infer<typeof bankContactSchema>

export const bankAddressSchema = z.object({
  bankId: z.number(),
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
export type BankAddressSchemaType = z.infer<typeof bankAddressSchema>
