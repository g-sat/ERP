import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import * as z from "zod"

export const glcontraHdSchema = (
  required: IMandatoryFields,
  visible: IVisibleFields
) => {
  return z.object({
    // Core Fields
    contraId: z.string().optional(),
    contraNo: z.string().optional(),
    referenceNo: z.string().min(1),
    trnDate: z.union([z.date(), z.string()]),
    accountDate: z.union([z.date(), z.string()]),
    supplierId: z.number().min(1),
    customerId: z.number().min(1),

    // Currency Fields
    currencyId: z.number().min(1),
    exhRate: z.number().min(0),

    // Amounts
    totAmt: required?.m_TotAmt
      ? z.number().min(0)
      : z.union([z.number(), z.null()]).optional(),
    totLocalAmt: z.number().min(0),
    exhGainLoss: z.number(),

    // Module and Remarks
    moduleFrom: z.string().min(1),
    remarks: required?.m_Remarks_Hd ? z.string().min(3) : z.string().optional(),

    // Audit Fields
    createById: z.number().min(1),
    createDate: z.union([z.date(), z.string()]),
    editVer: z.number().min(0),
    editById: z.union([z.number(), z.null()]).optional(),
    editDate: z.union([z.date(), z.string(), z.null()]).optional(),
    editVersion: z.number().min(0),
    isCancel: z.boolean(),
    cancelById: z.union([z.number(), z.null()]).optional(),
    cancelDate: z.union([z.date(), z.string(), z.null()]).optional(),
    cancelRemarks: z.union([z.string(), z.null()]).optional(),

    // Posting Fields
    isPost: z.union([z.boolean(), z.null()]).optional(),
    postById: z.union([z.number(), z.null()]).optional(),
    postDate: z.union([z.date(), z.string(), z.null()]).optional(),

    // Approval Fields
    appStatusId: z.union([z.number(), z.null()]).optional(),
    appById: z.union([z.number(), z.null()]).optional(),
    appDate: z.union([z.date(), z.string(), z.null()]).optional(),

    // Nested Details
    data_details: z.array(glcontraDtSchema(required, visible)).min(1),
  })
}

export type GLContraHdSchemaType = z.infer<ReturnType<typeof glcontraHdSchema>>

export const glcontraHdFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type GLContraHdFiltersValues = z.infer<typeof glcontraHdFiltersSchema>

export const glcontraDtSchema = (
  _required: IMandatoryFields,
  _visible: IVisibleFields
) => {
  return z.object({
    // Core Fields
    companyId: z.number().min(1),
    contraId: z.number(),
    contraNo: z.string(),
    itemNo: z.number().min(0),
    moduleId: z.number().min(1),
    transactionId: z.number().min(1),
    documentId: z.number().min(0),
    documentNo: z.string().min(1),

    // Document Currency Fields
    docCurrencyId: z.number().min(1),
    docExhRate: z.number().min(0),

    // Document Details
    referenceNo: z.string().min(1),
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

    // Exchange and Difference Fields
    centDiff: z.number(),
    exhGainLoss: z.number(),

    // Audit Fields
    editVersion: z.number().min(0),
  })
}

export type GLContraDtSchemaType = z.infer<ReturnType<typeof glcontraDtSchema>>

export const glcontraDtFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type GLContraDtFiltersValues = z.infer<typeof glcontraDtFiltersSchema>
