import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import * as z from "zod"

export const apdocsetoffHdSchema = (
  required: IMandatoryFields,
  visible: IVisibleFields
) => {
  return z.object({
    // Core Fields

    setoffId: z.string().optional(),
    setoffNo: z.string().optional(),
    suppInvoiceNo: required?.m_SuppInvoiceNo
      ? z.string().min(1, "Supplier Invoice No is required")
      : z.string().optional(),
    referenceNo: required?.m_ReferenceNo
      ? z.string().min(1, "Reference No is required")
      : z.string().optional(),
    trnDate: z.union([z.date(), z.string()]),
    accountDate: z.union([z.date(), z.string()]),
    supplierId: z.number().min(1, "Supplier is required"),
    // Bank Fields
    bankId:
      required?.m_BankId && visible?.m_BankId
        ? z.number().min(1, "Bank is required")
        : z.number().optional(),
    // Payment Type Fields
    paymentTypeId: z.number().min(1, "Payment Type is required"),
    // Cheque Fields
    chequeNo: z.string().optional(),
    chequeDate: z.union([z.date(), z.string()]),

    // Bank Charge GL Fields
    bankChgGLId: z.number().min(0, "Bank Charge GL is required"),
    bankChgAmt: z.number().min(0, "Bank Charges Amount is required"),
    bankChgLocalAmt: z.number().min(0, "Bank Charges Local Amount is required"),

    // Currency Fields
    currencyId: z.number().min(1, "Currency is required"),
    exhRate: z.number().min(0, "Exchange Rate is required"),

    // Amounts
    totAmt: required?.m_TotAmt ? z.number().min(0) : z.number().optional(),
    totLocalAmt: z.number().optional(),

    // Payment Currency Fields
    payCurrencyId: z.number().min(1, "Payment Currency is required"),
    payExhRate: z.number().min(0, "Payment Exchange Rate is required"),
    payTotAmt: z.number().min(0, "Payment Total Amount is required"),
    payTotLocalAmt: z.number().min(0, "Payment Total Local Amount is required"),

    // Unallocated Amount Fields
    unAllocTotAmt: z.number().min(0, "Unallocated Total Amount is required"),
    unAllocTotLocalAmt: z
      .number()
      .min(0, "Unallocated Total Local Amount is required"),
    exhGainLoss: z.number().min(0, "Exchange Gain/Loss is required"),

    remarks: required?.m_Remarks_Hd
      ? z.string().min(3, "Remarks must be at least 3 characters")
      : z.string().optional(),

    // Document Fields
    docExhRate: z.number().min(0, "Document Exchange Rate is required"),
    docTotAmt: z.number().min(0, "Document Total Amount is required"),
    docTotLocalAmt: z
      .number()
      .min(0, "Document Total Local Amount is required"),
    // Allocated Amount Fields
    allocTotAmt: z.number().min(0, "Allocated Total Amount is required"),
    allocTotLocalAmt: z
      .number()
      .min(0, "Allocated Total Local Amount is required"),

    // Module From Field
    moduleFrom: z.string().optional(),

    // Audit Fields
    editVersion: z.number().optional(),
    createBy: z.string().optional(),
    createDate: z.string().optional(),
    editBy: z.string().optional(),
    editDate: z.string().optional(),
    isCancel: z.boolean().optional(),
    cancelBy: z.string().optional(),
    cancelDate: z.string().optional(),
    cancelRemarks: z.string().optional(),

    // Nested Details
    data_details: z
      .array(apdocsetoffDtSchema(required, visible))
      .min(1, "At least one invoice detail is required"),
  })
}

export type ApDocsetoffHdSchemaType = z.infer<
  ReturnType<typeof apdocsetoffHdSchema>
>

export const apdocsetoffHdFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type ApDocsetoffHdFiltersValues = z.infer<
  typeof apdocsetoffHdFiltersSchema
>

export const apdocsetoffDtSchema = (
  _required: IMandatoryFields,
  _visible: IVisibleFields
) => {
  return z.object({
    // Core Fields
    setoffId: z.string().optional(),
    setoffNo: z.string().optional(),
    itemNo: z.number().min(1, "Item No must be at least 1"),
    transactionId: z.number().min(1, "Transaction is required"),

    // Document Fields
    documentId: z.string().min(1, "Document is required"),
    documentNo: z.string().min(1, "Document No is required"),
    referenceNo: z.string().optional(),
    docCurrencyId: z.number().min(1, "Document Currency is required"),
    docExhRate: z.number().min(0, "Document Exchange Rate is required"),
    docAccountDate: z.union([z.date(), z.string()]),
    docDueDate: z.union([z.date(), z.string()]),
    docTotAmt: z.number("Document Total Amount is required"),
    docTotLocalAmt: z.number("Document Total Local Amount is required"),
    docBalAmt: z.number("Document Balanced Amount is required"),
    docBalLocalAmt: z.number("Document Balanced Local Amount is required"),

    // Allocated Amount Fields
    allocAmt: z.number("Allocated Amount is required"),
    allocLocalAmt: z.number("Allocated Local Amount is required"),
    docAllocAmt: z.number("Document Allocated Amount is required"),
    docAllocLocalAmt: z.number("Document Allocated Local Amount is required"),

    // Exchange and Difference Fields
    centDiff: z.number().min(0, "Cent Difference is required"),

    // Exchange Gain/Loss Fields
    exhGainLoss: z.number().min(0, "Exchange Gain/Loss is required"),

    // Audit Fields
    editVersion: z.number().optional(),
  })
}

export type ApDocsetoffDtSchemaType = z.infer<
  ReturnType<typeof apdocsetoffDtSchema>
>

export const apdocsetoffDtFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type ApDocsetoffDtFiltersValues = z.infer<
  typeof apdocsetoffDtFiltersSchema
>
