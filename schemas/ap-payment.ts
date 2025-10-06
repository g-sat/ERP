import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import * as z from "zod"

export const appaymentHdSchema = (
  required: IMandatoryFields,
  visible: IVisibleFields
) => {
  return z.object({
    // Core Fields
    companyId: z.number().min(1),
    paymentId: z.number().optional(),
    paymentNo: z.string().optional(),
    referenceNo: z.string().min(1),
    trnDate: z.union([z.date(), z.string()]),
    accountDate: z.union([z.date(), z.string()]),

    // Bank and Payment Fields
    bankId: z.number().min(1),
    paymentTypeId: z.number().min(1),
    chequeNo: z.string().nullable().optional(),
    chequeDate: z.union([z.date(), z.string()]),

    // Bank Charges
    bankChargeGLId: z.number().min(0),
    bankChargesAmt: z.number().min(0),
    bankChargesLocalAmt: z.number().min(0),

    // Supplier
    supplierId: z.number().min(1),

    // Currency and Exchange Rates
    currencyId: z.number().min(1),
    exhRate: z.number().min(0),
    payCurrencyId: z.number().min(1),
    payExhRate: z.number().min(0),
    docExhRate: z.number().min(0),

    // Amounts
    totAmt: z.number().min(0),
    totLocalAmt: z.number().min(0),
    payTotAmt: z.number().min(0),
    payTotLocalAmt: z.number().min(0),

    // Allocation Amounts
    unAllocTotAmt: z.number().min(0),
    unAllocTotLocalAmt: z.number().min(0),
    allocTotAmt: z.number().nullable().optional(),
    allocTotLocalAmt: z.number().nullable().optional(),

    // Document Amounts
    docTotAmt: z.number().min(0),
    docTotLocalAmt: z.number().min(0),

    // Exchange Gain/Loss
    exhGainLoss: z.number(),

    // Remarks
    remarks: z.string().nullable().optional(),

    // Module
    moduleFrom: z.string().min(1),

    // Audit Fields
    createById: z.number().min(1),
    createDate: z.union([z.date(), z.string()]),
    editById: z.number().nullable().optional(),
    editDate: z.union([z.date(), z.string()]).nullable().optional(),
    editVersion: z.number().min(0),
    isCancel: z.boolean(),
    cancelById: z.number().nullable().optional(),
    cancelDate: z.union([z.date(), z.string()]).nullable().optional(),
    cancelRemarks: z.string().nullable().optional(),

    // Posting Fields
    isPost: z.boolean().nullable().optional(),
    postById: z.number().nullable().optional(),
    postDate: z.union([z.date(), z.string()]).nullable().optional(),

    // Approval Fields
    appStatusId: z.number().nullable().optional(),
    appById: z.number().nullable().optional(),
    appDate: z.union([z.date(), z.string()]).nullable().optional(),

    // Nested Details
    data_details: z.array(appaymentDtSchema(required, visible)).min(1),
  })
}

export type ApPaymentHdSchemaType = z.infer<
  ReturnType<typeof appaymentHdSchema>
>

export const appaymentHdFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  startDate: z.union([z.date(), z.string()]).optional(),
  endDate: z.union([z.date(), z.string()]).optional(),
})

export type ApPaymentHdFiltersValues = z.infer<typeof appaymentHdFiltersSchema>

export const appaymentDtSchema = (
  _required: IMandatoryFields,
  _visible: IVisibleFields
) => {
  return z.object({
    // Core Fields
    companyId: z.number().min(1),
    paymentId: z.number().min(0),
    paymentNo: z.string().min(1),
    itemNo: z.number().min(1),
    transactionId: z.number().min(1),
    documentId: z.number().min(0),
    documentNo: z.string().min(1),
    referenceNo: z.string().min(1),

    // Currency Fields
    docCurrencyId: z.number().min(0),
    docExhRate: z.number().min(0),

    // Document Dates
    docAccountDate: z.union([z.date(), z.string()]),
    docDueDate: z.union([z.date(), z.string()]),

    // Document Amounts
    docTotAmt: z.number().min(0),
    docTotLocalAmt: z.number().min(0),
    docBalAmt: z.number().min(0),
    docBalLocalAmt: z.number().min(0),

    // Allocation Amounts
    allocAmt: z.number().min(0),
    allocLocalAmt: z.number().min(0),
    docAllocAmt: z.number().min(0),
    docAllocLocalAmt: z.number().min(0),

    // Exchange Fields
    centDiff: z.number(),
    exhGainLoss: z.number(),

    // Audit Fields
    editVersion: z.number().min(0),
  })
}

export type ApPaymentDtSchemaType = z.infer<
  ReturnType<typeof appaymentDtSchema>
>

export const appaymentDtFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type ApPaymentDtFiltersValues = z.infer<typeof appaymentDtFiltersSchema>
