import { format } from "date-fns"

import { clientDateFormat } from "@/lib/date-utils"

const defaultBankReconDetails = {
  reconId: "0",
  reconNo: "",
  itemNo: 0,
  isSel: false,
  moduleId: 0,
  transactionId: 0,
  documentId: 0,
  documentNo: "",
  docReferenceNo: "",
  accountDate: format(new Date(), clientDateFormat),
  paymentTypeId: 0,
  chequeNo: "",
  chequeDate: format(new Date(), clientDateFormat),
  customerId: 0,
  supplierId: 0,
  glId: 0,
  isDebit: false,
  exhRate: 0,
  totAmt: 0,
  totLocalAmt: 0,
  paymentFromTo: "",
  remarks: "",
  editVersion: 0,
}

const defaultBankRecon = {
  companyId: 0,
  reconId: "0",
  reconNo: "",
  prevReconId: 0,
  prevReconNo: "",
  referenceNo: "",
  trnDate: format(new Date(), clientDateFormat),
  accountDate: format(new Date(), clientDateFormat),
  bankId: 0,
  currencyId: 0,
  fromDate: format(new Date(), clientDateFormat),
  toDate: format(new Date(), clientDateFormat),
  remarks: "",
  totAmt: 0,
  opBalAmt: 0,
  clBalAmt: 0,
  createById: 0,
  createDate: format(new Date(), clientDateFormat),
  editById: undefined,
  editDate: undefined,
  editVersion: 0,
  isCancel: false,
  cancelById: undefined,
  cancelDate: undefined,
  cancelRemarks: undefined,
  isPost: false,
  postById: undefined,
  postDate: undefined,
  appStatusId: undefined,
  appById: undefined,
  appDate: undefined,
  data_details: [],
}

// Function to get default values with custom date format
export const getDefaultValues = (dateFormat: string = clientDateFormat) => {
  return {
    defaultBankRecon: {
      ...defaultBankRecon,
      trnDate: format(new Date(), dateFormat),
      accountDate: format(new Date(), dateFormat),
      fromDate: format(new Date(), dateFormat),
      toDate: format(new Date(), dateFormat),
      createDate: format(new Date(), dateFormat),
    },
    defaultBankReconDetails: {
      ...defaultBankReconDetails,
      accountDate: format(new Date(), dateFormat),
      chequeDate: format(new Date(), dateFormat),
    },
  }
}

export { defaultBankRecon, defaultBankReconDetails }
