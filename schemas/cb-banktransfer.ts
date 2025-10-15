import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import * as z from "zod"

export const CbBankTransferSchema = (
  required: IMandatoryFields,
  visible: IVisibleFields
) => {
  return z.object({
    // Core Fields
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

    // Job Order Fields
    jobOrderId:
      required?.m_JobOrderId && visible?.m_JobOrderId
        ? z.number().min(1, "Job Order is required")
        : z.number().optional(),
    jobOrderNo: z.string().optional().nullable(),
    taskId:
      required?.m_JobOrderId && visible?.m_JobOrderId
        ? z.number().min(1, "Task is required")
        : z.number().optional(),
    taskName: z.string().optional().nullable(),
    serviceName: z.string().optional().nullable(),
    serviceId:
      required?.m_JobOrderId && visible?.m_JobOrderId
        ? z.number().min(1, "Service is required")
        : z.number().optional(),

    // From Bank Fields
    fromBankId: z.number().min(1, "From Bank is required"),
    fromCurrencyId: z.number().min(1, "From Currency is required"),
    fromExhRate: z
      .number()
      .min(0.000001, "From Exchange Rate must be greater than 0"),
    fromBankChgGLId: z.number().min(1, "From Bank Charge GL is required"),
    fromBankChgAmt: z.number().min(0),
    fromBankChgLocalAmt: z.number().min(0),
    fromTotAmt: z.number().min(0, "From Total Amount is required"),
    fromTotLocalAmt: z.number().min(0),

    // To Bank Fields
    toBankId: z.number().min(1, "To Bank is required"),
    toCurrencyId: z.number().min(1, "To Currency is required"),
    toExhRate: z
      .number()
      .min(0.000001, "To Exchange Rate must be greater than 0"),
    toBankChgGLId: z.number().min(1, "To Bank Charge GL is required"),
    toBankChgAmt: z.number().min(0),
    toBankChgLocalAmt: z.number().min(0),
    toTotAmt: z.number().min(0, "To Total Amount is required"),
    toTotLocalAmt: z.number().min(0),

    // Bank Exchange Fields
    bankExhRate: z.number().min(0),
    bankTotAmt: z.number().min(0),
    bankTotLocalAmt: z.number().min(0),

    // Additional Fields
    remarks: required?.m_Remarks
      ? z.string().min(3, "Remarks must be at least 3 characters")
      : z.string().optional(),
    payeeTo: z.string().min(1, "Payee To is required"),
    exhGainLoss: z.number(),
    moduleFrom: z.string().optional(),

    // Audit Fields
    createBy: z.string().optional(),
    createDate: z.union([z.date(), z.string()]).optional(),
    editBy: z.string().optional(),
    editDate: z.union([z.date(), z.null()]).optional(),
    editVersion: z.number().optional(),
    isCancel: z.boolean().optional(),
    cancelBy: z.string().optional(),
    cancelDate: z.union([z.date(), z.null()]).optional(),
    cancelRemarks: z.string().optional().nullable(),
    isPost: z.boolean().optional().nullable(),
    postBy: z.string().optional(),
    postDate: z.union([z.date(), z.null()]).optional(),
    appStatusId: z.number().optional().nullable(),
    appBy: z.string().optional(),
    appDate: z.union([z.date(), z.null()]).optional(),
  })
}

export type CbBankTransferSchemaType = z.infer<
  ReturnType<typeof CbBankTransferSchema>
>

export const CbBankTransferFiltersSchema = z.object({
  startDate: z.union([z.date(), z.string()]),
  endDate: z.union([z.date(), z.string()]),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  sortBy: z.string().optional(),
  pageNumber: z.number().optional(),
  pageSize: z.number().optional(),
})

export type CbBankTransferFiltersValues = z.infer<
  typeof CbBankTransferFiltersSchema
>
