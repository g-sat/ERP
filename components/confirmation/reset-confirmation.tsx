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

interface ResetConfirmationProps {
  // Title of the confirmation dialog
  title?: string
  // Description of the confirmation dialog
  description?: string
  // Name of the item to reset (will be shown in the description)
  itemName?: string
  // Whether the dialog is open
  open?: boolean
  // Called when the dialog open state changes
  onOpenChange?: (open: boolean) => void
  // Called when the user confirms the reset
  onConfirm: () => void
  // Called when the user cancels the reset
  onCancel?: () => void
  // Whether the reset operation is in progress
  isResetting?: boolean
}

export function ResetConfirmation({
  title = "Reset Confirmation",
  description = "This will clear all unsaved changes.",
  itemName,
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  isResetting = false,
}: ResetConfirmationProps) {
  // Use internal state if open/onOpenChange are not provided
  const [internalOpen, setInternalOpen] = useState(false)

  // Determine if we're using controlled or uncontrolled state
  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen

  // Handle the confirm action
  const handleConfirm = () => {
    onConfirm()
    setIsOpen(false)
  }

  // Handle the cancel action
  const handleCancel = () => {
    onCancel?.()
    setIsOpen(false)
  }

  // Construct the full description
  const fullDescription = itemName
    ? `Do you want to reset "${itemName}"? ${description}`
    : `Do you want to reset all fields? ${description}`

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="text-orange-600">{fullDescription}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isResetting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isResetting}
            className="bg-orange-600 text-white hover:bg-orange-700"
          >
            {isResetting ? "Resetting..." : "Reset"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
