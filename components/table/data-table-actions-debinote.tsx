import { useState } from "react"
import { Eye, Pencil, Receipt, ShoppingCart, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Updated interface
interface TableActionsDebitNoteProps<T> {
  row: T
  onView?: (row: T) => void
  onEdit?: (row: T) => void
  onDelete?: (id: string) => void
  onDebitNote?: (id: string) => void
  onPurchase?: (id: string) => void
  onSelect?: (row: T, checked: boolean) => void
  idAccessor: keyof T
  hideView?: boolean
  hideEdit?: boolean
  hideDelete?: boolean
  hideDebitNote?: boolean
  hidePurchase?: boolean
  isSelected?: boolean
  isConfirmed?: boolean
}

// Updated component
export function TableActionsDebitNote<T>({
  row,
  onView,
  onEdit,
  onDelete,
  onDebitNote,
  onPurchase,
  onSelect,
  idAccessor,
  hideView,
  hideEdit,
  hideDelete,
  hideDebitNote,
  hidePurchase,
  isSelected = false,
  isConfirmed = false,
}: TableActionsDebitNoteProps<T>) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  const handleCheckboxChange = (checked: boolean) => {
    console.log("Checkbox changed:", checked, "Row:", row)
    // ONLY handle selection - NO forms, NO modals, NO side effects
    if (onSelect) {
      onSelect(row, checked)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true)
  }

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(String(row[idAccessor]))
    }
    setShowDeleteConfirmation(false)
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false)
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleCheckboxChange}
          disabled={isConfirmed}
          title="Select row"
        />

        {onView && !hideView && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onView(row)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}

        {onEdit && !hideEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(row)}
            disabled={isConfirmed}
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}

        {onDelete && !hideDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 h-8 w-8"
            onClick={handleDeleteClick}
            disabled={isConfirmed}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}

        {onPurchase && !hidePurchase && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-purple-600 hover:bg-purple-100"
            onClick={() => onPurchase(String(row[idAccessor]))}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        )}

        {onDebitNote && !hideDebitNote && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-orange-600 hover:bg-orange-100"
            onClick={() => onDebitNote(String(row[idAccessor]))}
            title="Debit Note"
          >
            <Receipt className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
