import { IDocType } from "./lookup"

export interface IDocumentTableRow extends IDocType {
  id: string
  isSelected?: boolean
}

export interface IDocumentTableProps {
  data: IDocType[]
  isLoading?: boolean
  onPreview?: (doc: IDocType) => void
  onDownload?: (doc: IDocType) => void
  onDeleteAction?: (documentId: string) => void
  onSelect?: (documentId: string, checked: boolean) => void
  onSelectAll?: (checked: boolean) => void
  selectedDocuments?: string[]
  selectAll?: boolean
}

export interface IDocumentTableActions {
  onPreview: (doc: IDocType) => void
  onDownload: (doc: IDocType) => void
  onDeleteAction: (documentId: string) => void
}
