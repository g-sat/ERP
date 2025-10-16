"use client"

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

interface DuplicateConfirmationProps {
  // Whether the dialog is open
  open?: boolean
  // Called when the dialog open state changes
  onOpenChange?: (open: boolean) => void
  // Called when the user confirms to proceed with duplicate
  onConfirm: () => void
  // Called when the user cancels
  onCancel?: () => void
  // The duplicate field values to display
  duplicateInfo?: {
    invoiceDate?: string
    invoiceNo?: string
    supplierName?: string
  }
}

export function DuplicateConfirmation({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  duplicateInfo,
}: DuplicateConfirmationProps) {
  // Handle the confirm action
  const handleConfirm = () => {
    onConfirm()
    onOpenChange?.(false)
  }

  // Handle the cancel action
  const handleCancel = () => {
    onCancel?.()
    onOpenChange?.(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            ⚠️ Duplicate Record Found
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>A record with the same details already exists in the table:</p>
            {duplicateInfo && (
              <div className="border-destructive/30 bg-destructive/5 rounded-md border p-3 text-sm">
                <div className="space-y-1">
                  {duplicateInfo.invoiceDate && (
                    <div className="flex gap-2">
                      <span className="font-semibold">Invoice Date:</span>
                      <span>{duplicateInfo.invoiceDate}</span>
                    </div>
                  )}
                  {duplicateInfo.invoiceNo && (
                    <div className="flex gap-2">
                      <span className="font-semibold">Invoice No:</span>
                      <span>{duplicateInfo.invoiceNo}</span>
                    </div>
                  )}
                  {duplicateInfo.supplierName && (
                    <div className="flex gap-2">
                      <span className="font-semibold">Supplier Name:</span>
                      <span>{duplicateInfo.supplierName}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <p className="font-medium">
              Do you want to add this record anyway?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            No, Reset Form
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Yes, Add Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
