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
  // Title of the confirmation dialog
  title?: string
  // Description of the confirmation dialog
  description?: string
  // Name of the item to delete (will be shown in the description)
  itemName?: string
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
  title = "Are you sure?",
  description = "This action cannot be undone.",
  itemName,
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
    ? `You are about to delete "${itemName}". ${description}`
    : description

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {itemName && itemName.includes("<br/>") ? (
              <div>
                <p className="mb-2 font-medium text-red-600">
                  You are about to delete:
                </p>
                <div
                  className="font-medium text-red-700"
                  dangerouslySetInnerHTML={{ __html: itemName }}
                />
                <p className="mt-2 text-red-600">{description}</p>
              </div>
            ) : (
              <div className="text-red-600">{fullDescription}</div>
            )}
          </AlertDialogDescription>
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
