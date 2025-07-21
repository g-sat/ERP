import {
  NotificationHistory,
  NotificationPreferences,
  NotificationStats,
} from "@/interfaces/notification"
import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

import { getData, saveData } from "@/lib/api-client"

interface NotificationState {
  // State
  isLoading: boolean
  error: string | null

  // Notifications
  notifications: NotificationHistory[]
  unreadCount: number
  totalCount: number

  // Settings
  preferences: NotificationPreferences | null

  // Stats
  stats: NotificationStats | null

  // Actions
  initialize: () => Promise<void>
  isInitialized: () => boolean
  reset: () => void
  getApiStatus: () => {
    preferences: boolean
    notifications: boolean
    stats: boolean
  }
  updatePreferences: (
    preferences: Partial<NotificationPreferences>
  ) => Promise<void>

  // Notification Management
  fetchNotifications: (pageNumber?: number, pageSize?: number) => Promise<void>
  getNotificationById: (
    notificationId: string
  ) => Promise<NotificationHistory | null>
  saveNotification: (
    notification: Partial<NotificationHistory>
  ) => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  clearAllNotifications: () => Promise<void>

  // Stats
  fetchStats: () => Promise<void>

  // Local State Updates
  addNotification: (notification: NotificationHistory) => void
  updateNotification: (
    notificationId: string,
    updates: Partial<NotificationHistory>
  ) => void
  removeNotification: (notificationId: string) => void
  setUnreadCount: (count: number) => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void

  // Helper methods
  loadPreferences: () => Promise<void>
  savePreferences: (preferences: NotificationPreferences) => Promise<void>

  // Debug methods
  testApi: (
    apiName: "preferences" | "notifications" | "stats"
  ) => Promise<boolean>
}

