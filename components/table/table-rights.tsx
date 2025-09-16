"use client"

import { useRef } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/**
 * Props interface for the SimpleTable component
 * @template T - The type of data items in the table
 */
interface RightsTableProps<T> {
  data: T[] // Array of data items to display in the table
  columns: ColumnDef<T>[] // Column definitions for the table structure
  isLoading?: boolean // Loading state indicator
  emptyMessage?: string // Message to show when no data is available
  maxHeight?: string // Maximum height for the table container
}

/**
 * SimpleTable - A simplified data table component with sticky header
 *
 * Features:
 * - Virtual scrolling for performance with large datasets
 * - Sticky header that remains visible while scrolling
 * - Column sizing and alignment
 * - Loading states and empty state handling
 * - No header controls, footer, or action columns
 *
 * @template T - The type of data items in the table
 * @param props - Component props as defined in SimpleTableProps
 * @returns JSX element representing the data table
 */
export function RightsTable<T>({
  data,
  columns,
  isLoading = false,
  emptyMessage = "No data found.",
  maxHeight = "460px",
}: RightsTableProps<T>) {
  // Reference to table container for virtual scrolling
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // Create the TanStack Table instance with basic configuration
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Set up virtual scrolling for performance with large datasets
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 28,
    overscan: 5,
  })

  // Get the currently visible virtual rows
  const virtualRows = rowVirtualizer.getVirtualItems()

  // Calculate total height of all rows (visible + invisible)
  const totalSize = rowVirtualizer.getTotalSize()

  // Calculate padding for smooth scrolling
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - virtualRows[virtualRows.length - 1].end
      : 0

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        {/* Fixed header table with column sizing */}
        <Table className="w-full table-fixed border-collapse">
          {/* Column group for consistent sizing */}
          <colgroup>
            {table.getAllLeafColumns().map((col) => (
              <col key={col.id} style={{ width: `${col.getSize()}px` }} />
            ))}
          </colgroup>

          {/* Sticky table header */}
          <TableHeader className="bg-background sticky top-0 z-20">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
        </Table>

        {/* Scrollable body container */}
        <div
          ref={tableContainerRef}
          className="overflow-y-auto"
          style={{ maxHeight }}
        >
          {/* Body table with same column sizing as header */}
          <Table className="w-full table-fixed border-collapse">
            {/* Column group matching header for alignment */}
            <colgroup>
              {table.getAllLeafColumns().map((col) => (
                <col key={col.id} style={{ width: `${col.getSize()}px` }} />
              ))}
            </colgroup>

            <TableBody>
              {/* Show empty state or loading message when no virtual rows */}
              {virtualRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center">
                    {isLoading ? "Loading..." : emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {/* Top padding for virtual scrolling */}
                  <tr style={{ height: `${paddingTop}px` }} />

                  {/* Render only visible virtual rows for performance */}
                  {virtualRows.map((virtualRow) => {
                    const row = table.getRowModel().rows[virtualRow.index]
                    return (
                      <TableRow key={row.id}>
                        {/* Render each visible cell in the row */}
                        {row.getVisibleCells().map((cell, cellIndex) => (
                          <TableCell
                            key={cell.id}
                            className={`py-1 ${
                              cellIndex === 0
                                ? "bg-background sticky left-0 z-10"
                                : ""
                            }`}
                          >
                            {/* Render cell content using column definition */}
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })}

                  {/* Bottom padding for virtual scrolling */}
                  <tr style={{ height: `${paddingBottom}px` }} />
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </Table>
    </div>
  )
}
