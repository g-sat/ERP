import { format } from "date-fns"

import { clientDateFormat } from "@/lib/date-utils"

// Default values for Bank Transfer CTM Details (Individual Detail Record)
const buildDefaultCbBankTransferCtmDt = (_dateFormat: string) => ({
  transferId: "0",
  transferNo: "",
  itemNo: 0,
  seqNo: 0,

  // Job Order Fields
  jobOrderId: 0,
  jobOrderNo: "",
  taskId: 0,
  taskName: "",
  serviceItemNo: 0,
  serviceItemNoName: "",

  // To Bank Fields
  toBankId: 0,
  toBankCode: "",
  toBankName: "",
  toCurrencyId: 0,
  toCurrencyCode: "",
  toCurrencyName: "",
  toExhRate: 0,
  toTotAmt: 0,
  toTotLocalAmt: 0,
  toBankChgGLId: 0,
  toBankChgGLCode: "",
  toBankChgGLName: "",
  toBankChgAmt: 0,
  toBankChgLocalAmt: 0,

  // Bank Exchange Fields
  toBankExhRate: 0,
  toBankTotAmt: 0,
  toBankTotLocalAmt: 0,

  // Audit Fields
  editVersion: 0,
})

// Default values for Bank Transfer CTM Header
const buildDefaultCbBankTransferCtmHd = (dateFormat: string) => ({
  companyId: 0,
  transferId: "0",
  transferNo: "",
  referenceNo: "",
  trnDate: format(new Date(), dateFormat),
  accountDate: format(new Date(), dateFormat),

  // Payment Fields
  paymentTypeId: 0,
  paymentTypeName: "",
  chequeNo: "",
  chequeDate: format(new Date(), dateFormat),

  // From Bank Fields
  fromBankId: 0,
  fromBankCode: "",
  fromBankName: "",
  fromCurrencyId: 0,
  fromCurrencyCode: "",
  fromCurrencyName: "",
  fromExhRate: 0,
  fromBankChgGLId: 0,
  fromBankChgGLCode: "",
  fromBankChgGLName: "",
  fromBankChgAmt: 0,
  fromBankChgLocalAmt: 0,
  fromTotAmt: 0,
  fromTotLocalAmt: 0,

  // Additional Fields
  remarks: "",
  payeeTo: "",
  exhGainLoss: 0,
  moduleFrom: "",

  // Audit Fields
  createBy: "",
  createDate: format(new Date(), dateFormat),
  editBy: null,
  editDate: null,
  editVersion: 0,
  isCancel: false,
  cancelBy: null,
  cancelDate: null,
  cancelRemarks: null,
  isPost: null,
  postBy: null,
  postDate: null,
  appStatusId: null,
  appBy: null,
  appDate: null,

  // Detail Items
  data_details: [],
})

// Function to get default values with custom date format
export const getDefaultValues = (dateFormat: string = clientDateFormat) => ({
  defaultCbBankTransferCtm: buildDefaultCbBankTransferCtmHd(dateFormat),
  defaultCbBankTransferCtmDt: buildDefaultCbBankTransferCtmDt(dateFormat),
})

export const defaultCbBankTransferCtm =
  buildDefaultCbBankTransferCtmHd(clientDateFormat)
export const defaultCbBankTransferCtmDt =
  buildDefaultCbBankTransferCtmDt(clientDateFormat)
