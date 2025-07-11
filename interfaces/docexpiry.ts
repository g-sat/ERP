export interface DocumentExpiry {
  id: string
  documentType: string
  documentNumber: string
  issuedDate: Date
  expiryDate: Date
  entityName: string
  entityType: "customer" | "customer" | "employee" | "company" | "other"
  reminderDays: number
  status: "valid" | "expiring" | "expired"
  attachmentPath?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface DocumentExpiryFormValues {
  documentType: string
  documentNumber: string
  issuedDate: Date
  expiryDate: Date
  entityName: string
  entityType: "customer" | "customer" | "employee" | "company" | "other"
  reminderDays: number
  attachmentPath?: string
  notes?: string
}

export interface DocumentExpiryFilterValues {
  documentType?: string
  entityType?: string
  status?: string
  expiryDateFrom?: Date
  expiryDateTo?: Date
  entityName?: string
}
