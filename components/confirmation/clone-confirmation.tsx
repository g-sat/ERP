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
import { Spinner } from "@/components/ui/spinner"

interface CloneConfirmationProps {
  // Title of the confirmation dialog
  title?: string
  // Description of the confirmation dialog
  description?: string
  // Name of the item to clone (will be shown in the description)
  itemName?: string
  // Whether the dialog is open
  open?: boolean
  // Called when the dialog open state changes
  onOpenChange?: (open: boolean) => void
  // Called when the user confirms the clone
  onConfirm: () => void
  // Called when the user cancels the clone
  onCancelAction?: () => void
  // Whether the clone operation is in progress
  isCloning?: boolean
}

export function CloneConfirmation({
  title = "Clone Confirmation",
  description = "This will create a copy as a new record.",
  itemName,
  open,
  onOpenChange,
  onConfirm,
  onCancelAction,
  isCloning = false,
}: CloneConfirmationProps) {
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
    onCancelAction?.()
    setIsOpen(false)
  }

  // Construct the full description
  const fullDescription = itemName
    ? `Do you want to clone "${itemName}"? ${description}`
    : `Do you want to clone this record? ${description}`

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="text-blue-600">{fullDescription}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isCloning}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isCloning}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {isCloning && <Spinner className="mr-2" size="sm" />}
            {isCloning ? "Cloning..." : "Clone"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
