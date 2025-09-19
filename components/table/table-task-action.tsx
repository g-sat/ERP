import { Eye, Pencil, Receipt, ShoppingCart, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

interface TaskTableActionsProps<T> {
  row: T & { debitNoteId?: number }
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

export function TaskTableActions<T>({
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
  isSelected = true,
  isConfirmed = false,
}: TaskTableActionsProps<T>) {
  const handleCheckboxChange = (checked: boolean) => {
    console.log("Checkbox changed:", checked, "Row:", row)
    if (onSelect) {
      onSelect(row, checked)
    }
  }
  const hasValidDebitNoteId = row.debitNoteId && row.debitNoteId > 0

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        checked={isSelected}
        onCheckedChange={handleCheckboxChange}
        disabled={Boolean(hasValidDebitNoteId) || isConfirmed}
        className={hasValidDebitNoteId ? "cursor-not-allowed opacity-50" : ""}
        title={
          hasValidDebitNoteId
            ? "Cannot select - Debit Note exists"
            : "Select row"
        }
      />

      {onView && !hideView && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onView(row)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}

      {onEdit && !hideEdit && (
        <Button
          variant="ghost"
          size="icon"
          className={`h-6 w-6 ${
            hasValidDebitNoteId
              ? "cursor-not-allowed text-gray-400 opacity-50"
              : ""
          }`}
          onClick={() => !hasValidDebitNoteId && onEdit(row)}
          disabled={Boolean(hasValidDebitNoteId) || isConfirmed}
          title={
            hasValidDebitNoteId ? "Cannot edit - Debit Note exists" : "Edit"
          }
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}

      {onDelete && !hideDelete && (
        <Button
          variant="ghost"
          size="icon"
          className={`h-6 w-6 ${
            hasValidDebitNoteId
              ? "cursor-not-allowed text-gray-400 opacity-50"
              : "text-destructive hover:bg-destructive/10"
          }`}
          onClick={() =>
            !hasValidDebitNoteId && onDelete(String(row[idAccessor]))
          }
          disabled={Boolean(hasValidDebitNoteId) || isConfirmed}
          title={
            hasValidDebitNoteId ? "Cannot delete - Debit Note exists" : "Delete"
          }
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}

      {onPurchase && !hidePurchase && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-purple-600 hover:bg-purple-100"
          onClick={() => onPurchase(String(row[idAccessor]))}
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
      )}

      {onDebitNote && !hideDebitNote && (
        <Button
          variant="ghost"
          size="icon"
          className={`h-6 w-6 ${
            hasValidDebitNoteId
              ? "text-orange-600 hover:bg-orange-100"
              : "cursor-not-allowed text-gray-400 opacity-50"
          }`}
          onClick={() =>
            hasValidDebitNoteId && onDebitNote(String(row[idAccessor]))
          }
          disabled={!hasValidDebitNoteId}
          title={
            hasValidDebitNoteId
              ? "Debit Note"
              : "Debit Note ID is zero or invalid"
          }
        >
          <Receipt className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
