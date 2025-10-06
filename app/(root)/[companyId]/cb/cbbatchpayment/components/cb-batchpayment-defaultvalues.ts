import { ICBBatchPaymentHd } from "@/interfaces/cb-batchpayment"

export const getCBBatchPaymentDefaultValues = (
  companyId: number
): ICBBatchPaymentHd => {
  const currentDate = new Date()

  return {
    companyId,
    paymentId: "",
    paymentNo: "",
    trnDate: currentDate,
    accountDate: currentDate,
    supplierId: 0,
    supplierCode: "",
    supplierName: "",
    currencyId: 0,
    currencyCode: "",
    currencyName: "",
    exhRate: 1,
    ctyExhRate: 1,
    bankId: 0,
    bankCode: "",
    bankName: "",
    totAmt: 0,
    totLocalAmt: 0,
    totCtyAmt: 0,
    remarks: "",
    createById: 0,
    createDate: currentDate,
    isCancel: false,
    createBy: 0,
    editVersion: 0,
    data_details: [],
  }
}

export const getCBBatchPaymentDetailDefaultValues = () => {
  return {
    paymentId: 0,
    paymentNo: "",
    itemNo: 1,
    seqNo: 1,
    invoiceDate: new Date(),
    supplierName: "",
    invoiceNo: "",
    gstNo: "",
    glId: 0,
    remarks: "",
    jobOrderId: 0,
    taskId: 0,
    serviceId: 0,
    totAmt: 0,
    totLocalAmt: 0,
    totCtyAmt: 0,
    gstId: 0,
    gstPercentage: 0,
    gstAmt: 0,
    gstLocalAmt: 0,
    gstCtyAmt: 0,
    editVersion: 0,
  }
}
