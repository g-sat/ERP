import { format } from "date-fns"

import { clientDateFormat } from "@/lib/date-utils"

const defaultContraDetails = {
  companyId: 0,
  contraId: 0,
  contraNo: "",
  itemNo: 0,
  moduleId: 0,
  transactionId: 0,
  documentId: 0,
  documentNo: "",
  docCurrencyId: 0,
  docExhRate: 0,
  referenceNo: "",
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

const defaultContra = {
  companyId: 0,
  contraId: "0",
  contraNo: "",
  referenceNo: "",
  trnDate: format(new Date(), clientDateFormat),
  accountDate: format(new Date(), clientDateFormat),
  supplierId: 0,
  supplierName: "",
  customerId: 0,
  customerName: "",
  currencyId: 0,
  currencyCode: "",
  currencyName: "",
  exhRate: 0,
  remarks: "",
  totAmt: 0,
  totLocalAmt: 0,
  exhGainLoss: 0,
  moduleFrom: "",
  createById: 0,
  createDate: format(new Date(), clientDateFormat),
  editVer: 0,
  editById: 0,
  editDate: null,
  editVersion: 0,
  isCancel: false,
  cancelById: 0,
  cancelDate: null,
  cancelRemarks: null,
  isPost: false,
  postById: 0,
  postDate: null,
  appStatusId: 0,
  appById: 0,
  appDate: null,
  data_details: [],
}

// Function to get default values with custom date format
export const getDefaultValues = (dateFormat: string = clientDateFormat) => {
  return {
    defaultContra: {
      ...defaultContra,
      trnDate: format(new Date(), dateFormat),
      accountDate: format(new Date(), dateFormat),
      createDate: format(new Date(), dateFormat),
    },
    defaultContraDetails: {
      ...defaultContraDetails,
      docAccountDate: format(new Date(), dateFormat),
      docDueDate: format(new Date(), dateFormat),
    },
  }
}

export { defaultContra, defaultContraDetails }
