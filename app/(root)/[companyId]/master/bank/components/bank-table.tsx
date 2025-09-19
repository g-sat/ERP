"use client"

import { IBank, IBankFilter } from "@/interfaces/bank"
import { useAuthStore } from "@/stores/auth-store"
import {
  IconCircleCheckFilled,
  IconSquareRoundedXFilled,
} from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { format, isValid } from "date-fns"

import { TableName } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { DialogDataTable } from "@/components/table/table-dialog"

interface BankTableProps {
  data: IBank[]
  isLoading?: boolean
  onSelect?: (bank: IBank | null) => void
  onFilterChange?: (filters: IBankFilter) => void
  onRefresh?: () => void
  moduleId: number
  transactionId: number
}

export function BankTable({
  data,
  isLoading = false,
  onSelect,
  onFilterChange,
  onRefresh,
  moduleId,
  transactionId,
}: BankTableProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  const columns: ColumnDef<IBank>[] = [
    {
      accessorKey: "bankCode",
      header: "Code",
      size: 120,
      minSize: 50,
      enableColumnFilter: true,
    },
    {
      accessorKey: "bankName",
      header: "Name",
      size: 200,
      minSize: 50,
      enableColumnFilter: true,
    },
    {
      accessorKey: "accountNo",
      header: "Account No",
      size: 120,
      minSize: 50,
    },
    {
      accessorKey: "swiftCode",
      header: "Swift Code",
      size: 120,
      minSize: 50,
    },
    {
      accessorKey: "currencyName",
      header: "Currency",
      size: 120,
      minSize: 50,
    },
    {
      accessorKey: "isOwnBank",
      header: "Is Own Bank",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isOwnBank") ? "default" : "secondary"}>
          {row.getValue("isOwnBank") ? (
            <IconCircleCheckFilled className="mr-1 fill-green-500 dark:fill-green-400" />
          ) : (
            <IconSquareRoundedXFilled className="mr-1 fill-red-500 dark:fill-red-400" />
          )}
          {row.getValue("isOwnBank") ? "Yes" : "No"}
        </Badge>
      ),
      size: 120,
      minSize: 50,
    },
    {
      accessorKey: "isPettyCashBank",
      header: "Is Petty Cash",
      cell: ({ row }) => (
        <Badge
          variant={row.getValue("isPettyCashBank") ? "default" : "secondary"}
        >
          {row.getValue("isPettyCashBank") ? (
            <IconCircleCheckFilled className="mr-1 fill-green-500 dark:fill-green-400" />
          ) : (
            <IconSquareRoundedXFilled className="mr-1 fill-red-500 dark:fill-red-400" />
          )}
          {row.getValue("isPettyCashBank") ? "Yes" : "No"}
        </Badge>
      ),
      size: 120,
      minSize: 50,
    },
    {
      accessorKey: "remarks1",
      header: "Remarks 1",
      size: 200,
      minSize: 50,
    },
    {
      accessorKey: "remarks2",
      header: "Remarks 2",
      size: 200,
      minSize: 50,
    },
    {
      accessorKey: "remarks3",
      header: "Remarks 3",
      size: 200,
      minSize: 50,
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      size: 250,
      minSize: 50,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isActive") ? "default" : "destructive"}>
          {row.getValue("isActive") ? (
            <IconCircleCheckFilled className="mr-1 fill-green-500 dark:fill-green-400" />
          ) : (
            <IconSquareRoundedXFilled className="mr-1 fill-red-500 dark:fill-red-400" />
          )}
          {row.getValue("isActive") ? "Active" : "Inactive"}
        </Badge>
      ),
      size: 120,
      minSize: 50,
    },
    {
      accessorKey: "createBy",
      header: "Create By",
      size: 120,
      minSize: 50,
    },
    {
      accessorKey: "createDate",
      header: "Create Date",
      cell: ({ row }) => {
        const raw = row.getValue("createDate")
        let date: Date | null = null
        if (typeof raw === "string") {
          date = new Date(raw)
        } else if (raw instanceof Date) {
          date = raw
        }
        return date && isValid(date) ? format(date, datetimeFormat) : "-"
      },
      size: 180,
      minSize: 150,
    },
    {
      accessorKey: "editBy",
      header: "Edit By",
      size: 120,
      minSize: 50,
    },
    {
      accessorKey: "editDate",
      header: "Edit Date",
      cell: ({ row }) => {
        const raw = row.getValue("editDate")
        let date: Date | null = null
        if (typeof raw === "string") {
          date = new Date(raw)
        } else if (raw instanceof Date) {
          date = raw
        }
        return date && isValid(date) ? format(date, datetimeFormat) : "-"
      },
      size: 180,
      minSize: 150,
    },
  ]

  // Handle filter change for dialog table - convert generic filters to ICustomerFilter
  const handleDialogFilterChange = (filters: {
    search?: string
    sortOrder?: string
  }) => {
    if (onFilterChange) {
      const newFilters: IBankFilter = {
        search: filters.search,
        sortOrder: filters.sortOrder as "asc" | "desc" | undefined,
      }
      onFilterChange(newFilters)
    }
  }

  return (
    <DialogDataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      moduleId={moduleId}
      transactionId={transactionId}
      tableName={TableName.bank}
      emptyMessage="No banks found."
      onRefresh={onRefresh}
      onFilterChange={handleDialogFilterChange}
      onRowSelect={onSelect}
    />
  )
}
