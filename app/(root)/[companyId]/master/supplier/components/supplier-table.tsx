"use client"

import { ISupplier, ISupplierFilter } from "@/interfaces/supplier"
import { useAuthStore } from "@/stores/auth-store"
import {
  IconCircleCheckFilled,
  IconSquareRoundedXFilled,
} from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { format, isValid } from "date-fns"

import { TableName } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { MainTable } from "@/components/table/table-main"

interface SupplierTableProps {
  data: ISupplier[]
  isLoading?: boolean
  onSelect?: (supplier: ISupplier | null) => void
  onFilterChange?: (filters: ISupplierFilter) => void
  onRefresh?: () => void
  moduleId: number
  transactionId: number
}

export function SupplierTable({
  data,
  isLoading = false,
  onSelect,
  onFilterChange,
  onRefresh,
  moduleId,
  transactionId,
}: SupplierTableProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  const columns: ColumnDef<ISupplier>[] = [
    {
      accessorKey: "supplierCode",
      header: "Code",
      size: 120,
      minSize: 50,
      enableColumnFilter: true,
    },
    {
      accessorKey: "supplierName",
      header: "Name",
      size: 200,
      minSize: 50,
      enableColumnFilter: true,
    },
    {
      accessorKey: "supplierOtherName",
      header: "Other Name",
      cell: ({ row }) => <div>{row.getValue("supplierOtherName") || "-"}</div>,
      size: 200,
      minSize: 50,
    },
    {
      accessorKey: "supplierShortName",
      header: "Short Name",
      cell: ({ row }) => <div>{row.getValue("supplierShortName") || "-"}</div>,
      size: 120,
      minSize: 50,
    },
    {
      accessorKey: "supplierRegNo",
      header: "Registration No",
      cell: ({ row }) => <div>{row.getValue("supplierRegNo") || "-"}</div>,
      size: 120,
      minSize: 50,
    },
    {
      accessorKey: "currencyName",
      header: "Currency",
      cell: ({ row }) => <div>{row.getValue("currencyName") || "-"}</div>,
      size: 120,
      minSize: 50,
    },
    {
      accessorKey: "bankName",
      header: "Bank",
      cell: ({ row }) => <div>{row.getValue("bankName") || "-"}</div>,
      size: 120,
      minSize: 50,
    },
    {
      accessorKey: "creditTermName",
      header: "Credit Term",
      cell: ({ row }) => <div>{row.getValue("creditTermName") || "-"}</div>,
      size: 120,
      minSize: 50,
    },
    {
      accessorKey: "accSetupName",
      header: "Account Setup",
      cell: ({ row }) => <div>{row.getValue("accSetupName") || "-"}</div>,
      size: 120,
      minSize: 50,
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => <div>{row.getValue("customerName") || "-"}</div>,
      size: 120,
      minSize: 50,
    },
    {
      accessorKey: "parentSupplierName",
      header: "Parent Supplier",
      cell: ({ row }) => <div>{row.getValue("parentSupplierName") || "-"}</div>,
      size: 120,
      minSize: 50,
    },
    {
      accessorKey: "isCustomer",
      header: "Is Customer",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isCustomer") ? "default" : "secondary"}>
          {row.getValue("isCustomer") ? (
            <IconCircleCheckFilled className="mr-1 fill-green-500 dark:fill-green-400" />
          ) : (
            <IconSquareRoundedXFilled className="mr-1 fill-red-500 dark:fill-red-400" />
          )}
          {row.getValue("isCustomer") ? "Yes" : "No"}
        </Badge>
      ),
      size: 120,
      minSize: 50,
    },
    {
      accessorKey: "isVendor",
      header: "Is Vendor",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isVendor") ? "default" : "secondary"}>
          {row.getValue("isVendor") ? (
            <IconCircleCheckFilled className="mr-1 fill-green-500 dark:fill-green-400" />
          ) : (
            <IconSquareRoundedXFilled className="mr-1 fill-red-500 dark:fill-red-400" />
          )}
          {row.getValue("isVendor") ? "Yes" : "No"}
        </Badge>
      ),
      size: 120,
      minSize: 50,
    },
    {
      accessorKey: "isTrader",
      header: "Is Trader",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isTrader") ? "default" : "secondary"}>
          {row.getValue("isTrader") ? (
            <IconCircleCheckFilled className="mr-1 fill-green-500 dark:fill-green-400" />
          ) : (
            <IconSquareRoundedXFilled className="mr-1 fill-red-500 dark:fill-red-400" />
          )}
          {row.getValue("isTrader") ? "Yes" : "No"}
        </Badge>
      ),
      size: 120,
      minSize: 50,
    },
    {
      accessorKey: "isSupplier",
      header: "Is Supplier",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isSupplier") ? "default" : "secondary"}>
          {row.getValue("isSupplier") ? (
            <IconCircleCheckFilled className="mr-1 fill-green-500 dark:fill-green-400" />
          ) : (
            <IconSquareRoundedXFilled className="mr-1 fill-red-500 dark:fill-red-400" />
          )}
          {row.getValue("isSupplier") ? "Yes" : "No"}
        </Badge>
      ),
      size: 120,
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
      const newFilters: ISupplierFilter = {
        search: filters.search,
        sortOrder: filters.sortOrder as "asc" | "desc" | undefined,
      }
      onFilterChange(newFilters)
    }
  }

  return (
    <MainTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      moduleId={moduleId}
      transactionId={transactionId}
      tableName={TableName.supplier}
      emptyMessage="No suppliers found."
      accessorId="supplierId"
      // Add handlers if provided
      onRefresh={onRefresh}
      onFilterChange={handleDialogFilterChange}
      //handler column props
      onItemSelect={onSelect}
      //show props
      showHeader={true}
      showFooter={false}
      showActions={false}
    />
  )
}
