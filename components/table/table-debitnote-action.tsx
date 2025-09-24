import { Eye, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

interface DebitNoteTableActionsProps<T> {
  row: T & { debitNoteId?: number }
  onView?: (row: T) => void
  onEdit?: (row: T) => void
  onDelete?: (id: string) => void
  onSelect?: (row: T, checked: boolean) => void
  idAccessor: keyof T
  hideView?: boolean
  hideEdit?: boolean
  hideDelete?: boolean
  isSelected?: boolean
  isConfirmed?: boolean
}

export function DebitNoteTableActions<T>({
  row,
  onView,
  onEdit,
  onDelete,
  onSelect,
  idAccessor,
  hideView,
  hideEdit,
  hideDelete,
  isSelected = true,
  isConfirmed = false,
}: DebitNoteTableActionsProps<T>) {
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

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        disabled={hideView}
        onClick={() => onView?.(row)}
      >
        <Eye className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={`h-6 w-6 ${
          hasValidDebitNoteId
            ? "cursor-not-allowed text-gray-400 opacity-50"
            : ""
        }`}
        onClick={() => !hasValidDebitNoteId && onEdit?.(row)}
        disabled={hideEdit || Boolean(hasValidDebitNoteId) || isConfirmed}
        title={hasValidDebitNoteId ? "Cannot edit - Debit Note exists" : "Edit"}
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={`h-6 w-6 ${
          hasValidDebitNoteId
            ? "cursor-not-allowed text-gray-400 opacity-50"
            : "text-destructive hover:bg-destructive/10"
        }`}
        onClick={() =>
          !hasValidDebitNoteId && onDelete?.(String(row[idAccessor]))
        }
        disabled={hideDelete || Boolean(hasValidDebitNoteId) || isConfirmed}
        title={
          hasValidDebitNoteId ? "Cannot delete - Debit Note exists" : "Delete"
        }
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
