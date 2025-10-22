export interface IApDocsetoffHd {
  companyId: number
  setoffId: string
  setoffNo: string
  referenceNo: string
  trnDate: Date | string
  accountDate: Date | string
  bankId: number
  paymentTypeId: number
  chequeNo: string | null
  chequeDate: Date | string
  bankChgGLId: number
  bankChgAmt: number
  bankChgLocalAmt: number
  supplierId: number
  currencyId: number
  exhRate: number
  totAmt: number
  totLocalAmt: number
  payCurrencyId: number
  payExhRate: number
  payTotAmt: number
  payTotLocalAmt: number
  unAllocTotAmt: number
  unAllocTotLocalAmt: number
  exhGainLoss: number
  remarks: string | null
  docExhRate: number
  docTotAmt: number
  docTotLocalAmt: number
  allocTotAmt: number | null
  allocTotLocalAmt: number | null
  moduleFrom: string
  createById: number
  createDate: Date | string
  editById: number | null
  editDate: Date | null
  editVersion: number
  isCancel: boolean
  cancelById: number | null
  cancelDate: Date | null
  cancelRemarks: string | null
  isPost: boolean | null
  postById: number | null
  postDate: Date | null
  appStatusId: number | null
  appById: number | null
  appDate: Date | null
  data_details: IApDocsetoffDt[]
}

export interface IApDocsetoffFilter {
  startDate: Date | string
  endDate: Date | string
  search: string
  sortOrder: string
  sortBy: string
  pageNumber?: number
  pageSize?: number
}

export interface IApDocsetoffDt {
  companyId: number
  setoffId: string
  setoffNo: string
  itemNo: number
  transactionId: number
  documentId: number
  documentNo: string
  referenceNo: string
  docCurrencyId: number
  docCurrencyCode: string
  docExhRate: number
  docAccountDate: Date | string
  docDueDate: Date | string
  docTotAmt: number
  docTotLocalAmt: number
  docBalAmt: number
  docBalLocalAmt: number
  allocAmt: number
  allocLocalAmt: number
  docAllocAmt: number
  docAllocLocalAmt: number
  centDiff: number
  exhGainLoss: number
  editVersion: number
}
