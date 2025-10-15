export interface ICbBankTransfer {
  companyId: number
  transferId: string
  transferNo: string
  referenceNo: string
  trnDate: Date | string
  accountDate: Date | string
  paymentTypeId: number
  chequeNo: string | null
  chequeDate: Date | string
  jobOrderId: number
  taskId: number
  serviceId: number

  fromBankId: number
  fromCurrencyId: number
  fromExhRate: number
  fromBankChgGLId: number
  fromBankChgAmt: number
  fromBankChgLocalAmt: number
  fromTotAmt: number
  fromTotLocalAmt: number

  toBankId: number
  toCurrencyId: number
  toExhRate: number
  toBankChgGLId: number
  toBankChgAmt: number
  toBankChgLocalAmt: number
  toTotAmt: number
  toTotLocalAmt: number

  bankExhRate: number
  bankTotAmt: number
  bankTotLocalAmt: number

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
}

export interface ICbBankTransferFilter {
  startDate: Date | string
  endDate: Date | string
  search: string
  sortOrder: string
  sortBy: string
  pageNumber?: number
  pageSize?: number
}
