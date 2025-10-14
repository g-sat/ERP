import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import * as z from "zod"

export const cbBatchPaymentHdSchema = (
  required: IMandatoryFields,
  visible: IVisibleFields
) => {
  return z.object({
    // Core Fields
    companyId: z.number().optional(),
    paymentId: z.string().optional(),
    paymentNo: z.string().optional(),
    referenceNo: required?.m_ReferenceNo
      ? z.string().min(1, "Reference No is required")
      : z.string().optional(),
    trnDate: z.union([z.date(), z.string()]),
    accountDate: z.union([z.date(), z.string()]),

    // Currency Fields
    currencyId: z.number().min(1, "Currency is required"),
    currencyCode: z.string().optional().nullable(),
    currencyName: z.string().optional().nullable(),
    exhRate: z.number().min(0.000001, "Exchange Rate must be greater than 0"),
    ctyExhRate: z
      .number()
      .min(0.000001, "City Exchange Rate must be greater than 0"),

    // Bank Fields
    bankId:
      required?.m_BankId && visible?.m_BankId
        ? z.number().min(1, "Bank is required")
        : z.number().optional(),
    bankCode: z.union([z.string(), z.number()]).optional().nullable(),
    bankName: z.string().optional().nullable(),

    // Amounts
    totAmt: required?.m_TotAmt ? z.number().min(0) : z.number().optional(),
    totLocalAmt: z.number().optional(),
    totCtyAmt: visible?.m_CtyCurr ? z.number().min(0) : z.number().optional(),

    // GST Fields
    gstClaimDate: z.union([z.date(), z.string()]).optional(),
    gstAmt: z.number().optional(),
    gstLocalAmt: z.number().optional(),
    gstCtyAmt: visible?.m_CtyCurr ? z.number().min(0) : z.number().optional(),
    totAmtAftGst: z.number().optional(),
    totLocalAmtAftGst: z.number().optional(),
    totCtyAmtAftGst: visible?.m_CtyCurr
      ? z.number().min(0)
      : z.number().optional(),

    // Additional Fields
    remarks: required?.m_Remarks_Hd
      ? z.string().min(3, "Remarks must be at least 3 characters")
      : z.string().optional(),

    moduleFrom: z.string().optional(),

    // Audit Fields
    createById: z.number().optional(),
    createDate: z.union([z.date(), z.string()]).optional(),
    editById: z.number().optional().nullable(),
    editDate: z.union([z.date(), z.null()]).optional(),
    isCancel: z.boolean().optional(),
    cancelById: z.number().optional(),
    cancelDate: z.union([z.date(), z.null()]).optional(),
    cancelRemarks: z.string().optional().nullable(),
    createBy: z.string().optional(),
    editBy: z.string().optional(),
    cancelBy: z.string().optional(),
    editVersion: z.number().optional(),
    isPost: z.boolean().optional(),
    postById: z.number().optional().nullable(),
    postDate: z.union([z.date(), z.null()]).optional(),
    appStatusId: z.number().optional().nullable(),
    appById: z.number().optional().nullable(),
    appDate: z.union([z.date(), z.null()]).optional(),

    // Nested Details
    data_details: z
      .array(cbBatchPaymentDtSchema(required, visible))
      .min(1, "At least one payment detail is required"),
  })
}

export type CbBatchPaymentHdSchemaType = z.infer<
  ReturnType<typeof cbBatchPaymentHdSchema>
>

export const cbBatchPaymentHdFiltersSchema = z.object({
  startDate: z.union([z.date(), z.string()]),
  endDate: z.union([z.date(), z.string()]),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  sortBy: z.string().optional(),
  pageNumber: z.number().optional(),
  pageSize: z.number().optional(),
})

export type CbBatchPaymentHdFiltersValues = z.infer<
  typeof cbBatchPaymentHdFiltersSchema
>

