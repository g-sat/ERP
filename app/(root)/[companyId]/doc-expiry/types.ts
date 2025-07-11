export interface Document {
  id: number
  name: string
  expiryDate: Date
  status: string
  category: string
  priority: string
  tags: string[]
  notes: string[]
  description: string
  renewalProcess: string
  lastRenewed: Date
  reminderSettings: {
    enabled: boolean
    daysBeforeExpiry: number
    notifyByEmail: boolean
  }
  history: {
    date: Date
    action: string
    details: string
  }[]
}
