"use client"

import { useMemo, useState } from "react"
import { ICrewSignOn, ICrewSignOnFilter } from "@/interfaces/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format, isValid } from "date-fns"

import { TableName } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { TaskTable } from "@/components/table/table-task"

import CrewSignOnHistoryDialog from "../services-history/crew-sign-on-history-dialog"

interface CrewSignOnTableProps {
  data: ICrewSignOn[]
  isLoading?: boolean
  onCrewSignOnSelect?: (crewSignOn: ICrewSignOn | undefined) => void
  onDeleteCrewSignOn?: (crewSignOnId: string) => void
  onEditCrewSignOn?: (crewSignOn: ICrewSignOn) => void
  onCreateCrewSignOn?: () => void
  onDebitNote?: (crewSignOnId: string, debitNoteNo?: string) => void
  onPurchase?: (crewSignOnId: string) => void
  onRefresh?: () => void
  onFilterChange?: (filters: ICrewSignOnFilter) => void
  moduleId?: number
  transactionId?: number
  onCombinedService?: (selectedIds: string[]) => void
  isConfirmed?: boolean
}

export function CrewSignOnTable({
  data,
  isLoading = false,
  onCrewSignOnSelect,
  onDeleteCrewSignOn,
  onEditCrewSignOn,
  onCreateCrewSignOn,
  onDebitNote,
  onPurchase,
  onRefresh,
  onFilterChange,
  moduleId,
  transactionId,
  onCombinedService,
  isConfirmed,
}: CrewSignOnTableProps) {
  const { decimals } = useAuthStore()
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  // State for history dialog
  const [historyDialog, setHistoryDialog] = useState<{
    isOpen: boolean
    jobOrderId: number
    crewSignOnId: number
    crewSignOnIdDisplay?: number
  }>({
    isOpen: false,
    jobOrderId: 0,
    crewSignOnId: 0,
    crewSignOnIdDisplay: 0,
  })

  // Handler to open history dialog
  const handleOpenHistory = (item: ICrewSignOn) => {
    setHistoryDialog({
      isOpen: true,
      jobOrderId: item.jobOrderId,
      crewSignOnId: item.crewSignOnId,
      crewSignOnIdDisplay: item.crewSignOnId,
    })
  }

  // Memoize columns to prevent infinite re-renders
  const columns: ColumnDef<ICrewSignOn>[] = useMemo(
    () => [
      {
        accessorKey: "debitNoteNo",
        header: "Debit Note No",
        size: 180,
        minSize: 130,
      },
      {
        accessorKey: "visaTypeName",
        header: "Visa Type",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("visaTypeName") || "-"}</div>
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
        accessorKey: "nationality",
        header: "Nationality",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("nationality") || "-"}</div>
        ),
        size: 200,
        minSize: 150,
        enableColumnFilter: true,
      },
      {
        accessorKey: "rankName",
        header: "Rank",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("rankName") || "-"}</div>
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
      },
      {
        accessorKey: "hotelName",
        header: "Hotel Name",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("hotelName") || "-"}</div>
        ),
      },
      {
        accessorKey: "departureDetails",
        header: "Departure Details",
        cell: ({ row }) => (
          <div className="text-wrap">
            {row.getValue("departureDetails") || "-"}
          </div>
        ),
      },
      {
        accessorKey: "transportName",
        header: "Transport Name",
        cell: ({ row }) => (
          <div className="text-wrap">
            {row.getValue("transportName") || "-"}
          </div>
        ),
      },
      {
        accessorKey: "clearing",
        header: "Clearing",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("clearing") || "-"}</div>
        ),
      },
      {
        accessorKey: "overStayRemark",
        header: "Over Stay Remark",
        cell: ({ row }) => (
          <div className="text-wrap">
            {row.getValue("overStayRemark") || "-"}
          </div>
        ),
      },
      {
        accessorKey: "modificationRemark",
        header: "Modification Remark",
        cell: ({ row }) => (
          <div className="text-wrap">
            {row.getValue("modificationRemark") || "-"}
          </div>
        ),
      },
      {
        accessorKey: "cidClearance",
        header: "CID Clearance",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("cidClearance") || "-"}</div>
        ),
        size: 200,
        minSize: 150,
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

  const handleItemSelect = (item: ICrewSignOn | null) => {
    if (onCrewSignOnSelect) {
      onCrewSignOnSelect(item || undefined)
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
        tableName={TableName.crewSignOn}
        emptyMessage="No crew sign ons found."
        accessorId="crewSignOnId"
        onRefresh={onRefresh}
        onFilterChange={handleFilterChange}
        onSelect={handleItemSelect}
        onCreate={onCreateCrewSignOn}
        onEdit={onEditCrewSignOn}
        onDelete={onDeleteCrewSignOn}
        onDebitNote={handleDebitNote}
        onPurchase={onPurchase}
        onCombinedService={onCombinedService}
        isConfirmed={isConfirmed}
        showHeader={true}
        showActions={true}
      />

      {/* History Dialog */}
      {historyDialog.isOpen && (
        <CrewSignOnHistoryDialog
          open={historyDialog.isOpen}
          onOpenChange={(isOpen) =>
            setHistoryDialog((prev) => ({ ...prev, isOpen }))
          }
          jobOrderId={historyDialog.jobOrderId}
          crewSignOnId={historyDialog.crewSignOnId}
          crewSignOnIdDisplay={historyDialog.crewSignOnIdDisplay}
        />
      )}
    </>
  )
}
