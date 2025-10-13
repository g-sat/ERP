export interface IApOutTransaction {
  companyId: number
  transactionId: number
  documentId: string
  documentNo: string
  referenceNo: string
  accountDate: Date | string
  dueDate: Date | string
  supplierId: number
  supplierCode: null | number | string
  supplierName: null | string
  currencyId: number
  currencyCode: null | string
  currencyName: null | string
  exhRate: number
  totAmt: number
  totLocalAmt: number
  balAmt: number
  balLocalAmt: number
  remarks: string
  createById: number
  createDate: Date | string
  createBy: string
}
