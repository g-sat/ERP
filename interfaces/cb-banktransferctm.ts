export interface ICbBankTransferCtmHd {
  companyId: number
  transferId: string
  transferNo: string
  referenceNo: string
  trnDate: Date | string
  accountDate: Date | string

  paymentTypeId: number
  paymentTypeName: string

  chequeNo: string | null
  chequeDate: Date | string

  fromBankId: number
  fromBankCode: string
  fromBankName: string
  fromCurrencyId: number
  fromCurrencyCode: string
  fromCurrencyName: string
  fromExhRate: number
  fromBankChgGLId: number
  fromBankChgGLCode: string
  fromBankChgGLName: string
  fromBankChgAmt: number
  fromBankChgLocalAmt: number
  fromTotAmt: number
  fromTotLocalAmt: number

  remarks: string
  payeeTo: string
  exhGainLoss: number
  moduleFrom: string
  createBy: string
  createDate: Date | string
  editBy: string | null
  editDate: Date | null
  editVersion: number
  isCancel: boolean
  cancelBy: string | null
  cancelDate: Date | null
  cancelRemarks: string | null
  isPost: boolean | null
  postBy: string | null
  postDate: Date | null
  appStatusId: number | null
  appBy: string | null
  appDate: Date | null

  data_details: ICbBankTransferCtmDt[]
}

export interface ICbBankTransferCtmFilter {
  startDate: Date | string
  endDate: Date | string
  search: string
  sortOrder: string
  sortBy: string
  pageNumber?: number
  pageSize?: number
}

export interface ICbBankTransferCtmDt {
  transferId: string
  transferNo: string
  itemNo: number
  seqNo: number

  jobOrderId: number
  jobOrderNo: string
  taskId: number
  taskName: string
  serviceItemNo: number
  serviceItemNoName: string

  toBankId: number
  toBankCode: string
  toBankName: string
  toCurrencyId: number
  toCurrencyCode: string
  toCurrencyName: string
  toExhRate: number
  toTotAmt: number
  toTotLocalAmt: number
  toBankChgGLId: number
  toBankChgGLCode: string
  toBankChgGLName: string
  toBankChgAmt: number
  toBankChgLocalAmt: number

  toBankExhRate: number
  toBankTotAmt: number
  toBankTotLocalAmt: number

  editVersion: number
}
