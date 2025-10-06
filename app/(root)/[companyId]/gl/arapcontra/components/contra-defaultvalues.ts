import { GLContraHdSchemaType } from "@/schemas/gl-arapcontra"
import { format } from "date-fns"

import { clientDateFormat } from "@/lib/date-utils"

export const defaultContra: GLContraHdSchemaType = {
  // Core Fields
  contraId: "0",
  contraNo: "",
  referenceNo: "",
  trnDate: format(new Date(), clientDateFormat),
  accountDate: format(new Date(), clientDateFormat),
  supplierId: 0,
  customerId: 0,

  // Currency Fields
  currencyId: 0,
  exhRate: 0,

  // Amounts
  totAmt: 0,
  totLocalAmt: 0,
  exhGainLoss: 0,

  // Module and Remarks
  moduleFrom: "",
  remarks: "",

  // Audit Fields
  createById: 0,
  createDate: format(new Date(), clientDateFormat),
  editVer: 0,
  editById: null,
  editDate: null,
  editVersion: 0,
  isCancel: false,
  cancelById: null,
  cancelDate: null,
  cancelRemarks: null,

  // Posting Fields
  isPost: null,
  postById: null,
  postDate: null,

  // Approval Fields
  appStatusId: null,
  appById: null,
  appDate: null,

  // Nested Details
  data_details: [],
}
