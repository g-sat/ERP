"use client"

import { useCallback, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { format } from "date-fns"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, Lock, LockKeyhole, Unlock } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Separator } from "../ui/separator"

// Constants
// ---------
const INACTIVITY_TIMEOUT = 45 * 60 * 1000 // 45 minutes in milliseconds
const LOCK_STATE_KEY = "appLocked"
const BROADCAST_CHANNEL = "auth"
const MAX_FAILED_ATTEMPTS = 3
const TAB_SPECIFIC_PATH_KEY = "tab_specific_path" // New key for tab-specific paths

// Types
// -----
interface ScreenLockProps {
  variant?: "icon" | "text"
  className?: string
}

interface LockState {
  isLocked: boolean
  lastPath: string
  timestamp: number
  tabId: string // Add tabId to track which tab locked the screen
}

type BroadcastMessage = {
  type: "LOCK" | "UNLOCK"
  data?: {
    lastPath?: string
    timestamp?: number
    tabId?: string // Add tabId to broadcast messages
  }
}

/**
 * Screen Lock Component
 *
 * This component provides screen locking functionality with the following features:
 * 1. Manual screen locking via button
 * 2. Automatic locking after inactivity
 * 3. Cross-tab synchronization using BroadcastChannel
 * 4. Password protection
 * 5. Failed attempt tracking
 * 6. Session persistence
 * 7. Tab-specific path handling
 */
