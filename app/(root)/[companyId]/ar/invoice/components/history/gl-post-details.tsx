import { useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IGlTransactionDetails } from "@/interfaces/history"
import { useAuthStore } from "@/stores/auth-store"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { format } from "date-fns"

import { useGetGlPostDetails } from "@/hooks/use-histoy"
import { Badge } from "@/components/ui/badge"
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

interface GLPostDetailsProps {
  invoiceId: string
  moduleId: number
  transactionId: number
}

export default function GLPostDetails({
  invoiceId,
  moduleId,
  transactionId,
}: GLPostDetailsProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const exhRateDec = decimals[0]?.exhRateDec || 6
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"

  const [searchQuery, setSearchQuery] = useState("")
  const { data: glPostDetails, refetch: refetchGlPost } =
    //useGetGlPostDetails<IGlTransactionDetails>(25, 1, "14120250100024")
    useGetGlPostDetails<IGlTransactionDetails>(
      Number(moduleId),
      Number(transactionId),
      invoiceId
    )

  const { data: glPostDetailsData } =
    (glPostDetails as ApiResponse<IGlTransactionDetails>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // const {
  //   result: glPostDetailsResult,
  //   message: glPostDetailsMessage,
  //   data: glPostDetailsData,
  // } = glPostDetails ?? {}

  const columns: ColumnDef<IGlTransactionDetails>[] = [
    {
      accessorKey: "DocumentNo",
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
          ? new Date(row.original.AccountDate)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "CurrencyCode",
      header: "Currency Code",
    },
    {
      accessorKey: "CurrencyName",
      header: "Currency Name",
    },
    {
      accessorKey: "ExhRate",
      header: "Exchange Rate",
      cell: ({ row }) =>
        row.original.ExhRate ? row.original.ExhRate.toFixed(exhRateDec) : "-",
    },
    {
      accessorKey: "CtyExhRate",
      header: "Country Exchange Rate",
      cell: ({ row }) =>
        row.original.CtyExhRate
          ? row.original.CtyExhRate.toFixed(exhRateDec)
          : "-",
    },
    {
      accessorKey: "BankCode",
      header: "Bank Code",
    },
    {
      accessorKey: "BankName",
      header: "Bank Name",
    },
    {
      accessorKey: "GLCode",
      header: "GL Code",
    },
    {
      accessorKey: "GLName",
      header: "GL Name",
    },
    {
      accessorKey: "IsDebit",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant={row.original.IsDebit ? "default" : "destructive"}>
          {row.original.IsDebit ? "Debit" : "Credit"}
        </Badge>
      ),
    },
    {
      accessorKey: "TotAmt",
      header: "Total Amount",
      cell: ({ row }) =>
        row.original.TotAmt ? row.original.TotAmt.toFixed(amtDec) : "-",
    },
    {
      accessorKey: "TotLocalAmt",
      header: "Total Local Amount",
      cell: ({ row }) =>
        row.original.TotLocalAmt
          ? row.original.TotLocalAmt.toFixed(locAmtDec)
          : "-",
    },
    {
      accessorKey: "TotCtyAmt",
      header: "Total Country Amount",
      cell: ({ row }) =>
        row.original.TotCtyAmt
          ? row.original.TotCtyAmt.toFixed(locAmtDec)
          : "-",
    },
    {
      accessorKey: "gstCode",
      header: "GST Code",
    },
    {
      accessorKey: "gstName",
      header: "GST Name",
    },
    {
      accessorKey: "gstAmt",
      header: "GST Amount",
      cell: ({ row }) =>
        row.original.gstAmt ? row.original.gstAmt.toFixed(amtDec) : "-",
    },
    {
      accessorKey: "gstLocalAmt",
      header: "GST Local Amount",
      cell: ({ row }) =>
        row.original.gstLocalAmt
          ? row.original.gstLocalAmt.toFixed(locAmtDec)
          : "-",
    },
    {
      accessorKey: "gstCtyAmt",
      header: "GST Country Amount",
      cell: ({ row }) =>
        row.original.gstCtyAmt
          ? row.original.gstCtyAmt.toFixed(locAmtDec)
          : "-",
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
    },
    {
      accessorKey: "departmentCode",
      header: "Department Code",
    },
    {
      accessorKey: "departmentName",
      header: "Department Name",
    },
    {
      accessorKey: "employeeCode",
      header: "Employee Code",
    },
    {
      accessorKey: "employeeName",
      header: "Employee Name",
    },
    {
      accessorKey: "portCode",
      header: "Port Code",
    },
    {
      accessorKey: "portName",
      header: "Port Name",
    },
    {
      accessorKey: "vesselCode",
      header: "Vessel Code",
    },
    {
      accessorKey: "vesselName",
      header: "Vessel Name",
    },
    {
      accessorKey: "voyageNo",
      header: "Voyage No",
    },
    {
      accessorKey: "bargeCode",
      header: "Barge Code",
    },
    {
      accessorKey: "bargeName",
      header: "Barge Name",
    },
    {
      accessorKey: "productCode",
      header: "Product Code",
    },
    {
      accessorKey: "productName",
      header: "Product Name",
    },
    {
      accessorKey: "supplierCode",
      header: "Supplier Code",
    },
    {
      accessorKey: "supplierName",
      header: "Supplier Name",
    },
    {
      accessorKey: "moduleFrom",
      header: "Module",
    },
    {
      accessorKey: "createByCode",
      header: "Created By Code",
    },
    {
      accessorKey: "createByName",
      header: "Created By Name",
    },
    {
      accessorKey: "createDate",
      header: "Created Date",
      cell: ({ row }) => {
        const date = row.original.createDate
          ? new Date(row.original.createDate)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
  ]

  const table = useReactTable({
    data: glPostDetailsData || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleSearch = (value: string) => {
    setSearchQuery(value)
  }

  const handleRefresh = async () => {
    try {
      await refetchGlPost()
    } catch (error) {
      console.error("Error refreshing data:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>GL Post Details</CardTitle>
      </CardHeader>
      <CardContent>
        <TableHeaderCustom
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          onRefresh={handleRefresh}
          columns={table.getAllLeafColumns()}
          data={glPostDetailsData || []}
          tableName="GL Post Details"
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
