export interface IGlTransactionDetails {
  DocumentNo?: string
  ReferenceNo?: string
  AccountDate?: string | Date
  CurrencyCode?: string
  CurrencyName?: string
  ExhRate?: number
  CtyExhRate?: number
  BankCode?: string
  BankName?: string
  GLCode?: string
  GLName?: string
  IsDebit?: boolean
  TotAmt?: number
  TotLocalAmt?: number
  TotCtyAmt?: number
  gstCode?: string
  gstName?: string
  gstAmt?: number
  gstLocalAmt?: number
  gstCtyAmt?: number
  createDate?: string | Date
}

export interface IPaymentDetails {
  DocumentNO?: string
  ReferenceNo?: string
  AccountDate?: string | Date
  TotAmt?: number
  TotLocalAmt?: number
  AllAmt?: number
  AllLocalAmt?: number
  ExGainLoss?: number | string
}
