import { useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IPaymentDetails } from "@/interfaces/history"
import { useAuthStore } from "@/stores/auth-store"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { format } from "date-fns"

import { useGetPaymentDetails } from "@/hooks/use-histoy"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TableHeaderCustom } from "@/components/ui/data-table/data-table-header-custom"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface PaymentDetailsProps {
  invoiceId: string
  moduleId: number
  transactionId: number
  companyId: string
}

export default function PaymentDetails({
  invoiceId,
  moduleId,
  transactionId,
  companyId,
}: PaymentDetailsProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"

  const [searchQuery, setSearchQuery] = useState("")
  const { data: paymentDetails, refetch: refetchPayment } =
    //useGetPaymentDetails<IPaymentDetails>(25, 1, "14120250100024")
    useGetPaymentDetails<IPaymentDetails>(
      Number(moduleId),
      Number(transactionId),
      invoiceId
    )

  const { data: paymentDetailsData } =
    (paymentDetails as ApiResponse<IPaymentDetails>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  const columns: ColumnDef<IPaymentDetails>[] = [
    {
      accessorKey: "DocumentNO",
      header: "Document No",
    },
    {
      accessorKey: "ReferenceNo",
      header: "Reference No",
    },
    {
      accessorKey: "AccountDate",
      header: "Account Date",
      cell: ({ row }) => {
        const date = row.original.AccountDate
          ? new Date(row.original.AccountDate.toString())
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "TotAmt",
      header: "Total Amount",
      cell: ({ row }) =>
        row.original.TotAmt ? row.original.TotAmt.toFixed(amtDec) : "-",
    },
    {
      accessorKey: "TotLocalAmt",
      header: "Local Amount",
      cell: ({ row }) =>
        row.original.TotLocalAmt
          ? row.original.TotLocalAmt.toFixed(locAmtDec)
          : "-",
    },
    {
      accessorKey: "AllAmt",
      header: "Allocated Amount",
      cell: ({ row }) =>
        row.original.AllAmt ? row.original.AllAmt.toFixed(amtDec) : "-",
    },
    {
      accessorKey: "AllLocalAmt",
      header: "Allocated Local Amount",
      cell: ({ row }) =>
        row.original.AllLocalAmt
          ? row.original.AllLocalAmt.toFixed(locAmtDec)
          : "-",
    },
    {
      accessorKey: "ExGainLoss",
      header: "Exchange Gain/Loss",
      cell: ({ row }) =>
        row.original.ExGainLoss
          ? Number(row.original.ExGainLoss).toFixed(amtDec)
          : "-",
    },
  ]

  const table = useReactTable({
    data: paymentDetailsData || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleSearch = (value: string) => {
    setSearchQuery(value)
  }

  const handleRefresh = async () => {
    try {
      await refetchPayment()
    } catch (error) {
      console.error("Error refreshing data:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <TableHeaderCustom
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          onRefresh={handleRefresh}
          columns={table.getAllLeafColumns()}
          data={paymentDetailsData || []}
          tableName="Payment Details"
          companyId={companyId}
        />
        <div className="rounded-md border">
          <Table>
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
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
