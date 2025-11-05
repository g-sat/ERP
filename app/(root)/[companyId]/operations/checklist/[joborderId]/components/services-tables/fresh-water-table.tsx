"use client"

import { useMemo, useState } from "react"
import { IFreshWater, IFreshWaterFilter } from "@/interfaces/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format, isValid } from "date-fns"

import { TableName } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { TaskTable } from "@/components/table/table-task"

import FreshWaterHistoryDialog from "../services-history/fresh-water-history-dialog"

interface FreshWaterTableProps {
  data: IFreshWater[]
  isLoading?: boolean
  onFreshWaterSelect?: (freshWater: IFreshWater | undefined) => void
  onDeleteFreshWater?: (freshWaterId: string) => void
  onEditFreshWater?: (freshWater: IFreshWater) => void
  onCreateFreshWater?: () => void
  onDebitNote?: (freshWaterId: string, debitNoteNo?: string) => void
  onPurchase?: (freshWaterId: string) => void
  onRefresh?: () => void
  onFilterChange?: (filters: IFreshWaterFilter) => void
  moduleId?: number
  transactionId?: number
  onCombinedService?: (selectedIds: string[]) => void
  isConfirmed?: boolean
}

export function FreshWaterTable({
  data,
  isLoading = false,
  onFreshWaterSelect,
  onDeleteFreshWater,
  onEditFreshWater,
  onCreateFreshWater,
  onDebitNote,
  onPurchase,
  onRefresh,
  onFilterChange,
  moduleId,
  transactionId,
  onCombinedService,
  isConfirmed,
}: FreshWaterTableProps) {
  const { decimals } = useAuthStore()
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  // State for history dialog
  const [historyDialog, setHistoryDialog] = useState<{
    isOpen: boolean
    jobOrderId: number
    freshWaterId: number
    freshWaterIdDisplay?: number
  }>({
    isOpen: false,
    jobOrderId: 0,
    freshWaterId: 0,
    freshWaterIdDisplay: 0,
  })

  // Handler to open history dialog
  const handleOpenHistory = (item: IFreshWater) => {
    setHistoryDialog({
      isOpen: true,
      jobOrderId: item.jobOrderId,
      freshWaterId: item.freshWaterId,
      freshWaterIdDisplay: item.freshWaterId,
    })
  }

  // Memoize columns to prevent infinite re-renders
  const columns: ColumnDef<IFreshWater>[] = useMemo(
    () => [
      {
        accessorKey: "debitNoteNo",
        header: "Debit Note No",
        size: 180,
        minSize: 130,
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
        accessorKey: "bargeName",
        header: "Barge Name",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("bargeName") || "-"}</div>
        ),
        size: 200,
        minSize: 150,
        enableColumnFilter: true,
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
        accessorKey: "operatorName",
        header: "Operator Name",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("operatorName") || "-"}</div>
        ),
        size: 200,
        minSize: 150,
        enableColumnFilter: true,
      },
      {
        accessorKey: "supplyBarge",
        header: "Supply Barge",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("supplyBarge") || "-"}</div>
        ),
        size: 200,
        minSize: 150,
        enableColumnFilter: true,
      },
      {
        accessorKey: "distance",
        header: "Distance",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("distance") || "-"}</div>
        ),
        size: 100,
        minSize: 80,
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
        accessorKey: "receiptNo",
        header: "Receipt No",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("receiptNo") || "-"}</div>
        ),
        size: 100,
        minSize: 80,
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
        accessorKey: "remarks",
        header: "Remarks",
        size: 200,
        minSize: 150,
      },
      {
        accessorKey: "editVersion",
        header: "Version",
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="text-center">
              <Badge
                variant="destructive"
                className="cursor-pointer transition-colors hover:bg-red-700"
                onClick={() => handleOpenHistory(item)}
                title="Click to view history"
              >
                {row.getValue("editVersion") || "0"}
              </Badge>
            </div>
          )
        },
        size: 70,
        minSize: 60,
        maxSize: 80,
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

  const handleItemSelect = (item: IFreshWater | null) => {
    if (onFreshWaterSelect) {
      onFreshWaterSelect(item || undefined)
    }
  }

  const handleDebitNote = (itemId: string, debitNoteNo?: string) => {
    if (onDebitNote) {
      onDebitNote(itemId, debitNoteNo || "")
    }
  }

  return (
    <>
      <TaskTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        moduleId={moduleId}
        transactionId={transactionId}
        tableName={TableName.freshWater}
        emptyMessage="No fresh water found."
        accessorId="freshWaterId"
        onRefresh={onRefresh}
        onFilterChange={handleFilterChange}
        onSelect={handleItemSelect}
        onCreate={onCreateFreshWater}
        onEdit={onEditFreshWater}
        onDelete={onDeleteFreshWater}
        onDebitNote={handleDebitNote}
        onPurchase={onPurchase}
        onCombinedService={onCombinedService}
        isConfirmed={isConfirmed}
        showHeader={true}
        showActions={true}
      />

      {/* History Dialog */}
      {historyDialog.isOpen && (
        <FreshWaterHistoryDialog
          open={historyDialog.isOpen}
          onOpenChange={(isOpen) =>
            setHistoryDialog((prev) => ({ ...prev, isOpen }))
          }
          jobOrderId={historyDialog.jobOrderId}
          freshWaterId={historyDialog.freshWaterId}
          freshWaterIdDisplay={historyDialog.freshWaterIdDisplay}
        />
      )}
    </>
  )
}
