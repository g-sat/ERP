import { useCallback, useEffect } from "react"
import { useAuthStore } from "@/stores/auth-store"
import { useNotificationStore } from "@/stores/notification-store"
import { toast } from "sonner"

export function useNotifications() {
  const {
    // State
    isLoading,
    error,
    notifications,
    unreadCount,
    totalCount,
    preferences,
    stats,

    // Actions
    initialize,
    updatePreferences,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    fetchStats,
    addNotification,
    updateNotification,
    removeNotification,
    setError,
  } = useNotificationStore()

  const { user, currentCompany } = useAuthStore()

  // Initialize notifications when user is authenticated
  useEffect(() => {
    if (user && currentCompany) {
      initialize().catch((error) => {
        console.error("Failed to initialize notifications:", error)
        toast.error("Failed to initialize notifications")
      })
    }
  }, [user, currentCompany, initialize])

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error)
      setError(null)
    }
  }, [error, setError])

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (user && currentCompany) {
      fetchNotifications()
      fetchStats()
    }
  }, [user, currentCompany, fetchNotifications, fetchStats])

  // Mark notification as read and handle navigation
  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      const notification = notifications.find((n) => n.id === notificationId)
      if (!notification) return

      // Mark as read first
      await markAsRead(notificationId)

      // Handle navigation based on notification data
      if (notification.navigation) {
        const { type, path, module, recordId } = notification.navigation

        if (type === "page" && path) {
          // Navigate to specific page
          window.open(path, "_blank")
        } else if (type === "popup") {
          // Show popup with notification details
          toast.info(notification.body, {
            description: notification.title,
            duration: 5000,
          })
        } else if (module && recordId) {
          // Construct path based on module and record ID
          const modulePath = `/${module}`
          const fullPath = `${modulePath}/${recordId}`
          window.open(fullPath, "_blank")
        }
      } else {
        // Default behavior - show popup for information notifications
        toast.info(notification.body, {
          description: notification.title,
          duration: 5000,
        })
      }
    },
    [notifications, markAsRead]
  )

  // Mark all notifications as read
  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead()
    toast.success("All notifications marked as read")
  }, [markAllAsRead])

  // Delete notification
  const handleDeleteNotification = useCallback(
    async (notificationId: string) => {
      await deleteNotification(notificationId)
      toast.success("Notification deleted")
    },
    [deleteNotification]
  )

  // Clear all notifications
  const handleClearAllNotifications = useCallback(async () => {
    await clearAllNotifications()
    toast.success("All notifications cleared")
  }, [clearAllNotifications])

  // Update notification preferences
  const handleUpdatePreferences = useCallback(
    async (updates: Partial<NonNullable<typeof preferences>>) => {
      await updatePreferences(updates)
      toast.success("Notification preferences updated")
    },
    [updatePreferences, preferences]
  )

  // Send test notification
  const sendTestNotification = useCallback(async () => {
    if (!user || !currentCompany) {
      toast.error("User not authenticated")
      return
    }

    try {
      const response = await fetch(
        "/api/proxy/notifications/savenotification",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Test Notification",
            body: "This is a test notification from your ERP system",
            type: "general_alert",
            data: { test: true },
            userId: user.userId,
            companyId: currentCompany.companyId,
          }),
        }
      )

      const data = await response.json()
      if (data.result === 1) {
        toast.success("Test notification sent")
        // Refresh notifications to show the new test notification
        await fetchNotifications()
      } else {
        toast.error("Failed to send test notification")
      }
    } catch (error) {
      console.error("Error sending test notification:", error)
      toast.error("Failed to send test notification")
    }
  }, [user, currentCompany, fetchNotifications])

  return {
    // State
    isLoading,
    error,
    notifications,
    unreadCount,
    totalCount,
    preferences,
    stats,

    // Actions
    updatePreferences: handleUpdatePreferences,
    fetchNotifications,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDeleteNotification,
    clearAllNotifications: handleClearAllNotifications,
    fetchStats,
    addNotification,
    updateNotification,
    removeNotification,
    sendTestNotification,
  }
}
