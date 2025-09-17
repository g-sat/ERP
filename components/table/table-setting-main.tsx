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

interface SettingTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  isLoading?: boolean
  emptyMessage?: string
  maxHeight?: string
}

export function SettingTable<T>({
  data,
  columns,
  isLoading = false,
  emptyMessage = "No data found.",
  maxHeight = "460px",
}: SettingTableProps<T>) {
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 28,
    overscan: 5,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()
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