// Default preferences - will be overridden by backend data
const defaultPreferences: NotificationPreferences = {
  userId: 0,
  companyId: 0,
  emailNotifications: true,
  browserNotifications: true,
  notificationTypes: {
    documentExpiry: true,
    taskReminders: true,
    systemUpdates: true,
    invoiceAlerts: true,
    paymentReminders: true,
    generalAlerts: true,
  },
  quietHours: {
    enabled: false,
    startTime: "22:00",
    endTime: "08:00",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        isLoading: false,
        error: null,
        notifications: [],
        unreadCount: 0,
        totalCount: 0,
        preferences: null,
        stats: null,

        // Initialize notification system with optimized loading order
        initialize: async () => {
          console.log(
            "🔔 [NotificationStore] Initializing notification system..."
          )
          set({ isLoading: true, error: null })

          try {
            // Step 1: Load preferences first (critical for UI rendering)
            console.log("📋 [NotificationStore] Step 1: Loading preferences...")
            try {
              await get().loadPreferences()
              console.log(
                "✅ [NotificationStore] Preferences loaded successfully"
              )
            } catch (error) {
              console.error(
                "❌ [NotificationStore] Step 1 FAILED - Preferences API Error:",
                error
              )
              throw new Error(
                `Preferences API failed: ${error instanceof Error ? error.message : "Unknown error"}`
              )
            }

            // Step 2: Load notifications (most important for user experience)
            console.log(
              "📬 [NotificationStore] Step 2: Loading notifications..."
            )
            try {
              await get().fetchNotifications()
              console.log(
                "✅ [NotificationStore] Notifications loaded successfully"
              )
            } catch (error) {
              console.error(
                "❌ [NotificationStore] Step 2 FAILED - Notifications API Error:",
                error
              )
              throw new Error(
                `Notifications API failed: ${error instanceof Error ? error.message : "Unknown error"}`
              )
            }

            // Step 3: Load stats (less critical, can be loaded last)
            console.log("📊 [NotificationStore] Step 3: Loading stats...")
            try {
              await get().fetchStats()
              console.log("✅ [NotificationStore] Stats loaded successfully")
            } catch (error) {
              console.error(
                "❌ [NotificationStore] Step 3 FAILED - Stats API Error:",
                error
              )
              throw new Error(
                `Stats API failed: ${error instanceof Error ? error.message : "Unknown error"}`
              )
            }

            console.log(
              "✅ [NotificationStore] Initialization completed successfully"
            )
          } catch (error) {
            console.error(
              "❌ [NotificationStore] Initialization failed:",
              error
            )
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to initialize notifications",
            })
          } finally {
            set({ isLoading: false })
          }
        },

        // Check if store is initialized
        isInitialized: () => {
          const state = get()
          return state.preferences !== null && state.notifications.length >= 0
        },

        // Reset store to initial state
        reset: () => {
          console.log("🔄 [NotificationStore] Resetting store to initial state")
          set({
            isLoading: false,
            error: null,
            notifications: [],
            unreadCount: 0,
            totalCount: 0,
            preferences: null,
            stats: null,
          })
        },

        // Get API status for debugging
        getApiStatus: () => {
          const state = get()
          return {
            preferences: state.preferences !== null,
            notifications:
              state.notifications.length > 0 || state.totalCount > 0,
            stats: state.stats !== null,
          }
        },

        // Test individual API endpoints
        testApi: async (apiName: "preferences" | "notifications" | "stats") => {
          console.log(`🧪 [NotificationStore] Testing ${apiName} API...`)
          try {
            switch (apiName) {
              case "preferences":
                await get().loadPreferences()
                break
              case "notifications":
                await get().fetchNotifications()
                break
              case "stats":
                await get().fetchStats()
                break
            }
            console.log(`✅ [NotificationStore] ${apiName} API test PASSED`)
            return true
          } catch (error) {
            console.error(
              `❌ [NotificationStore] ${apiName} API test FAILED:`,
              error
            )
            return false
          }
        },

        // Update notification preferences
        updatePreferences: async (
          updates: Partial<NotificationPreferences>
        ) => {
          console.log("🔔 [NotificationStore] Updating preferences:", updates)
          set({ isLoading: true, error: null })

          try {
            const currentPreferences = get().preferences || defaultPreferences
            const newPreferences = { ...currentPreferences, ...updates }
            console.log(
              "📝 [NotificationStore] New preferences to save:",
              newPreferences
            )

            // Save to server
            await get().savePreferences(newPreferences)

            set({ preferences: newPreferences })
            console.log(
              "✅ [NotificationStore] Preferences updated successfully"
            )
          } catch (error) {
            console.error(
              "❌ [NotificationStore] Failed to update preferences:",
              error
            )
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to update preferences",
            })
          } finally {
            set({ isLoading: false })
          }
        },

        // Fetch notifications
        fetchNotifications: async (pageNumber = 1, pageSize = 20) => {
          console.log(
            `🔔 [NotificationStore] Fetching notifications - Page: ${pageNumber}, Size: ${pageSize}`
          )

          // Only set loading if not already loading (to avoid conflicts during initialization)
          if (!get().isLoading) {
            set({ isLoading: true, error: null })
          }

          try {
            const endpoint = `notifications/getnotifications?pageNumber=${pageNumber}&pageSize=${pageSize}`
            console.log("🌐 [NotificationStore] API Endpoint:", endpoint)

            const response = await getData(endpoint)
            console.log("📡 [NotificationStore] API Response:", response)

            // Handle the expected response format: { result: 1, message: "Success", data: [...], totalRecords: 0 }
            if (response.result === 1) {
              console.log(
                "📊 [NotificationStore] Raw notifications data:",
                response.data
              )

              // Ensure data is an array
              const notificationsArray = Array.isArray(response.data)
                ? response.data
                : []

              // Convert string dates back to Date objects
              const notificationsWithDates = notificationsArray.map(
                (notification: Record<string, unknown>) => ({
                  ...notification,
                  createdDate: new Date(notification.createdDate as string),
                  updatedDate: new Date(notification.updatedDate as string),
                  readDate: notification.readDate
                    ? new Date(notification.readDate as string)
                    : undefined,
                })
              )

              console.log(
                "📅 [NotificationStore] Processed notifications:",
                notificationsWithDates
              )

              // Extract counts from response or use defaults
              const totalCount =
                response.totalRecords || notificationsArray.length || 0
              const unreadCount = notificationsWithDates.filter(
                (n: NotificationHistory) => n.status === "delivered"
              ).length

              set({
                notifications: notificationsWithDates,
                totalCount: totalCount,
                unreadCount: unreadCount,
              })

              console.log(
                "✅ [NotificationStore] Notifications fetched successfully"
              )
              console.log(
                "📈 [NotificationStore] Stats - Total:",
                totalCount,
                "Unread:",
                unreadCount
              )
            } else {
              const errorMessage =
                response.message || "Failed to fetch notifications"
              console.error(
                "❌ [NotificationStore] API returned error:",
                errorMessage
              )
              throw new Error(errorMessage)
            }
          } catch (error) {
            console.error(
              "❌ [NotificationStore] Failed to fetch notifications:",
              error
            )
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to fetch notifications",
            })
          } finally {
            set({ isLoading: false })
          }
        },

        // Get notification by ID
        getNotificationById: async (notificationId: string) => {
          console.log(
            `🔔 [NotificationStore] Getting notification by ID: ${notificationId}`
          )
          try {
            const endpoint = `notifications/getnotificationbyid?notificationId=${notificationId}`
            console.log("🌐 [NotificationStore] API Endpoint:", endpoint)

            const response = await getData(endpoint)
            console.log("📡 [NotificationStore] API Response:", response)

            if (response.result === 1) {
              console.log(
                "📊 [NotificationStore] Raw notification data:",
                response.data
              )

              const notification = response.data
              // Convert string dates back to Date objects
              const processedNotification = {
                ...notification,
                createdDate: new Date(notification.createdDate as string),
                updatedDate: new Date(notification.updatedDate as string),
                readDate: notification.readDate
                  ? new Date(notification.readDate as string)
                  : undefined,
              } as NotificationHistory

              console.log(
                "📅 [NotificationStore] Processed notification:",
                processedNotification
              )
              console.log(
                "✅ [NotificationStore] Notification fetched successfully"
              )

              return processedNotification
            } else {
              const errorMessage =
                response.message || "Failed to fetch notification"
              console.error(
                "❌ [NotificationStore] API returned error:",
                errorMessage
              )
              throw new Error(errorMessage)
            }
          } catch (error) {
            console.error(
              "❌ [NotificationStore] Failed to get notification by ID:",
              error
            )
            return null
          }
        },

        // Save notification
        saveNotification: async (
          notification: Partial<NotificationHistory>
        ) => {
          console.log(
            "🔔 [NotificationStore] Saving notification:",
            notification
          )
          try {
            const endpoint = `notifications/savenotification`
            console.log("🌐 [NotificationStore] API Endpoint:", endpoint)

            const response = await saveData(endpoint, notification)
            console.log("📡 [NotificationStore] API Response:", response)

            if (response.result === 1) {
              console.log(
                "✅ [NotificationStore] Notification saved successfully"
              )
              // If successful, refresh the notifications list
              await get().fetchNotifications()
            } else {
              const errorMessage =
                response.message || "Failed to save notification"
              console.error(
                "❌ [NotificationStore] API returned error:",
                errorMessage
              )
              throw new Error(errorMessage)
            }
          } catch (error) {
            console.error(
              "❌ [NotificationStore] Failed to save notification:",
              error
            )
            throw error
          }
        },

        // Mark notification as read
        markAsRead: async (notificationId: string) => {
          console.log(
            `🔔 [NotificationStore] Marking notification as read: ${notificationId}`
          )
          try {
            const endpoint = `notifications/markread`
            const payload = { notificationId }
            console.log("🌐 [NotificationStore] API Endpoint:", endpoint)
            console.log("📤 [NotificationStore] Request payload:", payload)

            const response = await saveData(endpoint, payload)
            console.log("📡 [NotificationStore] API Response:", response)

            if (response.result === 1) {
              console.log(
                "✅ [NotificationStore] Notification marked as read successfully"
              )
              get().updateNotification(notificationId, {
                status: "read",
                readDate: new Date(),
              })
              get().setUnreadCount(Math.max(0, get().unreadCount - 1))
            } else {
              const errorMessage =
                response.message || "Failed to mark notification as read"
              console.error(
                "❌ [NotificationStore] API returned error:",
                errorMessage
              )
            }
          } catch (error) {
            console.error(
              "❌ [NotificationStore] Failed to mark notification as read:",
              error
            )
          }
        },

        // Mark all notifications as read
        markAllAsRead: async () => {
          console.log(
            "🔔 [NotificationStore] Marking all notifications as read"
          )
          try {
            const endpoint = `notifications/markallread`
            console.log("🌐 [NotificationStore] API Endpoint:", endpoint)

            const response = await saveData(endpoint, {})
            console.log("📡 [NotificationStore] API Response:", response)

            if (response.result === 1) {
              console.log(
                "✅ [NotificationStore] All notifications marked as read successfully"
              )
              const updatedNotifications = get().notifications.map(
                (notification) => ({
                  ...notification,
                  status: "read" as const,
                  readDate: new Date(),
                })
              )

              set({
                notifications: updatedNotifications,
                unreadCount: 0,
              })
            } else {
              const errorMessage =
                response.message || "Failed to mark all notifications as read"
              console.error(
                "❌ [NotificationStore] API returned error:",
                errorMessage
              )
            }
          } catch (error) {
            console.error(
              "❌ [NotificationStore] Failed to mark all notifications as read:",
              error
            )
          }
        },

        // Delete notification
        deleteNotification: async (notificationId: string) => {
          console.log(
            `🔔 [NotificationStore] Deleting notification: ${notificationId}`
          )
          try {
            const endpoint = `notifications/delete`
            const payload = { notificationId }
            console.log("🌐 [NotificationStore] API Endpoint:", endpoint)
            console.log("📤 [NotificationStore] Request payload:", payload)

            const response = await saveData(endpoint, payload)
            console.log("📡 [NotificationStore] API Response:", response)

            if (response.result === 1) {
              console.log(
                "✅ [NotificationStore] Notification deleted successfully"
              )
              get().removeNotification(notificationId)
            } else {
              const errorMessage =
                response.message || "Failed to delete notification"
              console.error(
                "❌ [NotificationStore] API returned error:",
                errorMessage
              )
            }
          } catch (error) {
            console.error(
              "❌ [NotificationStore] Failed to delete notification:",
              error
            )
          }
        },

        // Clear all notifications
        clearAllNotifications: async () => {
          console.log("🔔 [NotificationStore] Clearing all notifications")
          try {
            const endpoint = `notifications/clearall`
            console.log("🌐 [NotificationStore] API Endpoint:", endpoint)

            const response = await saveData(endpoint, {})
            console.log("📡 [NotificationStore] API Response:", response)

            if (response.result === 1) {
              console.log(
                "✅ [NotificationStore] All notifications cleared successfully"
              )
              set({
                notifications: [],
                unreadCount: 0,
                totalCount: 0,
              })
            } else {
              const errorMessage =
                response.message || "Failed to clear all notifications"
              console.error(
                "❌ [NotificationStore] API returned error:",
                errorMessage
              )
            }
          } catch (error) {
            console.error(
              "❌ [NotificationStore] Failed to clear all notifications:",
              error
            )
          }
        },

        // Fetch notification stats
        fetchStats: async () => {
          console.log("🔔 [NotificationStore] Fetching notification stats")
          try {
            const endpoint = `notifications/stats`
            console.log("🌐 [NotificationStore] API Endpoint:", endpoint)

            const response = await getData(endpoint)
            console.log("📡 [NotificationStore] API Response:", response)

            if (response.result === 1) {
              console.log("📊 [NotificationStore] Stats data:", response.data)
              set({ stats: response.data })
              console.log("✅ [NotificationStore] Stats fetched successfully")
            } else {
              const errorMessage =
                response.message || "Failed to fetch notification stats"
              console.error(
                "❌ [NotificationStore] API returned error:",
                errorMessage
              )
            }
          } catch (error) {
            console.error(
              "❌ [NotificationStore] Failed to fetch notification stats:",
              error
            )
          }
        },

        // Local state updates
        addNotification: (notification: NotificationHistory) => {
          console.log(
            "🔔 [NotificationStore] Adding notification locally:",
            notification
          )
          set((state) => ({
            notifications: [notification, ...state.notifications],
            totalCount: state.totalCount + 1,
            unreadCount:
              state.unreadCount + (notification.status === "delivered" ? 1 : 0),
          }))
        },

        updateNotification: (
          notificationId: string,
          updates: Partial<NotificationHistory>
        ) => {
          console.log(
            `🔔 [NotificationStore] Updating notification locally: ${notificationId}`,
            updates
          )
          set((state) => ({
            notifications: state.notifications.map((notification) =>
              notification.id === notificationId
                ? { ...notification, ...updates }
                : notification
            ),
          }))
        },

        removeNotification: (notificationId: string) => {
          console.log(
            `🔔 [NotificationStore] Removing notification locally: ${notificationId}`
          )
          set((state) => {
            const notification = state.notifications.find(
              (n) => n.id === notificationId
            )
            const wasUnread = notification?.status === "delivered"

            return {
              notifications: state.notifications.filter(
                (n) => n.id !== notificationId
              ),
              totalCount: state.totalCount - 1,
              unreadCount: wasUnread
                ? state.unreadCount - 1
                : state.unreadCount,
            }
          })
        },

        setUnreadCount: (count: number) => {
          console.log(`🔔 [NotificationStore] Setting unread count: ${count}`)
          set({ unreadCount: count })
        },

        setError: (error: string | null) => {
          console.log(`🔔 [NotificationStore] Setting error: ${error}`)
          set({ error })
        },

        setLoading: (loading: boolean) => {
          console.log(`🔔 [NotificationStore] Setting loading: ${loading}`)
          set({ isLoading: loading })
        },

        // Helper methods (not exposed in interface)
        loadPreferences: async () => {
          console.log("🔔 [NotificationStore] Loading preferences")
          try {
            const endpoint = `notifications/getpreferences`
            console.log("🌐 [NotificationStore] API Endpoint:", endpoint)

            const response = await getData(endpoint)
            console.log("📡 [NotificationStore] API Response:", response)

            if (response.result === 1) {
              console.log(
                "📊 [NotificationStore] Preferences data:",
                response.data
              )
              set({ preferences: response.data })
              console.log(
                "✅ [NotificationStore] Preferences loaded successfully"
              )
            } else {
              const errorMessage = response.message || "No preferences found"
              console.log(
                `⚠️ [NotificationStore] ${errorMessage}, using defaults`
              )
              // Use default preferences if no settings found
              set({ preferences: defaultPreferences })
            }
          } catch (error) {
            console.error(
              "❌ [NotificationStore] Failed to load preferences:",
              error
            )
            console.log(
              "⚠️ [NotificationStore] Using default preferences due to error"
            )
            set({ preferences: defaultPreferences })
          }
        },

        savePreferences: async (preferences: NotificationPreferences) => {
          console.log("🔔 [NotificationStore] Saving preferences:", preferences)
          try {
            const endpoint = `notifications/savepreferences`
            console.log("🌐 [NotificationStore] API Endpoint:", endpoint)

            const response = await saveData(endpoint, preferences)
            console.log("📡 [NotificationStore] API Response:", response)

            if (response.result === 1) {
              console.log(
                "✅ [NotificationStore] Preferences saved successfully"
              )
            } else {
              const errorMessage =
                response.message || "Failed to save preferences"
              console.error(
                "❌ [NotificationStore] API returned error:",
                errorMessage
              )
              throw new Error(errorMessage)
            }
          } catch (error) {
            console.error(
              "❌ [NotificationStore] Failed to save preferences:",
              error
            )
            throw error
          }
        },
      }),
      {
        name: "notification-storage",
        partialize: (state) => ({
          preferences: state.preferences,
          notifications: state.notifications.slice(0, 50), // Only persist last 50 notifications
          unreadCount: state.unreadCount,
        }),
      }
    )
  )
)
