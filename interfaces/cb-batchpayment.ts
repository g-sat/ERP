export interface ICBBatchPaymentHd {
  companyId: number
  paymentId: string
  paymentNo: string
  trnDate: Date | string
  accountDate: Date | string
  supplierId: number
  supplierCode: string
  supplierName: string
  currencyId: number
  currencyCode: string
  currencyName: string
  exhRate: number
  ctyExhRate: number
  bankId: number
  bankCode: string | number
  bankName: string
  totAmt: number
  totLocalAmt: number
  totCtyAmt: number
  remarks: string
  createById: number
  createDate: Date | string
  editById?: number
  editDate?: Date | string
  isCancel: boolean
  cancelById?: number
  cancelDate?: Date | string
  cancelRemarks?: string
  createBy: number
  editBy?: string
  cancelBy?: string
  editVersion: number
  data_details: ICBBatchPaymentDt[]
}

export interface ICBBatchPaymentFilter {
  startDate: Date | string
  endDate: Date | string
  search: string
  sortOrder: string
  sortBy: string
  pageNumber?: number
  pageSize?: number
}

export interface ICBBatchPaymentDt {
  paymentId: number
  paymentNo: string
  itemNo: number
  seqNo: number
  invoiceDate: Date | string
  supplierName: string
  invoiceNo: string
  gstNo: string
  glId: number
  remarks: string
  jobOrderId: number
  taskId: number
  serviceId: number
  totAmt: number
  totLocalAmt: number
  totCtyAmt: number
  gstId: number
  gstPercentage: number
  gstAmt: number
  gstLocalAmt: number
  gstCtyAmt: number
  departmentId?: number
  employeeId?: number
  portId?: number
  vesselId?: number
  bargeId?: number
  voyageId?: number
  editVersion: number
}
