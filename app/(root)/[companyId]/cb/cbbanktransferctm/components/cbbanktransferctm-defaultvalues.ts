import { format } from "date-fns"

import { clientDateFormat } from "@/lib/date-utils"

// Default values for Bank Transfer CTM Details (Individual Detail Record)
const defaultBankTransferCtmDt = {
  transferId: "0",
  transferNo: "",
  itemNo: 0,

  // Job Order Fields
  jobOrderId: 0,
  taskId: 0,
  serviceId: 0,

  // To Bank Fields
  toBankId: 0,
  toCurrencyId: 0,
  toExhRate: 0,
  toBankChgGLId: 0,
  toBankChgAmt: 0,
  toBankChgLocalAmt: 0,
  toTotAmt: 0,
  toTotLocalAmt: 0,

  // Bank Exchange Fields
  bankExhRate: 0,
  bankTotAmt: 0,
  bankTotLocalAmt: 0,

  // Audit Fields
  editVersion: 0,
}

// Default values for Bank Transfer CTM Header
const defaultBankTransferCtmHd = {
  companyId: 0,
  transferId: "0",
  transferNo: "",
  referenceNo: "",
  trnDate: format(new Date(), clientDateFormat),
  accountDate: format(new Date(), clientDateFormat),

  // Payment Fields
  paymentTypeId: 0,
  chequeNo: "",
  chequeDate: format(new Date(), clientDateFormat),

  // From Bank Fields
  fromBankId: 0,
  fromCurrencyId: 0,
  fromExhRate: 0,
  fromBankChgGLId: 0,
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
  createDate: format(new Date(), clientDateFormat),
  editBy: undefined,
  editDate: undefined,
  editVersion: 0,
  isCancel: false,
  cancelBy: undefined,
  cancelDate: undefined,
  cancelRemarks: undefined,
  isPost: false,
  postBy: undefined,
  postDate: undefined,
  appStatusId: undefined,
  appBy: undefined,
  appDate: undefined,

  // Detail Items
  data_details: [],
}

// Function to get default values with custom date format
export const getDefaultValues = (dateFormat: string = clientDateFormat) => {
  return {
    defaultBankTransferCtmHd: {
      ...defaultBankTransferCtmHd,
      trnDate: format(new Date(), dateFormat),
      accountDate: format(new Date(), dateFormat),
      chequeDate: format(new Date(), dateFormat),
      createDate: format(new Date(), dateFormat),
      data_details: [],
    },
    defaultBankTransferCtmDt: {
      ...defaultBankTransferCtmDt,
    },
  }
}

export { defaultBankTransferCtmHd, defaultBankTransferCtmDt }
