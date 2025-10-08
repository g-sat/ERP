import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"

import { refreshToken } from "@/lib/auth-helpers"

// Cross-tab communication for session expiry
const SESSION_EXPIRY_CHANNEL = "session-expiry-channel"

interface SessionExpiryConfig {
  warningTimeMinutes: number
  sessionTimeoutMinutes: number
  enabled: boolean
  autoSignOutOnClose: boolean
}

const getSessionConfig = (): SessionExpiryConfig => {
  const config = {
    warningTimeMinutes: parseInt(
      process.env.NEXT_PUBLIC_SESSION_WARNING_TIME || "5",
      10
    ),
    sessionTimeoutMinutes: parseInt(
      process.env.NEXT_PUBLIC_SESSION_TIMEOUT || "30",
      10
    ),
    // Enable by default in both development and production
    // Can be disabled by setting NEXT_PUBLIC_ENABLE_SESSION_WARNING=false
    enabled: process.env.NEXT_PUBLIC_ENABLE_SESSION_WARNING !== "false",
    // Auto sign out when user closes the modal (default: false for user-friendly behavior)
    autoSignOutOnClose:
      process.env.NEXT_PUBLIC_SESSION_AUTO_SIGNOUT_ON_CLOSE === "true",
  }

  return config
}

export function useSessionExpiry() {
  const { token, isAuthenticated, logOut } = useAuthStore()
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [_lastActivity, setLastActivity] = useState(Date.now())
  const [warningShown, setWarningShown] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [tokenRefreshInProgress, setTokenRefreshInProgress] = useState(false)

  const config = getSessionConfig()

  // Cross-tab communication setup
  useEffect(() => {
    if (typeof window === "undefined") return

    const broadcastChannel = new BroadcastChannel(SESSION_EXPIRY_CHANNEL)

    const handleMessage = (event: MessageEvent) => {
      const { type, data } = event.data

      console.log("📡 [SessionExpiry] Received message:", { type, data })

      switch (type) {
        case "SHOW_MODAL":
          console.log("📡 [SessionExpiry] Received show modal from another tab")
          setShowModal(true)
          setTimeRemaining(data.timeRemaining)
          setWarningShown(true)
          break
        case "HIDE_MODAL":
          console.log("📡 [SessionExpiry] Received hide modal from another tab")
          setShowModal(false)
          setWarningShown(false)
          break
        case "TOKEN_REFRESHED":
          console.log(
            "📡 [SessionExpiry] Received token refresh from another tab"
          )
          setShowModal(false)
          setWarningShown(false)
          break
      }
    }

    broadcastChannel.addEventListener("message", handleMessage)

    return () => {
      broadcastChannel.removeEventListener("message", handleMessage)
      broadcastChannel.close()
    }
  }, [])

  // Broadcast modal state changes to other tabs
  const broadcastToOtherTabs = useCallback(
    (type: string, data?: Record<string, unknown>) => {
      if (typeof window === "undefined") return

      const broadcastChannel = new BroadcastChannel(SESSION_EXPIRY_CHANNEL)
      broadcastChannel.postMessage({ type, data })
      broadcastChannel.close()
    },
    []
  )

  // Update last activity on user interaction (without closing modal)
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now())
    // Don't automatically close the modal on user interaction
    // The modal should only be closed by explicit user action (Stay Signed In, Sign Out, or Close)
  }, [])

  // Check if token is expired
  const isTokenExpired = useCallback((token: string): boolean => {
    try {
      // Validate token format first
      if (
        !token ||
        typeof token !== "string" ||
        token.split(".").length !== 3
      ) {
        return true
      }

      const parts = token.split(".")
      if (!parts[1]) {
        return true
      }

      const payload = JSON.parse(atob(parts[1]))
      const exp = payload.exp * 1000 // Convert to milliseconds
      return Date.now() >= exp
    } catch (error) {
      console.warn("Token parsing error:", error, "Token:", token)
      return true
    }
  }, [])

  // Get token expiry time
  const getTokenExpiry = useCallback((token: string): number => {
    try {
      // Validate token format first
      if (
        !token ||
        typeof token !== "string" ||
        token.split(".").length !== 3
      ) {
        return 0
      }

      const parts = token.split(".")
      if (!parts[1]) {
        console.warn("Token missing payload for expiry check:", token)
        return 0
      }

      const payload = JSON.parse(atob(parts[1]))
      return payload.exp * 1000 // Convert to milliseconds
    } catch (error) {
      console.warn("Token expiry parsing error:", error, "Token:", token)
      return 0
    }
  }, [])

  // Force close modal - used when token refresh is successful
  const forceCloseModal = useCallback(() => {
    console.log("🔄 [SessionExpiry] Force closing modal")
    setShowModal(false)
    setWarningShown(false)
    setTokenRefreshInProgress(false)
    setIsRefreshing(false)

    // Broadcast close to other tabs
    broadcastToOtherTabs("HIDE_MODAL")
  }, [broadcastToOtherTabs])

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    setShowModal(false)
    setWarningShown(false)

    // Broadcast sign out to other tabs
    broadcastToOtherTabs("HIDE_MODAL")

    await logOut()
    router.push("/login")
  }, [logOut, router, broadcastToOtherTabs])

  // Handle stay signed in
  const handleStaySignedIn = useCallback(async () => {
    // Prevent multiple clicks
    if (isRefreshing || tokenRefreshInProgress) {
      console.log("🔄 [SessionExpiry] Already refreshing, ignoring click")
      return
    }

    console.log("🔄 [SessionExpiry] Stay signed in clicked")
    setIsRefreshing(true)
    setTokenRefreshInProgress(true)

    // Don't close modal immediately - wait for token refresh result
    setLastActivity(Date.now())

    // Refresh the token to extend session
    try {
      console.log("🔄 [SessionExpiry] Refreshing token...")

      // Add timeout to prevent infinite loading
      const refreshPromise = refreshToken()
      console.log("🔄 [SessionExpiry] Refresh promise:", refreshPromise)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Token refresh timeout")), 10000)
      )

      const newToken = (await Promise.race([
        refreshPromise,
        timeoutPromise,
      ])) as string | null

      console.log("🔄 [SessionExpiry] Token refresh result:", {
        success: !!newToken,
        tokenLength: newToken?.length || 0,
        tokenPreview: newToken ? `${newToken.substring(0, 20)}...` : null,
      })

      if (newToken && newToken.length > 0) {
        console.log("✅ [SessionExpiry] Token refreshed successfully")

        // Success - force close modal and reset all states
        console.log("🔄 [SessionExpiry] Calling forceCloseModal...")
        forceCloseModal()

        // Broadcast success to other tabs
        broadcastToOtherTabs("TOKEN_REFRESHED")

        console.log("✅ [SessionExpiry] Modal should now be closed")

        // Add a backup timeout to force close modal if it doesn't close
        setTimeout(() => {
          console.log("🔄 [SessionExpiry] Backup timeout - forcing modal close")
          setShowModal(false)
          setWarningShown(false)
          setTokenRefreshInProgress(false)
          setIsRefreshing(false)
        }, 2000)

        // Force a session check to update the expiry time
        setTimeout(() => {
          const now = Date.now()
          const tokenExpiry = getTokenExpiry(newToken)
          const timeUntilExpiry = tokenExpiry - now
          console.log(
            "🔄 [SessionExpiry] New token expiry time:",
            Math.floor(timeUntilExpiry / 1000),
            "seconds"
          )
        }, 100)
      } else {
        console.warn(
          "⚠️ [SessionExpiry] Token refresh returned null or empty - keeping modal open"
        )
        // If no new token, keep modal open and show error
        setShowModal(true)
        setWarningShown(false)
        setTokenRefreshInProgress(false)
        setIsRefreshing(false)
      }
    } catch (error) {
      console.error("❌ [SessionExpiry] Failed to refresh token:", error)
      // If token refresh fails, keep modal open and show error
      setShowModal(true)
      setWarningShown(false)
      setTokenRefreshInProgress(false)
      setIsRefreshing(false)
    }
  }, [
    getTokenExpiry,
    isRefreshing,
    tokenRefreshInProgress,
    broadcastToOtherTabs,
    forceCloseModal,
  ])

  // Reset warning state when token changes (e.g., after refresh)
  useEffect(() => {
    if (token && isAuthenticated) {
      setWarningShown(false)
    }
  }, [token, isAuthenticated])

  // Debug modal state changes
  useEffect(() => {
    console.log("🔍 [SessionExpiry] Modal state changed:", {
      showModal,
      isRefreshing,
      warningShown,
      timeRemaining,
    })
  }, [showModal, isRefreshing, warningShown, timeRemaining])

  // Check session expiry
  useEffect(() => {
    if (!isAuthenticated || !token || !config.enabled) {
      return
    }

    const checkSession = () => {
      if (isTokenExpired(token)) {
        handleSignOut()
        return
      }

      const now = Date.now()
      const tokenExpiry = getTokenExpiry(token)
      const timeUntilExpiry = tokenExpiry - now
      const warningTimeMs = config.warningTimeMinutes * 60 * 1000

      // Debug logging with more details (development only)
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 [SessionExpiry] Debug info:", {
          isAuthenticated,
          token: token ? `${token.substring(0, 20)}...` : null,
          timeUntilExpiry: Math.floor(timeUntilExpiry / 1000),
          warningTimeMs: Math.floor(warningTimeMs / 1000),
          warningShown,
          config: {
            enabled: config.enabled,
            warningTimeMinutes: config.warningTimeMinutes,
            sessionTimeoutMinutes: config.sessionTimeoutMinutes,
          },
        })
      }

      // Show warning if we're within the warning time and haven't shown it yet
      // Also ensure timeUntilExpiry > 0 to avoid showing for expired tokens
      // Don't show modal if token refresh is in progress
      if (
        timeUntilExpiry <= warningTimeMs &&
        timeUntilExpiry > 0 &&
        !warningShown &&
        !tokenRefreshInProgress
      ) {
        console.log(
          "⚠️ [SessionExpiry] Showing modal - time until expiry:",
          Math.floor(timeUntilExpiry / 1000),
          "seconds"
        )
        const timeRemainingSeconds = Math.floor(timeUntilExpiry / 1000)
        setTimeRemaining(timeRemainingSeconds)
        setShowModal(true)
        setWarningShown(true)

        // Broadcast to other tabs
        broadcastToOtherTabs("SHOW_MODAL", {
          timeRemaining: timeRemainingSeconds,
        })
      }
    }

    // Check immediately
    checkSession()

    // Set up interval to check every 30 seconds (production) or 10 seconds (development)
    const checkInterval = process.env.NODE_ENV === "development" ? 10000 : 30000
    const interval = setInterval(checkSession, checkInterval)

    return () => clearInterval(interval)
  }, [
    isAuthenticated,
    token,
    config.enabled,
    config.warningTimeMinutes,
    config.sessionTimeoutMinutes,
    warningShown,
    tokenRefreshInProgress,
    isTokenExpired,
    getTokenExpiry,
    handleSignOut,
    broadcastToOtherTabs,
  ])

  // Set up activity listeners to track user activity
  useEffect(() => {
    if (!isAuthenticated || !config.enabled) return

    // Listen for user activity to track last activity time
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ]

    events.forEach((event) => {
      document.addEventListener(event, updateActivity, true)
    })

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateActivity, true)
      })
    }
  }, [isAuthenticated, config.enabled, updateActivity])

  // Test function to manually trigger session expiry modal
  const testSessionExpiry = useCallback(() => {
    console.log("🧪 [SessionExpiry] Test function called")
    setTimeRemaining(300) // 5 minutes
    setShowModal(true)
    setWarningShown(true)

    // Broadcast test modal to other tabs
    broadcastToOtherTabs("SHOW_MODAL", { timeRemaining: 300 })

    console.log("🧪 [SessionExpiry] Modal should now be visible on all tabs")
  }, [broadcastToOtherTabs])

  // Expose test function to window for debugging (development only)
  useEffect(() => {
    if (
      process.env.NODE_ENV === "development" &&
      typeof window !== "undefined"
    ) {
      ;(
        window as unknown as { testSessionExpiry?: () => void }
      ).testSessionExpiry = testSessionExpiry

      // Cleanup on unmount
      return () => {
        if (typeof window !== "undefined") {
          delete (window as unknown as { testSessionExpiry?: () => void })
            .testSessionExpiry
        }
      }
    }
  }, [testSessionExpiry])

  // Handle modal close - user dismissed the warning
  const handleClose = useCallback(() => {
    setShowModal(false)

    // Broadcast close to other tabs
    broadcastToOtherTabs("HIDE_MODAL")

    if (config.autoSignOutOnClose) {
      handleSignOut()
    } else {
      // User-friendly mode: Reset warning state so modal can show again
      setWarningShown(false)
    }
  }, [config.autoSignOutOnClose, handleSignOut, broadcastToOtherTabs])

  return {
    showModal,
    timeRemaining,
    isRefreshing,
    onSignOut: handleSignOut,
    onStaySignedIn: handleStaySignedIn,
    onClose: handleClose,
    ...(process.env.NODE_ENV === "development" && { testSessionExpiry }), // Only expose in development
  }
}
