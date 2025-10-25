"use client"

import { useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

interface CancelConfirmationProps {
  // Title of the confirmation dialog
  title?: string
  // Description of the confirmation dialog
  description?: string
  // Name of the item to cancel (will be shown in the description)
  itemName?: string
  // Whether the dialog is open
  open?: boolean
  // Called when the dialog open state changes
  onOpenChange?: (open: boolean) => void
  // Called when the user confirms the cancellation
  onConfirmAction: (cancelRemarks: string) => void
  // Called when the user cancels the cancellation
  onCancel?: () => void
  // Whether the cancel operation is in progress
  isCancelling?: boolean
}

export function CancelConfirmation({
  title = "Cancel Confirmation",
  description = "Please provide a reason for cancellation.",
  itemName,
  open,
  onOpenChange,
  onConfirmAction,
  onCancel,
  isCancelling = false,
}: CancelConfirmationProps) {
  // Use internal state if open/onOpenChange are not provided
  const [internalOpen, setInternalOpen] = useState(false)
  const [cancelRemarks, setCancelRemarks] = useState("")

  // Determine if we're using controlled or uncontrolled state
  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen

  // Handle the confirm action
  const handleConfirm = () => {
    if (cancelRemarks.trim()) {
      onConfirmAction(cancelRemarks.trim())
      setCancelRemarks("")
      setIsOpen(false)
    }
  }

  // Handle the cancel action
  const handleCancel = () => {
    setCancelRemarks("")
    onCancel?.()
    setIsOpen(false)
  }

  // Handle dialog close
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCancelRemarks("")
    }
    setIsOpen(open)
  }

  // Construct the full description
  const fullDescription = itemName
    ? `You are about to cancel "${itemName}". ${description}`
    : description

  // Check if cancel remarks are valid
  const isRemarksValid = cancelRemarks.trim().length > 0

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="text-orange-600">{fullDescription}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <Label htmlFor="cancel-remarks" className="text-sm font-medium">
            Cancel Remarks <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="cancel-remarks"
            placeholder="Enter reason for cancellation..."
            value={cancelRemarks}
            onChange={(e) => setCancelRemarks(e.target.value)}
            maxLength={200}
            className="mt-2 min-h-[80px] resize-none"
            disabled={isCancelling}
          />
          <div className="text-muted-foreground mt-1 flex justify-between text-xs">
            <span className={cancelRemarks.length > 200 ? "text-red-500" : ""}>
              {cancelRemarks.length}/200 characters
            </span>
            {!isRemarksValid && cancelRemarks.length > 0 && (
              <span className="text-red-500">Remarks required</span>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isCancelling}>
            No, Keep
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isRemarksValid || isCancelling}
            className="bg-orange-600 text-white hover:bg-orange-700 disabled:bg-gray-400"
          >
            {isCancelling && <Spinner className="mr-2" size="sm" />}
            {isCancelling ? "Cancelling..." : "Yes, Cancel"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
