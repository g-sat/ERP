import * as z from "zod"

export const apOutTransactionSchema = () => {
  return z.object({
    // Core Fields
    companyId: z.number().min(1, "Company is required"),
    transactionId: z.number().min(1, "Transaction is required"),
    documentId: z.number().min(1, "Document is required"),
    documentNo: z.string().min(1, "Document No is required"),
    referenceNo: z.string().optional(),

    // Date Fields
    accountDate: z.union([z.date(), z.string()]),
    dueDate: z.union([z.date(), z.string()]),

    // Supplier Fields
    supplierId: z.number().min(1, "Supplier is required"),
    supplierCode: z.union([z.string(), z.number(), z.null()]).optional(),
    supplierName: z.string().nullable().optional(),

    // Currency Fields
    currencyId: z.number().min(1, "Currency is required"),
    currencyCode: z.string().nullable().optional(),
    currencyName: z.string().nullable().optional(),
    exhRate: z.number().min(0.000001, "Exchange Rate must be greater than 0"),

    // Amount Fields
    totAmt: z.number().min(0, "Total Amount is required"),
    totLocalAmt: z.number().min(0, "Total Local Amount is required"),
    balAmt: z.number().min(0, "Balance Amount is required"),
    balLocalAmt: z.number().min(0, "Balance Local Amount is required"),

    // Remarks
    remarks: z.string().optional(),

    // Audit Fields
    createById: z.number().optional(),
    createDate: z.union([z.date(), z.string()]).optional(),
    createBy: z.string().optional(),
  })
}

export type ApOutTransactionSchemaType = z.infer<
  ReturnType<typeof apOutTransactionSchema>
>

export const apOutTransactionFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type ApOutTransactionFiltersValues = z.infer<
  typeof apOutTransactionFiltersSchema
>
