// Simplified Notification Types and Interfaces

export interface NotificationPreferences {
  userId: number
  companyId: number
  emailNotifications: boolean
  browserNotifications: boolean
  notificationTypes: {
    documentExpiry: boolean
    taskReminders: boolean
    systemUpdates: boolean
    invoiceAlerts: boolean
    paymentReminders: boolean
    generalAlerts: boolean
  }
  quietHours: {
    enabled: boolean
    startTime: string // HH:mm format
    endTime: string // HH:mm format
    timezone: string
  }
}

export interface NotificationHistory {
  id: string
  userId: number
  companyId: number
  type: NotificationType
  title: string
  body: string
  data?: Record<string, unknown>
  status: NotificationStatus
  readDate?: Date | string
  createdDate: Date | string
  editDate: Date | string
  // Navigation data for opening specific pages
  navigation?: {
    type: "page" | "popup" | "external"
    path?: string // e.g., '/ar/invoice/123', '/ap/invoice/456'
    module?: string // e.g., 'ar', 'ap', 'gl', 'cb'
    recordId?: string // e.g., invoice ID, document ID
    action?: string // e.g., 'view', 'edit', 'approve'
  }
}

export type NotificationType =
  | "document_expiry"
  | "task_reminder"
  | "system_update"
  | "invoice_alert"
  | "payment_reminder"
  | "general_alert"
  | "security_alert"
  | "approval_request"
  | "report_ready"
  | "maintenance_scheduled"

export type NotificationStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "cancelled"

// API Response Types
export interface NotificationApiResponse<T> {
  result: number
  message: string
  data?: T
  error?: string
}

export interface NotificationListResponse {
  notifications: NotificationHistory[]
  totalCount: number
  unreadCount: number
  hasMore: boolean
}

export interface NotificationStats {
  totalNotifications: number
  unreadNotifications: number
  todayNotifications: number
  thisWeekNotifications: number
  thisMonthNotifications: number
}
