"use client"

// Need to explicitly import flexRender for the component to work
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

interface DraggableColumnHeaderProps<TData> {
  header: Header<TData, unknown>
}

// Generic draggable column header component that can be used with any data type
export function DraggableColumnHeader<TData>({
  header,
}: DraggableColumnHeaderProps<TData>) {
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
        isDragging && "cursor-grabbing"
      )}
    >
      <div className="flex items-center justify-between">
        {header.isPlaceholder ? null : (
          <>
            <div className="flex items-center gap-2">
              {header.column.getCanSort() ? (
                <Button
                  variant="ghost"
                  className="h-8 px-2 font-medium hover:bg-transparent"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <span className="flex items-center gap-2">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: <ArrowUpIcon className="h-4 w-4" />,
                      desc: <ArrowDownIcon className="h-4 w-4" />,
                    }[header.column.getIsSorted() as string] ?? (
                      <ArrowUpIcon className="h-4 w-4 opacity-0 group-hover:opacity-100" />
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
                  className="text-muted-foreground size-7 cursor-grab hover:bg-transparent"
                >
                  <IconGripVertical className="text-muted-foreground size-3" />
                  <span className="sr-only">Drag to reorder column</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground size-7 hover:bg-transparent"
                    >
                      <IconDotsVertical className="h-4 w-4" />
                      <span className="sr-only">Column options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {header.column.getCanHide() && (
                      <DropdownMenuItem
                        onClick={() => header.column.toggleVisibility()}
                      >
                        <IconEye className="mr-2 h-4 w-4" />
                        Hide column
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => header.column.pin("left")}>
                      <IconArrowLeft className="mr-2 h-4 w-4" />
                      Pin to left
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => header.column.pin("right")}
                    >
                      <IconArrowRight className="mr-2 h-4 w-4" />
                      Pin to right
                    </DropdownMenuItem>
                    {header.column.getCanSort() && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => header.column.clearSorting()}
                        >
                          <IconX className="mr-2 h-4 w-4" />
                          Clear sort
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => header.column.toggleSorting(false)}
                        >
                          <IconSortAscending className="mr-2 h-4 w-4" />
                          Sort ascending
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => header.column.toggleSorting(true)}
                        >
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

      {header.column.getCanResize() && (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={cn(
            "resizer bg-border absolute top-0 right-0 h-full w-1 cursor-col-resize opacity-0 transition-opacity",
            "group-hover:opacity-100",
            header.column.getIsResizing() && "bg-primary opacity-100"
          )}
          style={{
            transform: header.column.getIsResizing()
              ? "scaleX(1.5)"
              : "scaleX(1)",
          }}
          aria-label="Resize column"
        />
      )}
    </TableHead>
  )
}
