export interface IDocumentExpiry {
  documentId?: number
  docTypeId: number
  documentName: string
  filePath?: string
  issueDate?: string | Date
  expiryDate: string | Date
  notificationDaysBefore?: number
  isExpired?: boolean
  remarks?: string
  companyId?: number
  docTypeName?: string
  createdDate?: string | Date
  editDate?: string | Date
}

export const NOTIFICATION_DAYS_OPTIONS = [
  { value: 0, label: "No notification" },
  { value: 7, label: "7 days before" },
  { value: 15, label: "15 days before" },
  { value: 30, label: "30 days before" },
  { value: 45, label: "45 days before" },
  { value: 60, label: "60 days before" },
  { value: 90, label: "90 days before" },
]
