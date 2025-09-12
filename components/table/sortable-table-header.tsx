"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconArrowLeft,
  IconArrowRight,
  IconDotsVertical,
  IconEye,
  IconGripVertical,
  IconSortAscending,
  IconSortDescending,
  IconX,
} from "@tabler/icons-react"
import { Header, flexRender } from "@tanstack/react-table"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TableHead } from "@/components/ui/table"

interface SortableTableHeaderProps<TData> {
  header: Header<TData, unknown>
}

/**
 * A sortable and draggable table header component with advanced column management features.
 * Supports column reordering, sorting, pinning, hiding, and resizing.
 *
 * @param header - The TanStack Table header object
 */
export function SortableTableHeader<TData>({
  header,
}: SortableTableHeaderProps<TData>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: header.id,
  })

  const isSorted = header.column.getIsSorted()
  const canSort = header.column.getCanSort()
  const canHide = header.column.getCanHide()
  const canResize = header.column.getCanResize()
  const isResizing = header.column.getIsResizing()

  const handleSortToggle = header.column.getToggleSortingHandler()
  const handlePinLeft = () => header.column.pin("left")
  const handlePinRight = () => header.column.pin("right")
  const handleToggleVisibility = () => header.column.toggleVisibility()
  const handleClearSort = () => header.column.clearSorting()
  const handleSortAscending = () => header.column.toggleSorting(false)
  const handleSortDescending = () => header.column.toggleSorting(true)

  return (
    <TableHead
      ref={setNodeRef}
      colSpan={header.colSpan}
      style={{
        width: header.getSize(),
        minWidth: header.column.columnDef.minSize,
        maxWidth: header.column.columnDef.maxSize,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className={cn(
        "bg-muted group hover:bg-muted/80 relative transition-colors",
        isDragging && "z-10 cursor-grabbing"
      )}
    >
      <div className="flex items-center justify-between">
        {header.isPlaceholder ? null : (
          <>
            <div className="flex items-center gap-2">
              {canSort ? (
                <Button
                  variant="ghost"
                  className="h-8 px-2 font-medium hover:bg-transparent"
                  onClick={handleSortToggle}
                  aria-label={`Sort column ${header.column.id}`}
                >
                  <span className="flex items-center gap-2">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {isSorted === "asc" && <ArrowUpIcon className="h-4 w-4" />}
                    {isSorted === "desc" && (
                      <ArrowDownIcon className="h-4 w-4" />
                    )}
                    {!isSorted && (
                      <ArrowUpIcon className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    )}
                  </span>
                </Button>
              ) : (
                <span className="font-medium">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </span>
              )}

              <div className="flex items-center gap-1">
                <Button
                  {...attributes}
                  {...listeners}
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground size-7 cursor-grab hover:bg-transparent active:cursor-grabbing"
                  aria-label="Drag to reorder column"
                >
                  <IconGripVertical className="text-muted-foreground size-3" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground size-7 hover:bg-transparent"
                      aria-label="Column options"
                    >
                      <IconDotsVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canHide && (
                      <DropdownMenuItem onClick={handleToggleVisibility}>
                        <IconEye className="mr-2 h-4 w-4" />
                        Hide column
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onClick={handlePinLeft}>
                      <IconArrowLeft className="mr-2 h-4 w-4" />
                      Pin to left
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handlePinRight}>
                      <IconArrowRight className="mr-2 h-4 w-4" />
                      Pin to right
                    </DropdownMenuItem>

                    {canSort && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleClearSort}>
                          <IconX className="mr-2 h-4 w-4" />
                          Clear sort
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleSortAscending}>
                          <IconSortAscending className="mr-2 h-4 w-4" />
                          Sort ascending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleSortDescending}>
                          <IconSortDescending className="mr-2 h-4 w-4" />
                          Sort descending
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </>
        )}
      </div>

      {canResize && (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={cn(
            "resizer bg-border absolute top-0 right-0 h-full w-1 cursor-col-resize opacity-0 transition-opacity",
            "group-hover:opacity-100",
            isResizing && "bg-primary opacity-100"
          )}
          style={{
            transform: isResizing ? "scaleX(1.5)" : "scaleX(1)",
          }}
          aria-label="Resize column"
        />
      )}
    </TableHead>
  )
}
