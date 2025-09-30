"use client"

import { useMemo, useState } from "react"
import { IEquipmentUsed, IEquipmentUsedFilter } from "@/interfaces/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format, isValid } from "date-fns"

import { TableName } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { TaskTable } from "@/components/table/table-task"

import EquipmentUsedHistoryDialog from "../services-history/equipment-used-history-dialog"

interface EquipmentUsedTableProps {
  data: IEquipmentUsed[]
  isLoading?: boolean
  onEquipmentUsedSelect?: (equipmentUsed: IEquipmentUsed | undefined) => void
  onDeleteEquipmentUsed?: (equipmentUsedId: string) => void
  onEditEquipmentUsed?: (equipmentUsed: IEquipmentUsed) => void
  onCreateEquipmentUsed?: () => void
  onDebitNote?: (equipmentUsedId: string, debitNoteNo?: string) => void
  onPurchase?: (equipmentUsedId: string) => void
  onRefresh?: () => void
  onFilterChange?: (filters: IEquipmentUsedFilter) => void
  moduleId?: number
  transactionId?: number
  onCombinedService?: (selectedIds: string[]) => void
  isConfirmed?: boolean
}

export function EquipmentUsedTable({
  data,
  isLoading = false,
  onEquipmentUsedSelect,
  onDeleteEquipmentUsed,
  onEditEquipmentUsed,
  onCreateEquipmentUsed,
  onDebitNote,
  onPurchase,
  onRefresh,
  onFilterChange,
  moduleId,
  transactionId,
  onCombinedService,
  isConfirmed,
}: EquipmentUsedTableProps) {
  const { decimals } = useAuthStore()
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  // State for history dialog
  const [historyDialog, setHistoryDialog] = useState<{
    isOpen: boolean
    jobOrderId: number
    equipmentUsedId: number
    equipmentUsedIdDisplay?: number
  }>({
    isOpen: false,
    jobOrderId: 0,
    equipmentUsedId: 0,
    equipmentUsedIdDisplay: 0,
  })

  // Handler to open history dialog
  const handleOpenHistory = (item: IEquipmentUsed) => {
    setHistoryDialog({
      isOpen: true,
      jobOrderId: item.jobOrderId,
      equipmentUsedId: item.equipmentUsedId,
      equipmentUsedIdDisplay: item.equipmentUsedId,
    })
  }

  // Memoize columns to prevent infinite re-renders
  const columns: ColumnDef<IEquipmentUsed>[] = useMemo(
    () => [
      {
        accessorKey: "debitNoteNo",
        header: "Debit Note No",
        size: 180,
        minSize: 130,
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
        accessorKey: "referenceNo",
        header: "Reference No",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("referenceNo") || "-"}</div>
        ),
        size: 150,
        minSize: 120,
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
        accessorKey: "mafi",
        header: "MAFI",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("mafi") || "-"}</div>
        ),
        size: 150,
        minSize: 120,
      },
      {
        accessorKey: "others",
        header: "Others",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("others") || "-"}</div>
        ),
        size: 150,
        minSize: 120,
      },
      {
        accessorKey: "craneChargeName",
        header: "Crane Charge",
        cell: ({ row }) => (
          <div className="text-wrap">
            {row.getValue("craneChargeName") || "-"}
          </div>
        ),
        size: 150,
        minSize: 120,
      },
      {
        accessorKey: "forkliftChargeName",
        header: "Forklift Charge",
        cell: ({ row }) => (
          <div className="text-wrap">
            {row.getValue("forkliftChargeName") || "-"}
          </div>
        ),
        size: 150,
        minSize: 120,
      },
      {
        accessorKey: "stevedoreChargeName",
        header: "Stevedore Charge",
        cell: ({ row }) => (
          <div className="text-wrap">
            {row.getValue("stevedoreChargeName") || "-"}
          </div>
        ),
        size: 150,
        minSize: 120,
      },
      {
        accessorKey: "loadingRefNo",
        header: "Loading Ref No",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("loadingRefNo") || "-"}</div>
        ),
        size: 150,
        minSize: 120,
      },
      {
        accessorKey: "offloadingRefNo",
        header: "Offloading Ref No",
        cell: ({ row }) => (
          <div className="text-wrap">
            {row.getValue("offloadingRefNo") || "-"}
          </div>
        ),
        size: 150,
        minSize: 120,
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

  const handleItemSelect = (item: IEquipmentUsed | null) => {
    if (onEquipmentUsedSelect) {
      onEquipmentUsedSelect(item || undefined)
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
        tableName={TableName.equipmentUsed}
        emptyMessage="No equipment used found."
        accessorId="equipmentUsedId"
        onRefresh={onRefresh}
        onFilterChange={handleFilterChange}
        onSelect={handleItemSelect}
        onCreate={onCreateEquipmentUsed}
        onEdit={onEditEquipmentUsed}
        onDelete={onDeleteEquipmentUsed}
        onDebitNote={handleDebitNote}
        onPurchase={onPurchase}
        onCombinedService={onCombinedService}
        isConfirmed={isConfirmed}
        showHeader={true}
        showActions={true}
      />

      {/* History Dialog */}
      {historyDialog.isOpen && (
        <EquipmentUsedHistoryDialog
          open={historyDialog.isOpen}
          onOpenChange={(isOpen) =>
            setHistoryDialog((prev) => ({ ...prev, isOpen }))
          }
          jobOrderId={historyDialog.jobOrderId}
          equipmentUsedId={historyDialog.equipmentUsedId}
          equipmentUsedIdDisplay={historyDialog.equipmentUsedIdDisplay}
        />
      )}
    </>
  )
}
