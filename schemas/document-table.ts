import { z } from "zod"

export const documentTableRowSchema = z.object({
  documentId: z.string(),
  itemNo: z.number().optional(),
  docTypeId: z.number(),
  docTypeName: z.string(),
  docPath: z.string().optional(),
  documentNo: z.string().optional(),
  remarks: z.string().optional(),
  createDate: z.string().optional(),
  createBy: z.string().optional(),
  editDate: z.string().optional(),
  editBy: z.string().optional(),
})

export const documentTablePropsSchema = z.object({
  data: z.array(documentTableRowSchema),
  isLoading: z.boolean().optional(),
  selectedDocuments: z.array(z.string()).optional(),
  selectAll: z.boolean().optional(),
})

export const documentTableActionsSchema = z.object({
  onPreview: z.function(),
  onDownload: z.function(),
  onDeleteAction: z.function(),
})

export type DocumentTableRowType = z.infer<typeof documentTableRowSchema>
export type DocumentTablePropsType = z.infer<typeof documentTablePropsSchema>
export type DocumentTableActionsType = z.infer<
  typeof documentTableActionsSchema
>
