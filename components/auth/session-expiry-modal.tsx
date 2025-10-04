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
    if (!isOpen) return

    setCountdown(timeRemaining)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onSignOut()
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Your session is about to expire
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Due to inactivity, you will be automatically signed out
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Time remaining:</span>
              <span className="font-mono text-lg font-bold text-orange-600">
                {formatTime(countdown)}
              </span>
            </div>
            <div className="bg-muted-foreground/20 mt-2 h-2 w-full rounded-full">
              <div
                className="h-2 rounded-full bg-orange-500 transition-all duration-1000"
                style={{
                  width: `${(countdown / timeRemaining) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="text-muted-foreground text-sm">
            <p>
              Your organization&apos;s policy enforces automatic sign out after
              a period of inactivity on the ERP system.
            </p>
            <p className="mt-2 font-medium">Do you want to stay signed in?</p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:flex-col">
          <Button
            variant="outline"
            onClick={onSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign out now
          </Button>
          <Button
            onClick={onStaySignedIn}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <User className="h-4 w-4" />
            Stay signed in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
