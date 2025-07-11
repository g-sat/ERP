export interface ISupplier {
  supplierId: number
  companyId: number
  supplierCode: string
  supplierName: string
  supplierOtherName: string
  supplierShortName: string
  supplierRegNo: string
  currencyId: number
  currencyCode: string
  currencyName: string
  bankId: number
  bankCode: string
  bankName: string
  creditTermId: number
  creditTermCode: string
  creditTermName: string
  parentSupplierId: number
  parentSupplierCode: string
  parentSupplierName: string
  accSetupId: number
  accSetupCode: string
  accSetupName: string
  customerId: number
  customerCode: string
  customerName: string
  isCustomer: boolean
  isVendor: boolean
  isTrader: boolean
  isSupplier: boolean
  remarks: string
  isActive: boolean
  createById: number
  createDate: string | Date
  editById: string | null
  editDate: string | null
  createBy: string
  editBy: string | null
}
export interface ISupplierFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface ISupplierContact {
  contactId: number
  supplierId: number
  supplierCode: string
  supplierName: string
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

export interface ISupplierContactFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface ISupplierAddress {
  supplierId: number
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

export interface ISupplierAddressFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
