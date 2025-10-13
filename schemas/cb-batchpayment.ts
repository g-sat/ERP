import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import * as z from "zod"

export const cbbatchpaymentHdSchema = (
  required: IMandatoryFields,
  visible: IVisibleFields
) => {
  return z.object({
    // Core Fields
    paymentId: z.string().optional(),
    paymentNo: z.string().optional(),
    trnDate: z.union([z.date(), z.string()]),
    accountDate: z.union([z.date(), z.string()]),
    supplierId: z.number().min(1),

    // Currency Fields
    currencyId: z.number().min(1),
    exhRate: z.number().min(0),
    ctyExhRate: z.number().min(0),

    // Bank Fields
    bankId:
      required?.m_BankId && visible?.m_BankId
        ? z.number()
        : z.union([z.number(), z.null()]).optional(),

    // Amounts
    totAmt: required?.m_TotAmt
      ? z.number().min(0)
      : z.union([z.number(), z.null()]).optional(),
    totLocalAmt: z.union([z.number(), z.null()]).optional(),
    totCtyAmt: visible?.m_CtyCurr
      ? z.number().min(0)
      : z.union([z.number(), z.null()]).optional(),

    // Remarks
    remarks: required?.m_Remarks_Hd ? z.string().min(3) : z.string().optional(),

    // Nested Details
    data_details: z.array(cbbatchpaymentDtSchema(required, visible)).min(1),
  })
}

export type CBBatchPaymentHdSchemaType = z.infer<
  ReturnType<typeof cbbatchpaymentHdSchema>
>

export const cbbatchpaymentHdFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type CBBatchPaymentHdFiltersValues = z.infer<
  typeof cbbatchpaymentHdFiltersSchema
>

export const cbbatchpaymentDtSchema = (
  required: IMandatoryFields,
  visible: IVisibleFields
) => {
  return z.object({
    // Core Fields
    paymentId: z.string(),
    paymentNo: z.string(),
    itemNo: z.number().min(0),
    seqNo: z.number().min(1),

    // Invoice Details
    invoiceDate: z.union([z.date(), z.string(), z.null()]).optional(),
    supplierName: z.union([z.string(), z.null()]).optional(),
    invoiceNo: z.union([z.string(), z.null()]).optional(),
    gstNo: z.union([z.string(), z.null()]).optional(),

    // GL Fields
    glId: required?.m_GLId
      ? z.number().min(1)
      : z.union([z.number(), z.null()]).optional(),

    // Remarks
    remarks: required?.m_Remarks
      ? z.string().min(1)
      : z.union([z.string(), z.null()]).optional(),

    // Job Order and Service Fields
    jobOrderId: z.number().min(0),
    taskId: z.number().min(0),
    serviceId: z.number().min(0),

    // Amount Fields
    totAmt: required?.m_TotAmt
      ? z.number().min(0)
      : z.union([z.number(), z.null()]).optional(),
    totLocalAmt: z.number().min(0),
    totCtyAmt: visible?.m_CtyCurr
      ? z.number().min(0)
      : z.union([z.number(), z.null()]).optional(),

    // GST Fields
    gstId:
      required?.m_GstId && visible?.m_GstId
        ? z.number().min(1)
        : z.union([z.number(), z.null()]).optional(),
    gstPercentage: z.number().min(0),
    gstAmt: z.number().min(0),
    gstLocalAmt: z.number().min(0),
    gstCtyAmt: visible?.m_CtyCurr
      ? z.number().min(0)
      : z.union([z.number(), z.null()]).optional(),

    // Department Fields
    departmentId:
      required?.m_DepartmentId && visible?.m_DepartmentId
        ? z.number().min(1)
        : z.union([z.number(), z.null()]).optional(),

    // Employee Fields
    employeeId:
      required?.m_EmployeeId && visible?.m_EmployeeId
        ? z.number().min(1)
        : z.union([z.number(), z.null()]).optional(),

    // Port Fields
    portId:
      visible?.m_PortId && required?.m_PortId
        ? z.number().min(1)
        : z.union([z.number(), z.null()]).optional(),

    // Vessel Fields
    vesselId:
      required?.m_VesselId && visible?.m_VesselId
        ? z.number().min(1)
        : z.union([z.number(), z.null()]).optional(),

    // Barge Fields
    bargeId:
      visible?.m_BargeId && required?.m_BargeId
        ? z.number().min(1)
        : z.union([z.number(), z.null()]).optional(),

    // Voyage Fields
    voyageId:
      required?.m_VoyageId && visible?.m_VoyageId
        ? z.number().min(1)
        : z.union([z.number(), z.null()]).optional(),

    // Audit Fields
    editVersion: z.number().min(0),
  })
}

export type CBBatchPaymentDtSchemaType = z.infer<
  ReturnType<typeof cbbatchpaymentDtSchema>
>

export const cbbatchpaymentDtFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type CBBatchPaymentDtFiltersValues = z.infer<
  typeof cbbatchpaymentDtFiltersSchema
>
