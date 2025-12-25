export interface IApCreditNoteHd {
  companyId: number
  creditNoteId: string
  creditNoteNo: string
  referenceNo: string
  suppCreditNoteNo: string
  trnDate: Date | string
  accountDate: Date | string
  deliveryDate: Date | string
  dueDate: Date | string
  supplierId: number
  supplierCode: null | number | string
  supplierName: null | string
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

  invoiceId: string
  invoiceNo: string

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
  purchaseOrderId: number
  purchaseOrderNo: string
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
  customerName: string

  arCreditNoteId: string
  arCreditNoteNo: null | string
  createById: number
  createDate: Date | string
  editById: null | number
  editDate: null | Date
  isCancel: false
  cancelById: number
  cancelDate: Date | null
  cancelRemarks: null | string
  createBy: string
  editBy: string
  cancelBy: string
  editVersion: number
  isPost: boolean
  postById: null | number
  postDate: null | Date
  appStatusId: null | number
  appById: null | number
  appDate: null | Date

  appBy: string

  serviceCategoryId: number
  serviceCategoryName: string
  data_details: IApCreditNoteDt[]
}

export interface IApCreditNoteFilter {
  startDate: Date | string
  endDate: Date | string
  search: string
  sortOrder: string
  sortBy: string
  pageNumber?: number
  pageSize?: number
}

export interface IApCreditNoteDt {
  creditNoteId: string
  creditNoteNo: string
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
  uomCode: string
  uomName: string
  unitPrice: number
  totAmt: number
  totLocalAmt: number
  totCtyAmt: number
  remarks: string
  gstId: number
  gstName: string
  gstPercentage: number
  gstAmt: number
  gstLocalAmt: number
  gstCtyAmt: number
  deliveryDate: Date | string
  departmentId: number
  departmentCode: string
  departmentName: string

  jobOrderId: number
  jobOrderNo: string
  taskId: number
  taskName: string
  serviceItemNo: number
  serviceItemNoName: string
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
  operationId: number | string
  operationNo: string
  opRefNo: number | string
  purchaseOrderId: number | string
  purchaseOrderNo: string
  supplyDate: Date | string
  customerName: string
  arCreditNoteId: string
  arCreditNoteNo: string
  custCreditNoteNo: string
  editVersion: number
}
