export interface IGLContraHd {
  companyId: number
  contraId: string
  contraNo: string
  referenceNo: string
  trnDate: Date | string
  accountDate: Date | string
  supplierId: number
  customerId: number
  currencyId: number
  exhRate: number
  remarks: string
  totAmt: number
  totLocalAmt: number
  exhGainLoss: number
  moduleFrom: string
  createById: number
  createDate: Date | string
  editVer: number
  editById?: number
  editDate?: Date | string
  editVersion: number
  isCancel: boolean
  cancelById?: number
  cancelDate?: Date | string
  cancelRemarks?: string
  isPost?: boolean
  postById?: number
  postDate?: Date | string
  appStatusId?: number
  appById?: number
  appDate?: Date | string
  data_details: IGLContraDt[]
}

export interface IGLContraFilter {
  startDate: Date | string
  endDate: Date | string
  search: string
  sortOrder: string
  sortBy: string
  pageNumber?: number
  pageSize?: number
}

export interface IGLContraDt {
  companyId: number
  contraId: number
  contraNo: string
  itemNo: number
  moduleId: number
  transactionId: number
  documentId: number
  documentNo: string
  docCurrencyId: number
  docExhRate: number
  referenceNo: string
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
