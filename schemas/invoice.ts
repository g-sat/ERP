import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import * as z from "zod"

export const arinvoiceHdSchema = (
  required: IMandatoryFields,
  visible: IVisibleFields
) => {
  return z.object({
    // Core Fields

    invoiceId: z.string().optional().default("0"),
    invoiceNo: z.string().optional().default(""),
    referenceNo: z.string().nullable().optional().default(""),
    trnDate: z.union([z.date(), z.string()]),
    accountDate: z.union([z.date(), z.string()]),
    deliveryDate:
      required?.m_DeliveryDate && visible?.m_DeliveryDate
        ? z.union([z.date(), z.string()])
        : z.union([z.date(), z.string(), z.null()]).optional().default(null),
    dueDate: z.union([z.date(), z.string()]),
    customerId: z.number().min(1),

    // Currency Fields
    currencyId: z.number().min(1),
    exhRate: z.number().min(0),
    ctyExhRate: z.number().min(0),

    // Credit Terms
    creditTermId: z.number().min(1),

    // Bank Fields
    bankId:
      required?.m_BankId && visible?.m_BankId
        ? z.number()
        : z.union([z.number(), z.null()]).optional().default(0),

    // Amounts
    totAmt: required?.m_TotAmt
      ? z.number().min(0)
      : z.union([z.number(), z.null()]).optional().default(0),
    totLocalAmt: z.union([z.number(), z.null()]).optional().default(0),
    totCtyAmt: visible?.m_CtyCurr
      ? z.number().min(0)
      : z.union([z.number(), z.null()]).optional().default(0),
    gstClaimDate: z
      .union([z.date(), z.string(), z.null()])
      .optional()
      .default(null),
    gstAmt: z.union([z.number(), z.null()]).optional().default(0),
    gstLocalAmt: z.union([z.number(), z.null()]).optional().default(0),
    gstCtyAmt: visible?.m_CtyCurr
      ? z.number().min(0)
      : z.union([z.number(), z.null()]).optional().default(0),
    totAmtAftGst: z.union([z.number(), z.null()]).optional().default(0),
    totLocalAmtAftGst: z.union([z.number(), z.null()]).optional().default(0),
    totCtyAmtAftGst: visible?.m_CtyCurr
      ? z.number().min(0)
      : z.union([z.number(), z.null()]).optional().default(0),
    balAmt: z.union([z.number(), z.null()]).optional().default(0),
    balLocalAmt: z.union([z.number(), z.null()]).optional().default(0),
    payAmt: z.union([z.number(), z.null()]).optional().default(0),
    payLocalAmt: z.union([z.number(), z.null()]).optional().default(0),
    exGainLoss: z.union([z.number(), z.null()]).optional().default(0),

    // Order Details
    salesOrderId: z
      .union([z.string(), z.number(), z.null()])
      .optional()
      .default(null),
    salesOrderNo: z.union([z.string(), z.null()]).default(null),
    operationId: z
      .union([z.string(), z.number(), z.null()])
      .optional()
      .default(null),
    operationNo: z.union([z.string(), z.null()]).default(null),
    remarks: required?.m_Remarks_Hd
      ? z.string().min(3)
      : z.string().optional().default(""),

    // Address and Contact
    addressId: z.union([z.number(), z.null()]).optional().default(null),
    contactId: z.union([z.number(), z.null()]).optional().default(null),
    address1: required?.m_Address1
      ? z.string().min(1)
      : z.union([z.string(), z.null()]).optional().default(""),
    address2: required?.m_Address2
      ? z.string().min(1)
      : z.union([z.string(), z.null()]).optional().default(""),
    address3: required?.m_Address3
      ? z.string().min(1)
      : z.union([z.string(), z.null()]).optional().default(""),
    address4: required?.m_Address4
      ? z.string().min(1)
      : z.union([z.string(), z.null()]).optional().default(""),
    pinCode: required?.m_PinCode
      ? z.string().min(1)
      : z.string().optional().default(""),
    countryId: required?.m_Countryd
      ? z.number().min(1)
      : z.union([z.number(), z.null()]).optional().default(0),
    phoneNo: required?.m_PhoneNo
      ? z.string().min(9)
      : z.union([z.string(), z.null()]).optional().default(null),
    faxNo: z.union([z.string(), z.null()]).optional().default(null),
    contactName: z.union([z.string(), z.null()]).optional().default(null),
    mobileNo: z.union([z.string(), z.null()]).optional().default(null),
    emailAdd: required?.m_EmailAdd
      ? z.string().email().nullable().optional()
      : z.union([z.string(), z.null()]).optional().default(null),

    // Supplier Details
    moduleFrom: z.union([z.string(), z.null()]).optional().default(null),
    suppInvoiceNo: required?.m_SuppInvoiceNo
      ? z.string().min(1)
      : z.union([z.string(), z.null()]).optional().default(""),
    supplierName: z.union([z.string(), z.null()]).optional().default(""),
    apInvoiceId: z
      .union([z.string(), z.number(), z.null()])
      .optional()
      .default(null),
    apInvoiceNo: z.union([z.string(), z.null()]).nullable().default(null),

    // Nested Details
    data_details: z.array(arinvoiceDtSchema(required, visible)).min(1),
  })
}

export type ArInvoiceHdFormValues = z.infer<
  ReturnType<typeof arinvoiceHdSchema>
