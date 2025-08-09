"use client"

import { ColumnDef } from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface LoanTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  onRowClick?: (row: T) => void
}

export function LoanTable<T>({ columns, data, onRowClick }: LoanTableProps<T>) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {columns.map((column) => (
            <TableHead key={column.id as string}>
              {typeof column.header === "string" ? column.header : ""}
            </TableHead>
          ))}
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              className={onRowClick ? "hover:bg-muted/50 cursor-pointer" : ""}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex}>
                  {column.cell
                    ? (column.cell as any)({ row: { original: row } })
                    : ""}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
