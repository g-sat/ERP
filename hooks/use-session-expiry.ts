import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"

import { refreshToken } from "@/lib/auth-helpers"

interface SessionExpiryConfig {
  warningTimeMinutes: number
  sessionTimeoutMinutes: number
  enabled: boolean
}

const getSessionConfig = (): SessionExpiryConfig => {
  return {
    warningTimeMinutes: parseInt(
      process.env.NEXT_PUBLIC_SESSION_WARNING_TIME || "5",
      10
    ),
    sessionTimeoutMinutes: parseInt(
      process.env.NEXT_PUBLIC_SESSION_TIMEOUT || "30",
      10
    ),
    enabled: process.env.NEXT_PUBLIC_ENABLE_SESSION_WARNING === "true",
  }
}

export function useSessionExpiry() {
  const { token, isAuthenticated, logOut } = useAuthStore()
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [_lastActivity, setLastActivity] = useState(Date.now())
  const [warningShown, setWarningShown] = useState(false)

  const config = getSessionConfig()

  // Update last activity on user interaction
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now())
    if (showModal) {
      setShowModal(false)
      setWarningShown(false)
    }
  }, [showModal])

  // Check if token is expired
  const isTokenExpired = useCallback((token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      const exp = payload.exp * 1000 // Convert to milliseconds
      return Date.now() >= exp
    } catch {
      return true
    }
  }, [])

  // Get token expiry time
  const getTokenExpiry = useCallback((token: string): number => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      return payload.exp * 1000 // Convert to milliseconds
    } catch {
      return 0
    }
  }, [])

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    setShowModal(false)
    setWarningShown(false)
    await logOut()
    router.push("/login")
  }, [logOut, router])

  // Handle stay signed in
  const handleStaySignedIn = useCallback(async () => {
    setShowModal(false)
    setWarningShown(false)
    setLastActivity(Date.now())

    // Refresh the token to extend session
    try {
      const newToken = await refreshToken()
      if (newToken) {
        console.log("Session extended successfully")
      } else {
        console.log("Token refresh failed, will logout on next check")
      }
    } catch (error) {
      console.error("Failed to refresh token:", error)
    }
  }, [])

  // Check session expiry
  useEffect(() => {
    if (!isAuthenticated || !token || !config.enabled) return

    const checkSession = () => {
      if (isTokenExpired(token)) {
        handleSignOut()
        return
      }

      const now = Date.now()
      const tokenExpiry = getTokenExpiry(token)
      const timeUntilExpiry = tokenExpiry - now
      const warningTimeMs = config.warningTimeMinutes * 60 * 1000

      // Show warning if we're within the warning time and haven't shown it yet
      if (timeUntilExpiry <= warningTimeMs && !warningShown) {
        setTimeRemaining(Math.floor(timeUntilExpiry / 1000))
        setShowModal(true)
        setWarningShown(true)
      }
    }

    // Check immediately
    checkSession()

    // Set up interval to check every 30 seconds
    const interval = setInterval(checkSession, 30000)

    return () => clearInterval(interval)
  }, [
    isAuthenticated,
    token,
    config.enabled,
    config.warningTimeMinutes,
    warningShown,
    isTokenExpired,
    getTokenExpiry,
    handleSignOut,
  ])

  // Set up activity listeners
  useEffect(() => {
    if (!isAuthenticated || !config.enabled) return

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

  return {
    showModal,
    timeRemaining,
    onSignOut: handleSignOut,
    onStaySignedIn: handleStaySignedIn,
    onClose: () => setShowModal(false),
  }
}
