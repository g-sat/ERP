export interface IBank {
  bankId: number
  companyId: number
  bankCode: string
  bankName: string
  currencyId: number
  currencyCode: string
  currencyName: string
  accountNo: string
  swiftCode: string
  remarks1: string
  remarks2: string
  remarks3: string
  glId: number
  isOwnBank: boolean
  isPettyCashBank: boolean
  remarks: string
  isActive: boolean
  createById: number
  createDate: string | Date
  editById: string | null
  editDate: string | null
  createBy: string
  editBy: string | null
}

export interface IBankFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface IBankContact {
  contactId: number
  bankId: number
  contactName: string
  otherName: string
  mobileNo: string
  offNo: string
  faxNo: string
  emailAdd: string
  messId: string
  contactMessType: string
  isDefault: boolean
  isFinance: boolean
  isSales: boolean
  isActive: boolean
  createById: number
  createDate: string | Date
  editById: string | null
  editDate: string | null | Date
  createBy: string | null
  editBy: string | null
}

export interface IBankContactFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface IBankAddress {
  bankId: number
  addressId: number
  address1: string
  address2: string
  address3: string
  address4: string
  pinCode: null | string | number
  countryId: number
  countryCode: string | null
  countryName: string | null
  phoneNo: string
  faxNo: string | null
  emailAdd: string
  webUrl: string | null
  isDefaultAdd: boolean
  isDeliveryAdd: boolean
  isFinAdd: boolean
  isSalesAdd: boolean
  isActive: boolean
  createById: number
  createDate: string | Date
  editById: number | null
  editDate: string | Date | null
  createBy: string | null
  editBy: string | null
}

export interface IBankAddressFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
