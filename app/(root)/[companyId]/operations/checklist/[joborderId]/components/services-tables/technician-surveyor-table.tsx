"use client"

import { useMemo, useState } from "react"
import {
  ITechnicianSurveyor,
  ITechnicianSurveyorFilter,
} from "@/interfaces/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format, isValid } from "date-fns"

import { TableName } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { TaskTable } from "@/components/table/table-task"

import TechnicianSurveyorHistoryDialog from "../services-history/technician-surveyor-history-dialog"

interface TechnicianSurveyorTableProps {
  data: ITechnicianSurveyor[]
  isLoading?: boolean
  onTechnicianSurveyorSelect?: (
    technicianSurveyor: ITechnicianSurveyor | null
  ) => void
  onDeleteTechnicianSurveyor?: (technicianSurveyorId: string) => void
  onEditTechnicianSurveyor?: (technicianSurveyor: ITechnicianSurveyor) => void
  onCreateTechnicianSurveyor?: () => void
  onDebitNote?: (technicianSurveyorId: string, debitNoteNo?: string) => void
  onPurchase?: (technicianSurveyorId: string) => void
  onRefresh?: () => void
  onFilterChange?: (filters: ITechnicianSurveyorFilter) => void
  moduleId?: number
  transactionId?: number
  onCombinedService?: (selectedIds: string[]) => void
  isConfirmed?: boolean
}

export function TechnicianSurveyorTable({
  data,
  isLoading = false,
  onTechnicianSurveyorSelect,
  onDeleteTechnicianSurveyor,
  onEditTechnicianSurveyor,
  onCreateTechnicianSurveyor,
  onDebitNote,
  onPurchase,
  onRefresh,
  onFilterChange,
  moduleId,
  transactionId,
  onCombinedService,
  isConfirmed,
}: TechnicianSurveyorTableProps) {
  const { decimals } = useAuthStore()
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  // State for history dialog
  const [historyDialog, setHistoryDialog] = useState<{
    isOpen: boolean
    jobOrderId: number
    technicianSurveyorId: number
    technicianSurveyorIdDisplay?: number
  }>({
    isOpen: false,
    jobOrderId: 0,
    technicianSurveyorId: 0,
    technicianSurveyorIdDisplay: 0,
  })

  // Handler to open history dialog
  const handleOpenHistory = (item: ITechnicianSurveyor) => {
    setHistoryDialog({
      isOpen: true,
      jobOrderId: item.jobOrderId,
      technicianSurveyorId: item.technicianSurveyorId,
      technicianSurveyorIdDisplay: item.technicianSurveyorId,
    })
  }

  // Memoize columns to prevent infinite re-renders
  const columns: ColumnDef<ITechnicianSurveyor>[] = useMemo(
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
        accessorKey: "isTransport",
        header: "Transport",
        cell: ({ row }) => {
          const isTransport = row.getValue("isTransport") as boolean
          return (
            <div className="text-center">
              <Badge
                variant={isTransport ? "default" : "outline"}
                className={isTransport ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {isTransport ? "Yes" : "No"}
              </Badge>
            </div>
          )
        },
        size: 100,
        minSize: 80,
      },
      {
        accessorKey: "isHotel",
        header: "Hotel",
        cell: ({ row }) => {
          const isHotel = row.getValue("isHotel") as boolean
          return (
            <div className="text-center">
              <Badge
                variant={isHotel ? "default" : "outline"}
                className={isHotel ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                {isHotel ? "Yes" : "No"}
              </Badge>
            </div>
          )
        },
        size: 100,
        minSize: 80,
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("name") || "-"}</div>
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
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("quantity") || "-"}</div>
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
        accessorKey: "natureOfAttendance",
        header: "Nature of Attendance",
        cell: ({ row }) => (
          <div className="text-wrap">
            {row.getValue("natureOfAttendance") || "-"}
          </div>
        ),
        size: 200,
        minSize: 150,
      },
      {
        accessorKey: "companyInfo",
        header: "Company Info",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("companyInfo") || "-"}</div>
        ),
        size: 200,
        minSize: 150,
      },
      {
        accessorKey: "passTypeName",
        header: "Pass Type",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("passTypeName") || "-"}</div>
        ),
        size: 150,
        minSize: 120,
        enableColumnFilter: true,
      },
      {
        accessorKey: "embarked",
        header: "Embarked",
        cell: ({ row }) => {
          const raw = row.getValue("embarked")
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
        accessorKey: "disembarked",
        header: "Disembarked",
        cell: ({ row }) => {
          const raw = row.getValue("disembarked")
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
        accessorKey: "portRequestNo",
        header: "Port Request No",
        cell: ({ row }) => (
          <div className="text-wrap">
            {row.getValue("portRequestNo") || "-"}
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

  const handleItemSelect = (item: ITechnicianSurveyor | null) => {
    if (onTechnicianSurveyorSelect) {
      onTechnicianSurveyorSelect(item || null)
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
        tableName={TableName.techniciansSurveyors}
        emptyMessage="No technician surveyors found."
        accessorId="technicianSurveyorId"
        onRefresh={onRefresh}
        onFilterChange={handleFilterChange}
        onSelect={handleItemSelect}
        onCreate={onCreateTechnicianSurveyor}
        onEdit={onEditTechnicianSurveyor}
        onDelete={onDeleteTechnicianSurveyor}
        onDebitNote={handleDebitNote}
        onPurchase={onPurchase}
        onCombinedService={onCombinedService}
        isConfirmed={isConfirmed}
        showHeader={true}
        showActions={true}
      />

      {/* History Dialog */}
      {historyDialog.isOpen && (
        <TechnicianSurveyorHistoryDialog
          open={historyDialog.isOpen}
          onOpenChange={(isOpen) =>
            setHistoryDialog((prev) => ({ ...prev, isOpen }))
          }
          jobOrderId={historyDialog.jobOrderId}
          technicianSurveyorId={historyDialog.technicianSurveyorId}
          technicianSurveyorIdDisplay={
            historyDialog.technicianSurveyorIdDisplay
          }
        />
      )}
    </>
  )
}
