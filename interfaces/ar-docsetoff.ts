export interface IArDocSetOffHd {
  companyId: number
  setoffId: string
  setoffNo: string
  referenceNo: string
  trnDate: Date | string
  accountDate: Date | string

  customerId: number
  currencyId: number
  exhRate: number

  allocTotAmt: number
  balTotAmt: number
  unAllocTotAmt: number

  exhGainLoss: number
  remarks: string | null

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
  createBy: string
  editBy: string
  cancelBy: string
  appBy: string
  data_details: IArDocSetOffDt[]
}

export interface IArDocSetOffFilter {
  startDate: Date | string
  endDate: Date | string
  search: string
  sortOrder: string
  sortBy: string
  pageNumber?: number
  pageSize?: number
}

export interface IArDocSetOffDt {
  companyId: number
  setoffId: string
  setoffNo: string
  itemNo: number
  transactionId: number
  documentId: number
  documentNo: string
  docRefNo: string
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
