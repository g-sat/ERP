"use client"

import { useEffect, useState } from "react"
import { Clock, LogOut, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SessionExpiryModalProps {
  isOpen: boolean
  onCloseAction: () => void
  onStaySignedInAction: () => void
  onSignOutAction: () => void
  timeRemaining: number
  isRefreshing?: boolean
}

export function SessionExpiryModal({
  isOpen,
  onCloseAction,
  onStaySignedInAction,
  onSignOutAction,
  timeRemaining,
  isRefreshing = false,
}: SessionExpiryModalProps) {
  const [countdown, setCountdown] = useState(timeRemaining)

  useEffect(() => {
    if (!isOpen || timeRemaining <= 0) {
      setCountdown(0)
      return
    }

    setCountdown(timeRemaining)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          // Add a small delay to ensure the UI updates before sign out
          setTimeout(() => onSignOutAction(), 100)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isOpen, timeRemaining, onSignOutAction])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCloseAction()}>
      <DialogContent
        className="sm:max-w-md"
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-warning/10 flex h-12 w-12 animate-pulse items-center justify-center rounded-full">
              <Clock className="text-warning h-6 w-6" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                Session Expiring Soon
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1 text-sm">
                Your session will expire due to inactivity. Please choose an
                action to continue.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm font-medium">
                Time remaining:
              </span>
              <span
                className={`font-mono text-xl font-bold ${
                  countdown <= 30
                    ? "text-destructive"
                    : countdown <= 60
                      ? "text-warning"
                      : "text-warning"
                }`}
              >
                {formatTime(countdown)}
              </span>
            </div>
            <div className="bg-muted-foreground/20 mt-2 h-2 w-full overflow-hidden rounded-full">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ${
                  countdown <= 30
                    ? "bg-destructive"
                    : countdown <= 60
                      ? "bg-warning"
                      : "bg-warning"
                }`}
                style={{
                  width: `${timeRemaining > 0 ? Math.max((countdown / timeRemaining) * 100, 0) : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="text-muted-foreground space-y-2 text-sm">
            <p>
              For security purposes, your session will automatically expire
              after a period of inactivity.
            </p>
            <div className="border-primary/20 bg-primary/5 rounded-lg border p-3">
              <p className="text-primary text-sm font-medium">
                💡 Tip: Click &quot;Stay signed in&quot; to extend your session
              </p>
            </div>
            <div className="border-warning/20 bg-warning/5 rounded-lg border p-3">
              <p className="text-warning text-sm font-medium">
                ⚠️ Warning: Closing this dialog will show the warning again if
                your session is still expiring
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={onSignOutAction}
            className="text-muted-foreground hover:border-destructive hover:text-destructive flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign out now
          </Button>
          <Button
            onClick={onStaySignedInAction}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            {isRefreshing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Refreshing...
              </>
            ) : (
              <>
                <User className="h-4 w-4" />
                Stay signed in
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
