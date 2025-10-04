"use client"

import { useMemo, useState } from "react"
import { ICrewSignOff, ICrewSignOffFilter } from "@/interfaces/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format, isValid } from "date-fns"

import { TableName } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { TaskTable } from "@/components/table/table-task"

import CrewSignOffHistoryDialog from "../services-history/crew-sign-off-history-dialog"

interface CrewSignOffTableProps {
  data: ICrewSignOff[]
  isLoading?: boolean
  onCrewSignOffSelect?: (crewSignOff: ICrewSignOff | undefined) => void
  onDeleteCrewSignOff?: (crewSignOffId: string) => void
  onEditCrewSignOff?: (crewSignOff: ICrewSignOff) => void
  onCreateCrewSignOff?: () => void
  onDebitNote?: (crewSignOffId: string, debitNoteNo?: string) => void
  onPurchase?: (crewSignOffId: string) => void
  onRefresh?: () => void
  onFilterChange?: (filters: ICrewSignOffFilter) => void
  moduleId?: number
  transactionId?: number
  onCombinedService?: (selectedIds: string[]) => void
  isConfirmed?: boolean
}

export function CrewSignOffTable({
  data,
  isLoading = false,
  onCrewSignOffSelect,
  onDeleteCrewSignOff,
  onEditCrewSignOff,
  onCreateCrewSignOff,
  onDebitNote,
  onPurchase,
  onRefresh,
  onFilterChange,
  moduleId,
  transactionId,
  onCombinedService,
  isConfirmed,
}: CrewSignOffTableProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  // State for history dialog
  const [historyDialog, setHistoryDialog] = useState<{
    isOpen: boolean
    jobOrderId: number
    crewSignOffId: number
    crewSignOffIdDisplay?: number
  }>({
    isOpen: false,
    jobOrderId: 0,
    crewSignOffId: 0,
    crewSignOffIdDisplay: 0,
  })

  // Handler to open history dialog
  const handleOpenHistory = (item: ICrewSignOff) => {
    setHistoryDialog({
      isOpen: true,
      jobOrderId: item.jobOrderId,
      crewSignOffId: item.crewSignOffId,
      crewSignOffIdDisplay: item.crewSignOffId,
    })
  }

  // Memoize columns to prevent infinite re-renders
  const columns: ColumnDef<ICrewSignOff>[] = useMemo(
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
        accessorKey: "crewName",
        header: "Crew Name",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("crewName") || "-"}</div>
        ),
        size: 200,
        minSize: 150,
        enableColumnFilter: true,
      },
      {
        accessorKey: "flightDetails",
        header: "Flight Details",
        cell: ({ row }) => (
          <div className="text-wrap">
            {row.getValue("flightDetails") || "-"}
          </div>
        ),
        size: 200,
        minSize: 150,
      },
      {
        accessorKey: "hotelName",
        header: "Hotel Name",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("hotelName") || "-"}</div>
        ),
        size: 200,
        minSize: 150,
      },
      {
        accessorKey: "departureDetails",
        header: "Departure Details",
        cell: ({ row }) => (
          <div className="text-wrap">
            {row.getValue("departureDetails") || "-"}
          </div>
        ),
        size: 200,
        minSize: 150,
      },
      {
        accessorKey: "transportName",
        header: "Transport Name",
        cell: ({ row }) => (
          <div className="text-wrap">
            {row.getValue("transportName") || "-"}
          </div>
        ),
        size: 200,
        minSize: 150,
      },
      {
        accessorKey: "clearing",
        header: "Clearing",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("clearing") || "-"}</div>
        ),
        size: 150,
        minSize: 120,
      },
      {
        accessorKey: "overStayRemark",
        header: "Over Stay Remark",
        cell: ({ row }) => (
          <div className="text-wrap">
            {row.getValue("overStayRemark") || "-"}
          </div>
        ),
        size: 200,
        minSize: 150,
      },
      {
        accessorKey: "modificationRemark",
        header: "Modification Remark",
        cell: ({ row }) => (
          <div className="text-wrap">
            {row.getValue("modificationRemark") || "-"}
          </div>
        ),
        size: 200,
        minSize: 150,
      },
      {
        accessorKey: "cidClearance",
        header: "CID Clearance",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("cidClearance") || "-"}</div>
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

  const handleItemSelect = (item: ICrewSignOff | null) => {
    if (onCrewSignOffSelect) {
      onCrewSignOffSelect(item || undefined)
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
        tableName={TableName.crewSignOff}
        emptyMessage="No crew sign offs found."
        accessorId="crewSignOffId"
        onRefresh={onRefresh}
        onFilterChange={handleFilterChange}
        onSelect={handleItemSelect}
        onCreate={onCreateCrewSignOff}
        onEdit={onEditCrewSignOff}
        onDelete={onDeleteCrewSignOff}
        onDebitNote={handleDebitNote}
        onPurchase={onPurchase}
        onCombinedService={onCombinedService}
        isConfirmed={isConfirmed}
        showHeader={true}
        showActions={true}
      />

      {/* History Dialog */}
      {historyDialog.isOpen && (
        <CrewSignOffHistoryDialog
          open={historyDialog.isOpen}
          onOpenChange={(isOpen) =>
            setHistoryDialog((prev) => ({ ...prev, isOpen }))
          }
          jobOrderId={historyDialog.jobOrderId}
          crewSignOffId={historyDialog.crewSignOffId}
          crewSignOffIdDisplay={historyDialog.crewSignOffIdDisplay}
        />
      )}
    </>
  )
}