>

export const arinvoiceHdFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type ArInvoiceHdFiltersValues = z.infer<typeof arinvoiceHdFiltersSchema>

export const arinvoiceDtSchema = (
  required: IMandatoryFields,
  visible: IVisibleFields
) => {
  return z.object({
    // Core Fields
    invoiceId: z.string().optional().default("0"),
    invoiceNo: z.string().optional().default(""),
    itemNo: z.number().min(1),
    seqNo: z.number().min(1),
    docItemNo: z.number().default(0),

    // Product Fields
    productId:
      required?.m_ProductId && visible?.m_ProductId
        ? z.number().min(1)
        : z.union([z.number(), z.null()]).optional().default(0),

    // GL Fields
    glId: required?.m_GLId
      ? z.number().min(1)
      : z.union([z.number(), z.null()]).optional().default(0),

    // Quantity and UOM
    qty:
      visible?.m_QTY && required?.m_QTY
        ? z.number().min(0)
        : z.union([z.number(), z.null()]).optional().default(0),
    billQTY: visible?.m_BillQTY
      ? z.number().min(0)
      : z.union([z.number(), z.null()]).optional().default(0),
    uomId:
      required?.m_UomId && visible?.m_UomId
        ? z.number().min(1)
        : z.union([z.number(), z.null()]).optional().default(0),

    // Pricing
    unitPrice:
      visible?.m_UnitPrice && required?.m_UnitPrice
        ? z.number().min(0)
        : z.union([z.number(), z.null()]).optional().default(0),
    totAmt: required?.m_TotAmt
      ? z.number().min(0)
      : z.union([z.number(), z.null()]).optional().default(0),
    totLocalAmt: z.number().min(0),
    totCtyAmt: visible?.m_CtyCurr
      ? z.number().min(0)
      : z.union([z.number(), z.null()]).optional().default(0),

    // Remarks
    remarks: required?.m_Remarks
      ? z.string()
      : z.union([z.string(), z.null()]).optional().default(""),

    // GST Fields
    gstId:
      required?.m_GstId && visible?.m_GstId
        ? z.number().min(1)
        : z.union([z.number(), z.null()]).optional().default(0),
    gstPercentage: z.number().min(0),
    gstAmt: z.number().min(0),
    gstLocalAmt: z.union([z.number(), z.null()]).optional().default(0),
    gstCtyAmt: visible?.m_CtyCurr
      ? z.number().min(0)
      : z.union([z.number(), z.null()]).optional().default(0),

    // Delivery Date
    deliveryDate:
      required?.m_DeliveryDate && visible?.m_DeliveryDate
        ? z.union([z.date(), z.string()])
        : z.union([z.date(), z.string(), z.null()]).optional().default(null),

    // Department Fields
    departmentId:
      required?.m_DepartmentId && visible?.m_DepartmentId
        ? z.number().min(1)
        : z.union([z.number(), z.null()]).optional().default(null),

    // Employee Fields
    employeeId:
      required?.m_EmployeeId && visible?.m_EmployeeId
        ? z.number().min(1)
        : z.union([z.number(), z.null()]).optional().default(null),

    // Port Fields
    portId:
      visible?.m_PortId && required?.m_PortId
        ? z.number().min(1)
        : z.union([z.number(), z.null()]).optional().default(null),

    // Vessel Fields
    vesselId:
      required?.m_VesselId && visible?.m_VesselId
        ? z.number().min(1)
        : z.union([z.number(), z.null()]).optional().default(null),

    // Barge Fields
    bargeId:
      visible?.m_BargeId && required?.m_BargeId
        ? z.number().min(1)
        : z.union([z.number(), z.null()]).optional().default(null),

    // Voyage Fields
    voyageId:
      required?.m_VoyageId && visible?.m_VoyageId
        ? z.number().min(1)
        : z.union([z.number(), z.null()]).optional().default(null),

    // Operation Fields
    operationId: z
      .union([z.string(), z.number(), z.null()])
      .optional()
      .default(null),
    operationNo: z.union([z.string(), z.null()]).default(null),
    opRefNo: z.union([z.number(), z.string(), z.null()]).default(null),

    // Sales Order Fields
    salesOrderId: z
      .union([z.string(), z.number(), z.null()])
      .optional()
      .default(null),
    salesOrderNo: z.union([z.string(), z.null()]).default(null),

    // Supply Date
    supplyDate:
      required?.m_SupplyDate && visible?.m_SupplyDate
        ? z.union([z.date(), z.string()])
        : z.union([z.date(), z.string(), z.null()]).optional().default(null),

    // Supplier Details
    supplierName: z.union([z.string(), z.null()]).default(null),
    suppInvoiceNo: z.union([z.string(), z.null()]).default(null),
    apInvoiceId: z
      .union([z.string(), z.number(), z.null()])
      .optional()
      .default(null),
    apInvoiceNo: z.union([z.string(), z.null()]).nullable().default(null),

    // Audit Fields
    editVersion: z.union([z.number(), z.null()]).optional().default(0),
  })
}

export type ArInvoiceDtFormValues = z.infer<
  ReturnType<typeof arinvoiceDtSchema>
>

export const arinvoiceDtFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type ArInvoiceDtFiltersValues = z.infer<typeof arinvoiceDtFiltersSchema>
