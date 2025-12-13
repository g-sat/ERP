export interface IApAdjustmentHd {
  companyId: number
  adjustmentId: string
  adjustmentNo: string
  referenceNo: string
  suppAdjustmentNo: string
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

  isDebit: boolean

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
  moduleFrom: string
  customerName: string

  arAdjustmentId: string
  arAdjustmentNo: null | string
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
  data_details: IApAdjustmentDt[]
}

export interface IApAdjustmentFilter {
  startDate: Date | string
  endDate: Date | string
  search: string
  sortOrder: string
  sortBy: string
  pageNumber?: number
  pageSize?: number
}

export interface IApAdjustmentDt {
  adjustmentId: string
  adjustmentNo: string
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
  isDebit: boolean
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
  arAdjustmentId: string
  arAdjustmentNo: string
  custAdjustmentNo: string
  editVersion: number
}
