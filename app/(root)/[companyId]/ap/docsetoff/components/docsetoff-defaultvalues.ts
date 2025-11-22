import { format } from "date-fns"

import { clientDateFormat } from "@/lib/date-utils"

const buildDefaultDocSetOffDetails = (dateFormat: string) => ({
  companyId: 0,
  setoffId: 0,
  setoffNo: "",
  itemNo: 0,
  transactionId: 0,
  documentId: "0",
  documentNo: "",
  docRefNo: "",
  docCurrencyId: 0,
  docExhRate: 0,
  docAccountDate: format(new Date(), dateFormat),
  docDueDate: format(new Date(), dateFormat),
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
})

const buildDefaultDocSetOff = (dateFormat: string) => ({
  setoffId: "0",
  setoffNo: "",
  supplierId: 0,
  referenceNo: "",
  trnDate: format(new Date(), dateFormat),
  accountDate: format(new Date(), dateFormat),

  currencyId: 0,
  exhRate: 0,
  allocTotAmt: 0,
  allocTotLocalAmt: 0,
  balTotAmt: 0,
  balLocalAmt: 0,
  unAllocTotAmt: 0,
  unAllocTotLocalAmt: 0,
  exhGainLoss: 0,
  remarks: "",
  moduleFrom: "",
  editVersion: 0,
  createBy: "",
  createDate: "",
  editBy: "",
  editDate: "",
  isCancel: false,
  cancelBy: "",
  cancelDate: "",
  cancelRemarks: "",
  data_details: [],
})

// Function to get default values with custom date format
export const getDefaultValues = (dateFormat: string = clientDateFormat) => ({
  defaultDocSetOff: buildDefaultDocSetOff(dateFormat),
  defaultDocSetOffDetails: buildDefaultDocSetOffDetails(dateFormat),
})

export const defaultDocSetOff = buildDefaultDocSetOff(clientDateFormat)
export const defaultDocSetOffDetails =
  buildDefaultDocSetOffDetails(clientDateFormat)
