"use client"

import { NotificationPreferencesTable } from "../components/notification-preferences-table"

export default function AdminNotificationPreferencesPage() {
  return (
    <div className="container mx-auto space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
          Notification Preferences
        </h1>
        <p className="text-muted-foreground text-sm">
          Configure notification preferences
        </p>
      </div>
      <NotificationPreferencesTable />
    </div>
  )
}
