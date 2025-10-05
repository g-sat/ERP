"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/stores/auth-store"

import { securityMonitor } from "@/lib/security-features"
import { smartCache } from "@/lib/smart-cache"

/**
 * Security Provider Component
 *
 * This component initializes all security features including:
 * - Device fingerprinting
 * - Security monitoring
 * - Cache management
 * - Authentication validation
 */
export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const { initializeAuth, isAuthenticated, user, trackUserAction } =
    useAuthStore()

  useEffect(() => {
    const initializeSecurity = async () => {
      try {
        console.log("🔐 [SecurityProvider] Initializing security features...")

        // Initialize security monitoring
        await securityMonitor.initialize()

        // Initialize authentication
        initializeAuth()

        // Track initialization
        trackUserAction("security_initialized", {
          deviceId: securityMonitor.getDeviceId(),
          timestamp: Date.now(),
        })

        console.log(
          "✅ [SecurityProvider] Security features initialized successfully"
        )
      } catch (error) {
        console.error(
          "❌ [SecurityProvider] Security initialization failed:",
          error
        )
        trackUserAction("security_init_failed", {
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    initializeSecurity()
  }, [initializeAuth, trackUserAction])

  useEffect(() => {
    if (isAuthenticated && user) {
      // Reset failed login attempts on successful authentication
      securityMonitor.resetFailedLogins()

      // Track successful authentication
      trackUserAction("user_authenticated", {
        userId: user.userId,
        deviceId: securityMonitor.getDeviceId(),
      })
    }
  }, [isAuthenticated, user, trackUserAction])

  // Monitor for security events
  useEffect(() => {
    const handleSecurityEvent = () => {
      const securityContext = securityMonitor.getSecurityContext()

      if (securityContext.suspiciousActivity) {
        console.warn(
          "🚨 [SecurityProvider] Suspicious activity detected:",
          securityContext
        )
        trackUserAction("suspicious_activity", {
          ...securityContext,
          sessionFingerprint: securityContext.sessionFingerprint,
          deviceId: securityContext.deviceId,
          lastActivity: securityContext.lastActivity,
          suspiciousActivity: securityContext.suspiciousActivity,
          failedLoginAttempts: securityContext.failedLoginAttempts,
          securityLevel: securityContext.securityLevel,
        })
      }
    }

    // Check security every 5 minutes
    const interval = setInterval(handleSecurityEvent, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [trackUserAction])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("🧹 [SecurityProvider] Cleaning up security features")
      smartCache.clear()
    }
  }, [])

  return <>{children}</>
}