export function ScreenLock({ variant = "icon", className }: ScreenLockProps) {
  // State Management
  // ---------------
  const { isAuthenticated, user, applocklogIn, isAppLocked, setAppLocked } =
    useAuthStore()
  const [isClient, setIsClient] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [password, setPassword] = useState("")
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [broadcastChannel, setBroadcastChannel] =
    useState<BroadcastChannel | null>(null)
  const [tabId] = useState(() => Math.random().toString(36).substring(7)) // Generate unique tab ID

  // Router and Path
  // --------------
  const pathname = usePathname()
  const router = useRouter()

  // Helper Functions
  // ---------------
  const getGreeting = (currentTime: Date) => {
    const hours = currentTime.getHours()
    if (hours < 12) return "Good Morning!"
    if (hours < 18) return "Good Afternoon!"
    return "Good Evening!"
  }

  // Screen Lock Actions
  // -----------------
  const lockScreen = useCallback(() => {
    setIsLocked(true)
    setAppLocked(true)

    // Save tab-specific path
    sessionStorage.setItem(`${TAB_SPECIFIC_PATH_KEY}_${tabId}`, pathname)

    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: "LOCK",
        data: {
          lastPath: pathname,
          timestamp: Date.now(),
          tabId,
        },
      })
    }
  }, [broadcastChannel, pathname, setAppLocked, tabId])

  const handleLockScreen = () => {
    lockScreen()
  }

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!user?.userName) {
      setError("User information not available. Please refresh the page.")
      return
    }

    try {
      const loginResponse = await applocklogIn(user.userName, password)

      if (!loginResponse) {
        setError("Invalid login response. Please try again.")
        return
      }

      if (loginResponse.result === 1) {
        // Unlock this tab
        setIsLocked(false)
        setAppLocked(false)
        setPassword("")
        setLastActivity(Date.now())
        setFailedAttempts(0)

        // Get tab-specific path
        const tabSpecificPath = sessionStorage.getItem(
          `${TAB_SPECIFIC_PATH_KEY}_${tabId}`
        )
        if (tabSpecificPath) {
          router.push(tabSpecificPath)
          sessionStorage.removeItem(`${TAB_SPECIFIC_PATH_KEY}_${tabId}`)
        }

        sessionStorage.removeItem(LOCK_STATE_KEY)

        // Broadcast unlock to all tabs
        if (broadcastChannel) {
          broadcastChannel.postMessage({
            type: "UNLOCK",
            data: { tabId },
          })
        }
      } else {
        setMessage(loginResponse.message)
        setIsLocked(true)
        setAppLocked(true)
        setPassword("")
        setLastActivity(Date.now())
        setFailedAttempts(loginResponse.user.failedLoginAttempts)
      }
    } catch (error) {
      const newFailedAttempts = failedAttempts + 1
      setFailedAttempts(newFailedAttempts)

      if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
        setError("Maximum attempts exceeded. Please contact administrator.")
      } else {
        const errorMessage =
          error instanceof Error ? error.message : "Authentication failed"
        setError(
          `${errorMessage}. ${MAX_FAILED_ATTEMPTS - newFailedAttempts} attempts remaining.`
        )
      }
    }
  }

  // Effects
  // -------
  // Initialize client-side state
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Initialize BroadcastChannel
  useEffect(() => {
    if (typeof window !== "undefined") {
      const bc = new BroadcastChannel(BROADCAST_CHANNEL)
      setBroadcastChannel(bc)
      return () => bc.close()
    }
  }, [])

  // Handle BroadcastChannel messages
  useEffect(() => {
    if (!broadcastChannel) return

    const handleMessage = (event: MessageEvent<BroadcastMessage>) => {
      const { type, data } = event.data

      if (type === "LOCK") {
        setIsLocked(true)
        setAppLocked(true)
        if (data?.lastPath && data?.tabId) {
          sessionStorage.setItem(
            `${TAB_SPECIFIC_PATH_KEY}_${data.tabId}`,
            data.lastPath
          )
        }
      } else if (type === "UNLOCK") {
        // Unlock all tabs but maintain their individual paths
        setIsLocked(false)
        setAppLocked(false)
        sessionStorage.removeItem(LOCK_STATE_KEY)

        // Only navigate if this is the tab that initiated the unlock
        if (data?.tabId === tabId) {
          const tabSpecificPath = sessionStorage.getItem(
            `${TAB_SPECIFIC_PATH_KEY}_${tabId}`
          )
          if (tabSpecificPath) {
            router.push(tabSpecificPath)
            sessionStorage.removeItem(`${TAB_SPECIFIC_PATH_KEY}_${tabId}`)
          }
        }
      }
    }

    broadcastChannel.addEventListener("message", handleMessage)
    return () => broadcastChannel.removeEventListener("message", handleMessage)
  }, [broadcastChannel, router, setAppLocked, tabId])

  // Initialize lock state from sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return

    const savedState = sessionStorage.getItem(LOCK_STATE_KEY)
    if (savedState) {
      const state: LockState = JSON.parse(savedState)
      if (Date.now() - state.timestamp < 24 * 60 * 60 * 1000) {
        setIsLocked(true)
        setAppLocked(true)
        if (state.lastPath) {
          sessionStorage.setItem(
            `${TAB_SPECIFIC_PATH_KEY}_${tabId}`,
            state.lastPath
          )
        }
      } else {
        sessionStorage.removeItem(LOCK_STATE_KEY)
      }
    }
  }, [setAppLocked, tabId])

  // Save lock state to sessionStorage
  useEffect(() => {
    if (isLocked) {
      const state: LockState = {
        isLocked: true,
        lastPath: pathname,
        timestamp: Date.now(),
        tabId,
      }
      sessionStorage.setItem(LOCK_STATE_KEY, JSON.stringify(state))
    } else {
      sessionStorage.removeItem(LOCK_STATE_KEY)
    }
  }, [isLocked, pathname, tabId])

  // Handle manual screen lock event
  useEffect(() => {
    const handleManualLock = () => {
      if (isAuthenticated) {
        lockScreen()
      }
    }

    window.addEventListener("manual-screen-lock", handleManualLock)
    return () =>
      window.removeEventListener("manual-screen-lock", handleManualLock)
  }, [isAuthenticated, lockScreen])

  // Handle inactivity timeout
  useEffect(() => {
    if (!isAuthenticated) return

    const updateActivity = () => {
      setLastActivity(Date.now())
    }

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ]
    events.forEach((event) => window.addEventListener(event, updateActivity))

    const inactivityCheck = setInterval(() => {
      if (Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
        lockScreen()
      }
    }, 1000)

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, updateActivity)
      )
      clearInterval(inactivityCheck)
    }
  }, [lastActivity, isAuthenticated, lockScreen])

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 10000)

    return () => clearInterval(timer)
  }, [])

  // Clear error when password changes
  useEffect(() => {
    if (error && password) setError("")
  }, [password, error])

  // Prevent page refresh/navigation when locked
  useEffect(() => {
    if (!isLocked) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault()
      window.history.pushState(null, "", pathname)
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("popstate", handlePopState)
    window.history.pushState(null, "", pathname)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [isLocked, pathname])

  // Sync with auth store's lock state
  useEffect(() => {
    if (isAppLocked !== isLocked) {
      setIsLocked(isAppLocked)
    }
  }, [isAppLocked, isLocked])

  // Don't render on server or if not authenticated
  if (!isClient || !isAuthenticated) return null

  // Render
  // ------
  return (
    <>
      {/* Lock Screen Button */}
      {variant === "text" ? (
        <div className={className} onClick={handleLockScreen}>
          <LockKeyhole className="h-4 w-4" />
        </div>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={`h-8 w-8 rounded-md ${className || ""}`}
              onClick={handleLockScreen}
              aria-label="Lock screen"
            >
              <LockKeyhole className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Lock screen</TooltipContent>
        </Tooltip>
      )}

      {/* Lock Screen Dialog */}
      <Dialog
        open={isLocked}
        onOpenChange={(open) => {
          if (!open && isLocked) return
          setIsLocked(open)
          setAppLocked(open)
        }}
      >
        <DialogContent
          className="w-[80%] max-w-[600px] overflow-hidden"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <DialogHeader>
              <div className="flex flex-col items-center text-center">
                <motion.div
                  className="bg-primary/10 mb-6 flex h-12 w-12 items-center justify-center rounded-full"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  {failedAttempts >= MAX_FAILED_ATTEMPTS ? (
                    <AlertTriangle className="text-destructive h-6 w-6" />
                  ) : (
                    <Lock className="text-primary h-6 w-6" />
                  )}
                </motion.div>
                <DialogTitle className="text-2xl">
                  {failedAttempts >= MAX_FAILED_ATTEMPTS
                    ? "Account Locked"
                    : "Session Locked"}
                </DialogTitle>
                <DialogDescription className="mt-2">
                  {failedAttempts >= MAX_FAILED_ATTEMPTS
                    ? "Your account has been locked due to multiple failed attempts."
                    : "For your security, we've locked your screen due to inactivity."}
                </DialogDescription>
              </div>
            </DialogHeader>

            <motion.div
              className="py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex flex-col items-center gap-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="text-primary text-3xl font-bold">
                    {getGreeting(currentTime)}
                  </div>
                  <div className="text-6xl font-bold tracking-tighter">
                    {format(currentTime, "HH:mm:ss")}
                  </div>
                  <div className="text-muted-foreground text-lg font-medium">
                    {format(currentTime, "EEEE, do yyyy")}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <motion.div
                    className="bg-muted flex h-12 w-12 items-center justify-center rounded-full"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-base font-semibold">
                      {user?.userName?.substring(0, 2).toUpperCase() || "UN"}
                    </span>
                  </motion.div>
                  <div className="text-left">
                    <p className="font-semibold">{user?.userName || "User"}</p>
                    <p className="text-muted-foreground text-sm">
                      {user?.userEmail || ""}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {failedAttempts >= MAX_FAILED_ATTEMPTS ? (
                <motion.div
                  key="locked-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-4 text-center">
                    <p className="text-destructive font-medium">
                      Please contact your administrator to unlock your account.
                    </p>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        className="mx-auto h-10 w-64 gap-2"
                        onClick={() => {
                          setIsLocked(false)
                          setAppLocked(false)
                          setFailedAttempts(0)
                          router.push("/login")
                        }}
                      >
                        Return to Login
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="unlock-form"
                  onSubmit={handleUnlock}
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password to continue"
                      className="focus-visible:ring-primary h-10 w-64 focus-visible:ring-2"
                      autoFocus
                    />
                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-destructive text-sm font-medium"
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button type="submit" className="mx-auto h-10 w-64 gap-2">
                        <Unlock className="h-4 w-4" />
                        Unlock
                      </Button>
                    </motion.div>

                    <AnimatePresence>
                      {message && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-destructive text-sm font-medium"
                        >
                          {message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {failedAttempts < MAX_FAILED_ATTEMPTS && (
              <motion.div
                className="text-muted-foreground mt-6 text-center text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <motion.button
                  type="button"
                  className="hover:text-primary hover:underline"
                  onClick={() => console.log("Forgot password clicked")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Separator className="my-4" />
                  Forgot password?
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  )
}
