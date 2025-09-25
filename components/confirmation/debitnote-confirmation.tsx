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

interface DebitNoteConfirmationProps {
  // Name of the item for debit note (will be shown in the description)
  itemName?: string
  // Whether the dialog is open
  open?: boolean
  // Called when the dialog open state changes
  onOpenChange?: (open: boolean) => void
  // Called when the user confirms the debit note creation
  onConfirm: () => void
  // Called when the user cancels the debit note creation
  onCancel?: () => void
  // Whether the debit note operation is in progress
  isCreating?: boolean
  // Whether this is for existing debit note or new one
  hasExistingDebitNote?: boolean
}

export function DebitNoteConfirmation({
  itemName,
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  isCreating = false,
  hasExistingDebitNote = false,
}: DebitNoteConfirmationProps) {
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
  const getDescription = () => {
    if (hasExistingDebitNote) {
      return itemName
        ? `Selected items have existing debit notes. Do you want to open the existing debit note for "${itemName}"?`
        : "Selected items have existing debit notes. Do you want to open the existing debit note?"
    }

    return itemName
      ? `Do you want to create a debit note for "${itemName}"?`
      : "Do you want to create a debit note for the selected items?"
  }

  // Get the appropriate button text based on operation type
  const getButtonText = () => {
    if (isCreating) {
      return hasExistingDebitNote ? "Opening..." : "Creating..."
    }

    return hasExistingDebitNote ? "Yes, Open" : "Yes, Create"
  }

  // Get the appropriate title
  const getTitle = () => {
    return hasExistingDebitNote
      ? "Open Existing Debit Note"
      : "Create Debit Note"
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
          <AlertDialogDescription>{getDescription()}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isCreating}>
            No
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isCreating}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {getButtonText()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
