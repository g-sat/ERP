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

interface SaveConfirmationProps {
  // Title of the confirmation dialog
  title?: string
  // Name of the item to save (will be shown in the description)
  itemName?: string
  // Whether the dialog is open
  open?: boolean
  // Called when the dialog open state changes
  onOpenChange?: (open: boolean) => void
  // Called when the user confirms the save
  onConfirm: () => void
  // Called when the user cancels the save
  onCancel?: () => void
  // Whether the save operation is in progress
  isSaving?: boolean
  // Type of operation (create, update, etc.)
  operationType?: "create" | "update" | "save"
}

export function SaveConfirmation({
  title = "Are you sure?",
  itemName,
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  isSaving = false,
  operationType = "save",
}: SaveConfirmationProps) {
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
    ? `Do you want to ${operationType} "${itemName}"?`
    : `Do you want to ${operationType} this item?`

  // Get the appropriate button text based on operation type
  const getButtonText = () => {
    if (isSaving) {
      switch (operationType) {
        case "create":
          return "Creating..."
        case "update":
          return "Updating..."
        default:
          return "Saving..."
      }
    }

    switch (operationType) {
      case "create":
        return "Yes, Create"
      case "update":
        return "Yes, Update"
      default:
        return "Yes, Save"
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{fullDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isSaving}>
            No
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isSaving}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {getButtonText()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
