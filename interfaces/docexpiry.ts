export interface IDocumentExpiry {
  documentId: number
  companyId: number
  docTypeId: number
  docTypeName: string
  documentName: string
  filePath?: string
  issueDate?: string | Date
  expiryDate: string | Date
  notificationDaysBefore?: number
  isExpired: boolean
  remarks?: string
  createdById?: number
  createdDate?: string | Date
  editById?: number
  editDate?: string | Date
}
