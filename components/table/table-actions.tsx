import { Eye, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"

// Updated interface
interface TableActionsProps<T> {
  row: T
  onView?: (row: T) => void
  onEdit?: (row: T) => void
  onDelete?: (id: string) => void
  idAccessor: keyof T
  hideView?: boolean
  hideEdit?: boolean
  hideDelete?: boolean
}

// Updated component
export function DataTableActions<T>({
  row,
  onView,
  onEdit,
  onDelete,
  idAccessor,
  hideView,
  hideEdit,
  hideDelete,
}: TableActionsProps<T>) {
  return (
    <div className="flex items-center gap-2">
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
          className="h-6 w-6"
          onClick={() => onEdit(row)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}

      {onDelete && !hideDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:bg-destructive/10 h-6 w-6"
          onClick={() => onDelete(String(row[idAccessor]))}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
