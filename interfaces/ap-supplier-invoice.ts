export interface IApSupplierInvoice {
  invoiceId?: string
  invoiceNo?: string
  referenceNo?: string
  accountDate?: string | Date
  dueDate?: string | Date
  currencyId?: number
  currencyCode?: string | null
  currencyName?: string | null
  exhRate?: number
  totAmt?: number
  totLocalAmt?: number
  gstAmt?: number
  gstLocalAmt?: number
  gstCtyAmt?: number
  totAmtAftGst?: number
  totLocalAmtAftGst?: number
  totCtyAmtAftGst?: number
}
