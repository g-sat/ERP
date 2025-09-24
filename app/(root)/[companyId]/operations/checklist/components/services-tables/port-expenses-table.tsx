"use client"

import { useMemo } from "react"
import { IPortExpenses, IPortExpensesFilter } from "@/interfaces/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format, isValid } from "date-fns"

import { TableName } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { TaskTable } from "@/components/table/table-task"

interface PortExpensesTableProps {
  data: IPortExpenses[]
  isLoading?: boolean
  onPortExpensesSelect?: (portExpenses: IPortExpenses | undefined) => void
  onDeletePortExpenses?: (portExpensesId: string) => void
  onEditPortExpenses?: (portExpenses: IPortExpenses) => void
  onCreatePortExpenses?: () => void
  onDebitNote?: (portExpenseId: string, debitNoteNo: string) => void
  onPurchase?: (portExpenseId: string) => void
  onRefresh?: () => void
  onFilterChange?: (filters: IPortExpensesFilter) => void
  moduleId?: number
  transactionId?: number
  onCombinedService?: (selectedIds: string[]) => void
  isConfirmed?: boolean
}

export function PortExpensesTable({
  data,
  isLoading = false,
  onPortExpensesSelect,
  onDeletePortExpenses,
  onEditPortExpenses,
  onCreatePortExpenses,
  onDebitNote,
  onPurchase,
  onRefresh,
  onFilterChange,
  moduleId,
  transactionId,
  onCombinedService,
  isConfirmed,
}: PortExpensesTableProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  // Memoize columns to prevent infinite re-renders
  const columns: ColumnDef<IPortExpenses>[] = useMemo(
    () => [
      {
        accessorKey: "debitNoteNo",
        header: "Debit Note No",
        size: 200,
        minSize: 140,
      },
      {
        accessorKey: "supplierName",
        header: "Supplier Name",
        size: 200,
        minSize: 150,

        enableColumnFilter: true,
      },
      {
        accessorKey: "chargeName",
        header: "Charge Name",
        size: 200,
        minSize: 150,

        enableColumnFilter: true,
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }) => (
          <div className="text-right">{row.getValue("quantity") || "-"}</div>
        ),
        size: 100,
        minSize: 80,
        maxSize: 120,
      },
      {
        accessorKey: "uomName",
        header: "UOM",
        size: 100,
        minSize: 80,
        maxSize: 120,
      },
      {
        accessorKey: "deliverDate",
        header: "Deliver Date",
        cell: ({ row }) => {
          const raw = row.getValue("deliverDate")
          if (!raw) return "-"
          let date: Date | null = null
          if (typeof raw === "string") {
            date = new Date(raw)
          } else if (raw instanceof Date) {
            date = raw
          }
          return (
            <div className="text-wrap">
              {date && isValid(date) ? format(date, "dd/MM/yyyy") : "-"}
            </div>
          )
        },
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        size: 200,
        minSize: 150,
      },
      {
        accessorKey: "statusName",
        header: "Status",
        cell: ({ row }) => (
          <div className="text-center">
            <Badge variant="default">{row.getValue("statusName") || "-"}</Badge>
          </div>
        ),
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: "editVersion",
        header: "Version",
        cell: ({ row }) => (
          <div className="text-center">
            <Badge variant="destructive">
              {row.getValue("editVersion") || "0"}
            </Badge>
          </div>
        ),
        size: 70,
        minSize: 60,
        maxSize: 80,
      },

      {
        accessorKey: "createBy",
        header: "Create By",

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
    ],
    [datetimeFormat]
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

  const handleItemSelect = (item: IPortExpenses | null) => {
    if (onPortExpensesSelect) {
      onPortExpensesSelect(item || undefined)
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
      tableName={TableName.portExpense}
      emptyMessage="No port expenses found."
      accessorId="portExpenseId"
      onRefresh={onRefresh}
      onFilterChange={handleFilterChange}
      onSelect={handleItemSelect}
      onCreate={onCreatePortExpenses}
      onEdit={onEditPortExpenses}
      onDelete={onDeletePortExpenses}
      onDebitNote={handleDebitNote}
      onPurchase={onPurchase}
      onCombinedService={onCombinedService}
      isConfirmed={isConfirmed}
      showHeader={true}
      showActions={true}
    />
  )
}
