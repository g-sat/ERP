// Add reusable dialog component (outside main component)

"use client"

import { Loader2 } from "lucide-react"

import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"

type LoadConfirmationProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoad: () => void
  onCancel?: () => void
  code?: string
  name?: string
  typeLabel: string
  isLoading?: boolean
  className?: string
  description?: string
  showDetails?: boolean
}

export const LoadConfirmation = ({
  open,
  onOpenChange,
  onLoad,
  onCancel,
  code,
  name,
  typeLabel,
  isLoading = false,
  className,
  description,
  showDetails = true,
}: LoadConfirmationProps) => {
  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  const handleLoad = () => {
    if (!isLoading) {
      onLoad()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>Record Found</DialogTitle>
          <DialogDescription>
            {description ||
              `A ${typeLabel} record with this code already exists. Do you want to load it?`}
          </DialogDescription>
        </DialogHeader>

        {showDetails && (code || name) && (
          <div className="space-y-2 py-4">
            {code && (
              <p className="text-sm">
                <span className="font-medium">Code:</span>{" "}
                <span className="bg-muted rounded px-2 py-1 font-mono">
                  {code}
                </span>
              </p>
            )}
            {name && (
              <p className="text-sm">
                <span className="font-medium">Name:</span>{" "}
                <span className="text-muted-foreground">{name}</span>
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleLoad} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
