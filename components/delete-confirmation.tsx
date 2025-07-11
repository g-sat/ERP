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

interface DeleteConfirmationProps {
  // The text to show in the delete button
  triggerText?: React.ReactNode
  // Element to use as trigger instead of the default delete button
  triggerElement?: React.ReactNode
  // Title of the confirmation dialog
  title?: string
  // Description of the confirmation dialog
  description?: string
  // Name of the item to delete (will be shown in the description)
  itemName?: string
  // Additional attributes about the item that will be shown in the description
  itemAttributes?: string
  // Whether the dialog is open
  open?: boolean
  // Called when the dialog open state changes
  onOpenChange?: (open: boolean) => void
  // Called when the user confirms the deletion
  onConfirm: () => void
  // Called when the user cancels the deletion
  onCancel?: () => void
  // Whether the delete operation is in progress
  isDeleting?: boolean
}

export function DeleteConfirmation({
  triggerText = "Delete",
  triggerElement,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  itemName,
  itemAttributes,
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteConfirmationProps) {
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
    ? `You are about to delete "${itemName}"${itemAttributes ? ` (${itemAttributes})` : ""}. ${description}`
    : description

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      {triggerElement ? (
        <div onClick={() => setIsOpen(true)}>{triggerElement}</div>
      ) : null}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{fullDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