export const cbBatchPaymentDtSchema = (
  required: IMandatoryFields,
  visible: IVisibleFields
) => {
  return z.object({
    // Core Fields
    paymentId: z.string().optional(),
    paymentNo: z.string().optional(),
    itemNo: z.number().min(1, "Item No must be at least 1"),
    seqNo: z.number().min(1, "Sequence No must be at least 1"),
    invoiceDate: z.union([z.date(), z.string()]).optional(),
    invoiceNo: z.string().optional(),
    supplierName: z.string().optional(),

    // GL Fields
    glId: required?.m_GLId
      ? z.number().min(1, "Chart of Account is required")
      : z.number().optional(),
    glCode: z.string().optional(),
    glName: z.string().optional(),

    // Amounts
    totAmt: required?.m_TotAmt ? z.number().min(0) : z.number().optional(),
    totLocalAmt: z.number().min(0),
    totCtyAmt: visible?.m_CtyCurr ? z.number().min(0) : z.number().optional(),

    // Remarks
    remarks: required?.m_Remarks
      ? z.string().min(1, "Remarks is required")
      : z.string().optional(),

    // GST Fields
    gstId:
      required?.m_GstId && visible?.m_GstId
        ? z.number().min(1, "GST is required")
        : z.number().optional(),
    gstName: z.string().optional(),
    gstPercentage: z.number().min(0),
    gstAmt: z.number().min(0),
    gstLocalAmt: z.number().optional(),
    gstCtyAmt: visible?.m_CtyCurr ? z.number().min(0) : z.number().optional(),

    // Department Fields
    departmentId:
      required?.m_DepartmentId && visible?.m_DepartmentId
        ? z.number().min(1, "Department is required")
        : z.number().optional(),
    departmentCode: z.string().optional(),
    departmentName: z.string().optional(),

    // Employee Fields
    employeeId:
      required?.m_EmployeeId && visible?.m_EmployeeId
        ? z.number().min(1, "Employee is required")
        : z.number().optional(),
    employeeCode: z.string().optional(),
    employeeName: z.string().optional(),

    // Port Fields
    portId:
      required?.m_PortId && visible?.m_PortId
        ? z.number().min(1, "Port is required")
        : z.number().optional(),
    portCode: z.string().optional(),
    portName: z.string().optional(),

    // Vessel Fields
    vesselId:
      required?.m_VesselId && visible?.m_VesselId
        ? z.number().min(1, "Vessel is required")
        : z.number().optional(),
    vesselCode: z.string().optional(),
    vesselName: z.string().optional(),

    // Barge Fields
    bargeId:
      required?.m_BargeId && visible?.m_BargeId
        ? z.number().min(1, "Barge is required")
        : z.number().optional(),
    bargeCode: z.string().optional(),
    bargeName: z.string().optional(),

    // Voyage Fields
    voyageId:
      required?.m_VoyageId && visible?.m_VoyageId
        ? z.number().min(1, "Voyage is required")
        : z.number().optional(),
    voyageNo: z.string().optional(),

    // Job Order Fields
    jobOrderId:
      required?.m_JobOrderId && visible?.m_JobOrderId
        ? z.number().min(1, "Job Order is required")
        : z.number().optional(),
    jobOrderNo: z.string().optional(),

    // Task Fields
    taskId:
      required?.m_JobOrderId && visible?.m_JobOrderId
        ? z.number().min(1, "Task is required")
        : z.number().optional(),
    taskName: z.string().optional(),

    // Service Fields
    serviceId:
      required?.m_JobOrderId && visible?.m_JobOrderId
        ? z.number().min(1, "Service is required")
        : z.number().optional(),
    serviceName: z.string().optional(),

    // Audit Fields
    editVersion: z.number().optional(),
  })
}

export type CbBatchPaymentDtSchemaType = z.infer<
  ReturnType<typeof cbBatchPaymentDtSchema>
>

export const cbBatchPaymentDtFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type CbBatchPaymentDtFiltersValues = z.infer<
  typeof cbBatchPaymentDtFiltersSchema
>
