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
  onClose: () => void
  onStaySignedIn: () => void
  onSignOut: () => void
  timeRemaining: number
}

export function SessionExpiryModal({
  isOpen,
  onClose,
  onStaySignedIn,
  onSignOut,
  timeRemaining,
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
          setTimeout(() => onSignOut(), 100)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isOpen, timeRemaining, onSignOut])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-md"
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-orange-100">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold text-gray-900">
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
              <span className="text-sm font-medium text-gray-700">
                Time remaining:
              </span>
              <span
                className={`font-mono text-xl font-bold ${
                  countdown <= 30
                    ? "text-red-600"
                    : countdown <= 60
                      ? "text-orange-600"
                      : "text-yellow-600"
                }`}
              >
                {formatTime(countdown)}
              </span>
            </div>
            <div className="bg-muted-foreground/20 mt-2 h-2 w-full overflow-hidden rounded-full">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ${
                  countdown <= 30
                    ? "bg-red-500"
                    : countdown <= 60
                      ? "bg-orange-500"
                      : "bg-yellow-500"
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
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm font-medium text-blue-800">
                💡 Tip: Click &quot;Stay signed in&quot; to extend your session
              </p>
            </div>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <p className="text-sm font-medium text-yellow-800">
                ⚠️ Warning: Closing this dialog will show the warning again if
                your session is still expiring
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={onSignOut}
            className="flex items-center gap-2 text-gray-600 hover:border-red-300 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Sign out now
          </Button>
          <Button
            onClick={onStaySignedIn}
            className="flex items-center gap-2 bg-green-600 font-medium text-white hover:bg-green-700"
          >
            <User className="h-4 w-4" />
            Stay signed in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
