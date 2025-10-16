import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import * as z from "zod"

// ============ DETAIL SCHEMA ============
export const CbBankTransferCtmDtSchema = (
  required: IMandatoryFields,
  visible: IVisibleFields
) => {
  return z.object({
    // Core Fields
    transferId: z.string().optional(),
    transferNo: z.string().optional(),
    itemNo: z.number().min(1, "Item No must be at least 1"),
    seqNo: z.number().optional(),
    // Job Order Fields
    jobOrderId: z.number().optional(),
    jobOrderNo: z.string().optional(),
    taskId: z.number().optional(),
    taskName: z.string().optional(),
    serviceName: z.string().optional(),
    serviceId: z.number().optional(),

    // To Bank Fields
    toBankId: z.number().min(1, "To Bank is required"),
    toBankCode: z.string().optional(),
    toBankName: z.string().optional(),
    toCurrencyId: z.number().min(1, "To Currency is required"),
    toCurrencyCode: z.string().optional(),
    toCurrencyName: z.string().optional(),
    toExhRate: z
      .number()
      .min(0.000001, "To Exchange Rate must be greater than 0"),
    toBankChgGLId: z.number().min(0).optional(),
    toBankChgGLCode: z.string().optional(),
    toBankChgGLName: z.string().optional(),
    toBankChgAmt: z.number().min(0),
    toBankChgLocalAmt: z.number().min(0),
    toTotAmt: z.number().min(0, "To Total Amount is required"),
    toTotLocalAmt: z.number().min(0),

    // Bank Exchange Fields
    bankExhRate: z.number().min(0),
    bankTotAmt: z.number().min(0),
    bankTotLocalAmt: z.number().min(0),

    // Audit Fields
    editVersion: z.number().optional(),
  })
}

export type CbBankTransferCtmDtSchemaType = z.infer<
  ReturnType<typeof CbBankTransferCtmDtSchema>
>

// ============ HEADER SCHEMA ============
export const CbBankTransferCtmHdSchema = (
  required: IMandatoryFields,
  visible: IVisibleFields
) => {
  return z.object({
    // Core Fields
    companyId: z.number().optional(),
    transferId: z.string().optional(),
    transferNo: z.string().optional(),
    referenceNo: required?.m_ReferenceNo
      ? z.string().min(1, "Reference No is required")
      : z.string().optional(),
    trnDate: z.union([z.date(), z.string()]),
    accountDate: z.union([z.date(), z.string()]),

    // Payment Fields
    paymentTypeId: z.number().min(1, "Payment Type is required"),
    chequeNo: z.string().optional().nullable(),
    chequeDate: z.union([z.date(), z.string()]),

    // From Bank Fields
    fromBankId: z.number().min(1, "From Bank is required"),
    fromCurrencyId: z.number().min(1, "From Currency is required"),
    fromExhRate: z
      .number()
      .min(0.000001, "From Exchange Rate must be greater than 0"),
    fromBankChgGLId: z.number().optional(),
    fromBankChgAmt: z.number().min(0),
    fromBankChgLocalAmt: z.number().min(0),
    fromTotAmt: z.number().min(0, "From Total Amount is required"),
    fromTotLocalAmt: z.number().min(0),

    // Additional Fields
    remarks: required?.m_Remarks_Hd
      ? z.string().min(3, "Remarks must be at least 3 characters")
      : z.string().optional(),
    payeeTo: z.string().optional(),
    exhGainLoss: z.number(),
    moduleFrom: z.string().optional(),

    // Audit Fields
    createBy: z.string().optional(),
    createDate: z.union([z.date(), z.string()]).optional(),
    editBy: z.string().optional().nullable(),
    editDate: z.union([z.date(), z.null()]).optional(),
    editVersion: z.number().optional(),
    isCancel: z.boolean().optional(),
    cancelBy: z.string().optional().nullable(),
    cancelDate: z.union([z.date(), z.null()]).optional(),
    cancelRemarks: z.string().optional().nullable(),
    isPost: z.boolean().optional().nullable(),
    postBy: z.string().optional().nullable(),
    postDate: z.union([z.date(), z.null()]).optional(),
    appStatusId: z.number().optional().nullable(),
    appBy: z.string().optional().nullable(),
    appDate: z.union([z.date(), z.null()]).optional(),

    // Detail Items
    data_details: z
      .array(z.lazy(() => CbBankTransferCtmDtSchema(required, visible)))
      .optional(),
  })
}

export type CbBankTransferCtmHdSchemaType = z.infer<
  ReturnType<typeof CbBankTransferCtmHdSchema>
>

// ============ FILTERS SCHEMA ============
export const CbBankTransferCtmFiltersSchema = z.object({
  startDate: z.union([z.date(), z.string()]),
  endDate: z.union([z.date(), z.string()]),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  sortBy: z.string().optional(),
  pageNumber: z.number().optional(),
  pageSize: z.number().optional(),
})

export type CbBankTransferCtmFiltersValues = z.infer<
  typeof CbBankTransferCtmFiltersSchema
>
