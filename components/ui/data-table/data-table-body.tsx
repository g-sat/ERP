"use client"

import { flexRender } from "@tanstack/react-table"

import { TableBody, TableCell, TableRow } from "@/components/ui/table"

interface CustomTableBodyProps {
  table: any // Replace with proper TanStack Table type, e.g., Table<ICountry>
  virtualRows: any[] // Replace with VirtualItem[] from @tanstack/react-virtual
  paddingTop: number
  paddingBottom: number
  isLoading: boolean
  columns: any[] // Replace with ColumnDef<ICountry>[]
  noDataMessage?: string
}

export function CustomTableBody({
  table,
  virtualRows,
  paddingTop,
  paddingBottom,
  isLoading,
  columns,
  noDataMessage = "No data found.",
}: CustomTableBodyProps) {
  return (
    <TableBody className="**:data-[slot=table-cell]:first:w-8">
      {virtualRows.length > 0 ? (
        <>
          <tr style={{ height: `${paddingTop}px` }} />
          {virtualRows.map((virtualRow) => {
            const row = table.getRowModel().rows[virtualRow.index]
            return (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell: any) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
          <tr style={{ height: `${paddingBottom}px` }} />
        </>
      ) : (
        <>
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              {isLoading ? "Loading..." : "No data found."}
            </TableCell>
          </TableRow>
          {Array.from({ length: 9 }).map((_, index) => (
            <TableRow key={`empty-${index}`}>
              <TableCell colSpan={columns.length} className="h-10"></TableCell>
            </TableRow>
          ))}
        </>
      )}
    </TableBody>
  )
}
