"use client"

import { useMemo } from "react"
import { IOtherService, IOtherServiceFilter } from "@/interfaces/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format, isValid } from "date-fns"

import { TableName } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { TaskTable } from "@/components/table/table-task"

interface OtherServiceTableProps {
  data: IOtherService[]
  isLoading?: boolean
  onOtherServiceSelect?: (otherService: IOtherService | undefined) => void
  onDeleteOtherService?: (otherServiceId: string) => void
  onEditOtherService?: (otherService: IOtherService) => void
  onCreateOtherService?: () => void
  onDebitNote?: (otherServiceId: string, debitNoteNo?: string) => void
  onPurchase?: (otherServiceId: string) => void
  onRefresh?: () => void
  onFilterChange?: (filters: IOtherServiceFilter) => void
  moduleId?: number
  transactionId?: number
  onCombinedService?: (selectedIds: string[]) => void
  isConfirmed?: boolean
}

export function OtherServiceTable({
  data,
  isLoading = false,
  onOtherServiceSelect,
  onDeleteOtherService,
  onEditOtherService,
  onCreateOtherService,
  onDebitNote,
  onPurchase,
  onRefresh,
  onFilterChange,
  moduleId,
  transactionId,
  onCombinedService,
  isConfirmed,
}: OtherServiceTableProps) {
  const { decimals } = useAuthStore()
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  // Memoize columns to prevent infinite re-renders
  const columns: ColumnDef<IOtherService>[] = useMemo(
    () => [
      {
        accessorKey: "debitNoteNo",
        header: "Debit Note No",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("debitNoteNo") || "-"}</div>
        ),
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => {
          const raw = row.getValue("date")
          let date: Date | null = null
          if (typeof raw === "string") {
            date = new Date(raw)
          } else if (raw instanceof Date) {
            date = raw
          }
          return (
            <div className="text-wrap">
              {date && isValid(date) ? format(date, dateFormat) : "-"}
            </div>
          )
        },
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: "chargeName",
        header: "Charge Name",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("chargeName") || "-"}</div>
        ),
        size: 200,
        minSize: 150,
        enableColumnFilter: true,
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("quantity") || "-"}</div>
        ),
        size: 100,
        minSize: 80,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("amount") || "-"}</div>
        ),
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: "uomName",
        header: "UOM",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("uomName") || "-"}</div>
        ),
        size: 100,
        minSize: 80,
      },
      {
        accessorKey: "statusName",
        header: "Status",
        cell: ({ row }) => (
          <div className="text-wrap">
            <Badge variant="default">{row.getValue("statusName") || "-"}</Badge>
          </div>
        ),
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("remarks") || "-"}</div>
        ),
        size: 200,
        minSize: 150,
      },
      {
        accessorKey: "createBy",
        header: "Create By",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("createBy") || "-"}</div>
        ),
        size: 120,
        minSize: 100,
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
          return (
            <div className="text-wrap">
              {date && isValid(date) ? format(date, datetimeFormat) : "-"}
            </div>
          )
        },
        size: 180,
        minSize: 150,
        maxSize: 200,
      },
      {
        accessorKey: "editBy",
        header: "Edit By",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("editBy") || "-"}</div>
        ),
        size: 120,
        minSize: 100,
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
          return (
            <div className="text-wrap">
              {date && isValid(date) ? format(date, datetimeFormat) : "-"}
            </div>
          )
        },
        size: 180,
        minSize: 150,
        maxSize: 200,
      },
      {
        accessorKey: "editVersion",
        header: "Edit Version",
        cell: ({ row }) => (
          <div className="text-wrap">
            <Badge variant="default">
              {row.getValue("editVersion") || "0"}
            </Badge>
          </div>
        ),
        size: 70,
        minSize: 60,
        maxSize: 80,
      },
    ],
    [dateFormat, datetimeFormat]
  )

  // Wrapper functions to handle type differences
  const handleFilterChange = (filters: {
    search?: string
    sortOrder?: string
  }) => {
    if (onFilterChange) {
      onFilterChange({
        search: filters.search,
        sortOrder: filters.sortOrder as "asc" | "desc" | undefined,
      })
    }
  }

  const handleItemSelect = (item: IOtherService | null) => {
    if (onOtherServiceSelect) {
      onOtherServiceSelect(item || undefined)
    }
  }

  const handleDebitNote = (itemId: string, debitNoteNo?: string) => {
    if (onDebitNote) {
      onDebitNote(itemId, debitNoteNo || "")
    }
  }

  return (
    <TaskTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      moduleId={moduleId}
      transactionId={transactionId}
      tableName={TableName.otherService}
      emptyMessage="No other services found."
      accessorId="otherServiceId"
      onRefresh={onRefresh}
      onFilterChange={handleFilterChange}
      onSelect={handleItemSelect}
      onCreate={onCreateOtherService}
      onEdit={onEditOtherService}
      onDelete={onDeleteOtherService}
      onDebitNote={handleDebitNote}
      onPurchase={onPurchase}
      onCombinedService={onCombinedService}
      isConfirmed={isConfirmed}
      showHeader={true}
      showActions={true}
    />
  )
}
