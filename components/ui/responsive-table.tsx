"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ResponsiveTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  className?: string
  onRowClick?: (row: TData) => void
  showHeader?: boolean
}

export function ResponsiveTable<TData, TValue>({
  columns,
  data,
  className,
  onRowClick,
  showHeader = true,
}: ResponsiveTableProps<TData, TValue>) {
  const isMobile = useIsMobile()
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isMobile) {
    return (
      <div className={`space-y-4 ${className || ""}`}>
        {table.getRowModel().rows.map((row) => (
          <Card
            key={row.id}
            className={`hover:bg-muted/50 cursor-pointer transition-colors ${
              onRowClick ? "hover:shadow-md" : ""
            }`}
            onClick={() => onRowClick?.(row.original)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                {row
                  .getVisibleCells()
                  .slice(0, 2)
                  .map((cell) => (
                    <span key={cell.id} className="mr-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </span>
                  ))}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {row
                  .getVisibleCells()
                  .slice(2)
                  .map((cell) => {
                    const column = cell.column.columnDef
                    const value = flexRender(column.cell, cell.getContext())

                    // Skip empty values and certain column types
                    if (
                      !value ||
                      column.id === "actions" ||
                      column.id === "select"
                    ) {
                      return null
                    }

                    return (
                      <div
                        key={cell.id}
                        className="flex items-center justify-between"
                      >
                        <span className="text-muted-foreground text-sm font-medium">
                          {typeof column.header === "string"
                            ? column.header
                            : ""}
                        </span>
                        <span className="text-sm">{value}</span>
                      </div>
                    )
                  })}
              </div>

              {/* Actions row */}
              {row
                .getVisibleCells()
                .some((cell) => cell.column.id === "actions") && (
                <>
                  <Separator className="my-3" />
                  <div className="flex justify-end">
                    {row
                      .getVisibleCells()
                      .filter((cell) => cell.column.id === "actions")
                      .map((cell) => (
                        <div key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={`rounded-md border ${className || ""}`}>
      <Table>
        {showHeader && (
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
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
        )}
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={onRowClick ? "hover:bg-muted/50 cursor-pointer" : ""}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
