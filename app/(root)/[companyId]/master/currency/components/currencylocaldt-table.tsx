"use client"

import { ICurrencyLocalDt, ICurrencyLocalDtFilter } from "@/interfaces/currency"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format, isValid } from "date-fns"

import { TableName } from "@/lib/utils"
import { MainDataTable } from "@/components/table/table-main"

interface CurrencyLocalDtsTableProps {
  data: ICurrencyLocalDt[]
  isLoading?: boolean
  onSelect?: (localDt: ICurrencyLocalDt | null) => void
  onDelete?: (id: string) => void
  onEdit?: (localDt: ICurrencyLocalDt) => void
  onCreate?: () => void
  onRefresh?: () => void
  onFilterChange?: (filters: { search?: string; sortOrder?: string }) => void
  moduleId?: number
  transactionId?: number
  // Permission props
  canView?: boolean
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

export function CurrencyLocalDtsTable({
  data,
  isLoading = false,
  onSelect,
  onDelete,
  onEdit,
  onCreate,
  onRefresh,
  onFilterChange,
  moduleId,
  transactionId,
  // Permission props
  canView = true,
  canCreate = true,
  canEdit = true,
  canDelete = true,
}: CurrencyLocalDtsTableProps) {
  const { decimals } = useAuthStore()
  const dateFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy"
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const exhRateDec = decimals[0]?.exhRateDec || 9

  const columns: ColumnDef<ICurrencyLocalDt>[] = [
    {
      accessorKey: "currencyName",
      header: "Currency Name",
      size: 200,
      minSize: 50,
      enableColumnFilter: true,
    },
    {
      accessorKey: "exhRate",
      header: "Exchange Rate",
      size: 200,
      minSize: 50,
      enableColumnFilter: true,
      cell: ({ row }) => {
        const value = row.getValue("exhRate") as number
        return value?.toFixed(exhRateDec) || "-"
      },
    },
    {
      accessorKey: "validFrom",
      header: "Valid From",
      cell: ({ row }) => {
        const raw = row.getValue("validFrom")
        let date: Date | null = null
        if (typeof raw === "string") {
          date = new Date(raw)
        } else if (raw instanceof Date) {
          date = raw
        }
        return date && isValid(date) ? format(date, dateFormat) : "-"
      },
      size: 120,
      minSize: 50,
    },
    {
      accessorKey: "createBy",
      header: "Create By",
      cell: ({ row }) => <div>{row.getValue("createBy") || "-"}</div>,
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
      cell: ({ row }) => <div>{row.getValue("editBy") || "-"}</div>,
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

  return (
    <MainDataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      moduleId={moduleId}
      transactionId={transactionId}
      tableName={TableName.currency_dt}
      emptyMessage="No currency local details found."
      accessorId="currencyId"
      // Add handlers if provided
      onRefresh={onRefresh}
      onFilterChange={onFilterChange}
      //handler column props
      onItemSelect={onSelect}
      onCreateItem={onCreate}
      onEditItem={onEdit}
      onDeleteItem={onDelete}
      //show props
      showHeader={true}
      showFooter={true}
      showActions={true}
      // Permission props
      canView={canView}
      canCreate={canCreate}
      canEdit={canEdit}
      canDelete={canDelete}
    />
  )
}
