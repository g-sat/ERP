import { format } from "date-fns"

import { clientDateFormat } from "@/lib/date-utils"

const defaultRefundDetails = {
  companyId: 0,
  refundId: 0,
  refundNo: "",
  itemNo: 0,
  transactionId: 0,
  documentId: "0",
  documentNo: "",
  referenceNo: "",
  docCurrencyId: 0,
  docExhRate: 0,
  docAccountDate: format(new Date(), clientDateFormat),
  docDueDate: format(new Date(), clientDateFormat),
  docTotAmt: 0,
  docTotLocalAmt: 0,
  docBalAmt: 0,
  docBalLocalAmt: 0,
  allocAmt: 0,
  allocLocalAmt: 0,
  docAllocAmt: 0,
  docAllocLocalAmt: 0,
  centDiff: 0,
  exhGainLoss: 0,
  editVersion: 0,
}

const defaultRefund = {
  refundId: "0",
  refundNo: "",
  suppInvoiceNo: "",
  referenceNo: "",
  trnDate: format(new Date(), clientDateFormat),
  accountDate: format(new Date(), clientDateFormat),
  bankId: 0,
  paymentTypeId: 0,
  chequeNo: "",
  chequeDate: format(new Date(), clientDateFormat),
  bankChgGLId: 0,
  bankChgAmt: 0,
  bankChgLocalAmt: 0,
  supplierId: 0,
  currencyId: 0,
  exhRate: 0,
  totAmt: 0,
  totLocalAmt: 0,
  payCurrencyId: 0,
  payExhRate: 0,
  payTotAmt: 0,
  payTotLocalAmt: 0,
  unAllocTotAmt: 0,
  unAllocTotLocalAmt: 0,
  exhGainLoss: 0,
  remarks: "",
  docExhRate: 0,
  docTotAmt: 0,
  docTotLocalAmt: 0,
  allocTotAmt: 0,
  allocTotLocalAmt: 0,
  moduleFrom: "",
  editVersion: 0,
  createBy: "",
  createDate: "",
  editBy: "",
  editDate: "",
  isCancel: false,
  cancelById: 0,
  cancelBy: "",
  cancelDate: "",
  cancelRemarks: "",
  data_details: [],
}

// Function to get default values with custom date format
export const getDefaultValues = (dateFormat: string = clientDateFormat) => {
  return {
    defaultRefund: {
      ...defaultRefund,
      trnDate: format(new Date(), dateFormat),
      accountDate: format(new Date(), dateFormat),
      chequeDate: format(new Date(), dateFormat),
      createDate: format(new Date(), dateFormat),
    },
    defaultRefundDetails: {
      ...defaultRefundDetails,
      docAccountDate: format(new Date(), dateFormat),
      docDueDate: format(new Date(), dateFormat),
    },
  }
}

export { defaultRefund, defaultRefundDetails }
