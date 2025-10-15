export interface IGLJournalHd {
  companyId: number
  journalId: string
  journalNo: string
  referenceNo: string
  trnDate: Date | string
  accountDate: Date | string
  currencyId: number
  currencyCode: null | string
  currencyName: null | string
  exhRate: number
  ctyExhRate: number
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
  remarks: string
  isReverse: boolean
  isRecurrency: boolean
  revDate: Date | string | null
  recurrenceUntil: Date | string | null
  moduleFrom: string
  createById: number
  createDate: Date | string
  editById: null | number
  editDate: null | Date | string
  editVersion: number
  isCancel: boolean
  cancelById: null | number
  cancelDate: null | Date | string
  cancelRemarks: null | string
  isPost: boolean | null
  postById: null | number
  postDate: null | Date | string
  appStatusId: null | number
  appById: null | number
  appDate: null | Date | string
  // Audit lookup fields
  createBy: string
  editBy: string
  cancelBy: string
  postBy: string
  appBy: string
  // Nested details
  data_details: IGLJournalDt[]
}

export interface IGLJournalFilter {
  startDate: Date | string
  endDate: Date | string
  search: string
  sortOrder: string
  sortBy: string
  pageNumber?: number
  pageSize?: number
}

export interface IGLJournalDt {
  journalId: string
  journalNo: string
  itemNo: number
  seqNo: number
  glId: number
  glCode: string
  glName: string
  remarks: string
  productId: number
  productCode: string
  productName: string
  isDebit: boolean
  totAmt: number
  totLocalAmt: number
  totCtyAmt: number
  gstId: number
  gstName: string
  gstPercentage: number
  gstAmt: number
  gstLocalAmt: number
  gstCtyAmt: number
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
  editVersion: number
  jobOrderId: number
  jobOrderNo: string
  taskId: number
  taskName: string
  serviceId: number
  serviceName: string
}
