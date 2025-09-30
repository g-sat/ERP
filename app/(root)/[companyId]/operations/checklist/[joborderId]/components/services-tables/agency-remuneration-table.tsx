"use client"

import { useMemo, useState } from "react"
import {
  IAgencyRemuneration,
  IAgencyRemunerationFilter,
} from "@/interfaces/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format, isValid } from "date-fns"

import { TableName } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { TaskTable } from "@/components/table/table-task"

import AgencyRemunerationHistoryDialog from "../services-history/agency-remuneration-history-dialog"

interface AgencyRemunerationTableProps {
  data: IAgencyRemuneration[]
  isLoading?: boolean
  onAgencyRemunerationSelect?: (
    agencyRemuneration: IAgencyRemuneration | undefined
  ) => void
  onDeleteAgencyRemuneration?: (agencyRemunerationId: string) => void
  onEditAgencyRemuneration?: (agencyRemuneration: IAgencyRemuneration) => void
  onCreateAgencyRemuneration?: () => void
  onDebitNote?: (agencyRemunerationId: string, debitNoteNo?: string) => void
  onPurchase?: (agencyRemunerationId: string) => void
  onRefresh?: () => void
  onFilterChange?: (filters: IAgencyRemunerationFilter) => void
  moduleId?: number
  transactionId?: number
  onCombinedService?: (selectedIds: string[]) => void
  isConfirmed?: boolean
}

export function AgencyRemunerationTable({
  data,
  isLoading = false,
  onAgencyRemunerationSelect,
  onDeleteAgencyRemuneration,
  onEditAgencyRemuneration,
  onCreateAgencyRemuneration,
  onDebitNote,
  onPurchase,
  onRefresh,
  onFilterChange,
  moduleId,
  transactionId,
  onCombinedService,
  isConfirmed,
}: AgencyRemunerationTableProps) {
  const { decimals } = useAuthStore()
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  // State for history dialog
  const [historyDialog, setHistoryDialog] = useState<{
    isOpen: boolean
    jobOrderId: number
    agencyRemunerationId: number
    agencyRemunerationIdDisplay?: number
  }>({
    isOpen: false,
    jobOrderId: 0,
    agencyRemunerationId: 0,
    agencyRemunerationIdDisplay: 0,
  })

  // Handler to open history dialog
  const handleOpenHistory = (item: IAgencyRemuneration) => {
    setHistoryDialog({
      isOpen: true,
      jobOrderId: item.jobOrderId,
      agencyRemunerationId: item.agencyRemunerationId,
      agencyRemunerationIdDisplay: item.agencyRemunerationId,
    })
  }

  // Memoize columns to prevent infinite re-renders
  const columns: ColumnDef<IAgencyRemuneration>[] = useMemo(
    () => [
      {
        accessorKey: "debitNoteNo",
        header: "Debit Note No",
        size: 180,
        minSize: 130,
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

  const handleItemSelect = (item: IAgencyRemuneration | null) => {
    if (onAgencyRemunerationSelect) {
      onAgencyRemunerationSelect(item || undefined)
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
        tableName={TableName.agencyRemuneration}
        emptyMessage="No agency remunerations found."
        accessorId="agencyRemunerationId"
        onRefresh={onRefresh}
        onFilterChange={handleFilterChange}
        onSelect={handleItemSelect}
        onCreate={onCreateAgencyRemuneration}
        onEdit={onEditAgencyRemuneration}
        onDelete={onDeleteAgencyRemuneration}
        onDebitNote={handleDebitNote}
        onPurchase={onPurchase}
        onCombinedService={onCombinedService}
        isConfirmed={isConfirmed}
        showHeader={true}
        showActions={true}
      />

      {/* History Dialog */}
      {historyDialog.isOpen && (
        <AgencyRemunerationHistoryDialog
          open={historyDialog.isOpen}
          onOpenChange={(isOpen) =>
            setHistoryDialog((prev) => ({ ...prev, isOpen }))
          }
          jobOrderId={historyDialog.jobOrderId}
          agencyRemunerationId={historyDialog.agencyRemunerationId}
          agencyRemunerationIdDisplay={
            historyDialog.agencyRemunerationIdDisplay
          }
        />
      )}
    </>
  )
}
