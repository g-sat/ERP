import { format } from "date-fns"

import { clientDateFormat } from "@/lib/date-utils"

const defaultBankTransfer = {
  companyId: 0,
  transferId: "0",
  transferNo: "",
  referenceNo: "",
  trnDate: format(new Date(), clientDateFormat),
  accountDate: format(new Date(), clientDateFormat),
  paymentTypeId: 0,
  chequeNo: "",
  chequeDate: format(new Date(), clientDateFormat),
  jobOrderId: 0,
  taskId: 0,
  serviceItemNo: 0,
  serviceItemNoName: "",

  fromBankId: 0,
  fromCurrencyId: 0,
  fromExhRate: 0,
  fromBankChgGLId: 0,
  fromBankChgAmt: 0,
  fromBankChgLocalAmt: 0,
  fromTotAmt: 0,
  fromTotLocalAmt: 0,

  toBankId: 0,
  toCurrencyId: 0,
  toExhRate: 0,
  toBankChgGLId: 0,
  toBankChgAmt: 0,
  toBankChgLocalAmt: 0,
  toTotAmt: 0,
  toTotLocalAmt: 0,

  bankExhRate: 0,
  bankTotAmt: 0,
  bankTotLocalAmt: 0,

  remarks: "",
  payeeTo: "",
  exhGainLoss: 0,
  moduleFrom: "",
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
}

// Function to get default values with custom date format
export const getDefaultValues = (dateFormat: string = clientDateFormat) => {
  return {
    defaultBankTransfer: {
      ...defaultBankTransfer,
      trnDate: format(new Date(), dateFormat),
      accountDate: format(new Date(), dateFormat),
      chequeDate: format(new Date(), dateFormat),
      createDate: format(new Date(), dateFormat),
    },
  }
}

export { defaultBankTransfer }
