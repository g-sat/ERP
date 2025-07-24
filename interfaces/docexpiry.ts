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

export enum NotificationDays {
  FIFTEEN_DAYS = 15,
  THIRTY_DAYS = 30,
  FORTY_FIVE_DAYS = 45,
  SIXTY_DAYS = 60,
}

export const NOTIFICATION_DAYS_OPTIONS = [
  { value: NotificationDays.FIFTEEN_DAYS, label: "15 days" },
  { value: NotificationDays.THIRTY_DAYS, label: "30 days" },
  { value: NotificationDays.FORTY_FIVE_DAYS, label: "45 days" },
  { value: NotificationDays.SIXTY_DAYS, label: "60 days" },
]
