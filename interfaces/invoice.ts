export interface IArInvoiceHd {
  companyId: number
  invoiceId: string
  invoiceNo: string
  referenceNo: string
  trnDate: Date | string
  accountDate: Date | string
  deliveryDate: Date | string
  dueDate: Date | string
  customerId: number
  customerCode: null | number | string
  customerName: null | string
  currencyId: number
  currencyCode: null | string
  currencyName: null | string
  exhRate: number
  ctyExhRate: number
  creditTermId: number
  creditTermCode: null | string
  creditTermName: null | string
  bankId: number
  bankCode: null | string | number
  bankName: null | string
  totAmt: number
  totLocalAmt: number
  totCtyAmt: number
  gstClaimDate: Date | string
  gstAmt: number
  gstLocalAmt: number
  gstCtyAmt: number
  totAmtAftGst: number
  totLocalAmtAftGst: number
  totCtyAmtAftGst: number
  balAmt: number
  balLocalAmt: number
  payAmt: number
  payLocalAmt: number
  exGainLoss: number
  salesOrderId: number
  salesOrderNo: string
  operationId: number
  operationNo: string
  remarks: string
  address1: string
  address2: string
  address3: string
  address4: string
  addressId: number
  contactId: number
  pinCode: string
  countryId: number
  countryCode: null | number | string
  countryName: null | string
  phoneNo: string
  faxNo: string
  contactName: string
  mobileNo: string
  emailAdd: string
  moduleFrom: string
  supplierName: string
  suppInvoiceNo: string
  apInvoiceId: string
  apInvoiceNo: null | string
  createById: number
  createDate: Date | string
  editById: null | number
  editDate: null | Date
  isCancel: false
  cancelById: number
  cancelDate: Date | string
  cancelRemarks: null | string
  createBy: null | number
  editBy: null | string
  cancelBy: null | string
  editVersion: number
  data_details: IArInvoiceDt[]
}

export interface IArInvoiceFilter {
  startDate: Date | string
  endDate: Date | string
  search: string
  sortOrder: string
  sortBy: string
  pageNumber?: number
  pageSize?: number
}

export interface IArInvoiceDt {
  invoiceId: string
  invoiceNo: string
  itemNo: number
  seqNo: number
  docItemNo: number
  productId: number
  productCode: string
  productName: string
  glId: number
  glCode: string
  glName: string
  qty: number
  billQTY: number
  uomId: number
  unitPrice: number
  totAmt: number
  totLocalAmt: number
  totCtyAmt: number
  remarks: string
  gstId: number
  gstPercentage: number
  gstAmt: number
  gstLocalAmt: number
  gstCtyAmt: number
  deliveryDate: Date | string
  departmentId: number
  departmentCode: string
  departmentName: string
  employeeId: number
  employeeCode: string
  employeeName: string
  portId: number
  portCode: string
  portName: string
  vesselId: number
  vesselCode: string
  vesselName: string
  bargeId: number
  bargeCode: string
  bargeName: string
  voyageId: number
  voyageNo: string
  operationId: number
  operationNo: string
  opRefNo: null | number
  salesOrderId: number
  salesOrderNo: string
  supplyDate: Date | string
  supplierName: string
  suppInvoiceNo: string
  apInvoiceId: string
  apInvoiceNo: null | number
  editVersion: number
}
