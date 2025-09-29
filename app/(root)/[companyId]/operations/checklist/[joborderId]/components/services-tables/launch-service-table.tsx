"use client"

import { useMemo } from "react"
import { ILaunchService, ILaunchServiceFilter } from "@/interfaces/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format, isValid } from "date-fns"

import { TableName } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { TaskTable } from "@/components/table/table-task"

interface LaunchServiceTableProps {
  data: ILaunchService[]
  isLoading?: boolean
  onLaunchServiceSelect?: (launchService: ILaunchService | undefined) => void
  onDeleteLaunchService?: (launchServiceId: string) => void
  onEditLaunchService?: (launchService: ILaunchService) => void
  onCreateLaunchService?: () => void
  onDebitNote?: (launchServiceId: string, debitNoteNo?: string) => void
  onPurchase?: (launchServiceId: string) => void
  onRefresh?: () => void
  onFilterChange?: (filters: ILaunchServiceFilter) => void
  moduleId?: number
  transactionId?: number
  onCombinedService?: (selectedIds: string[]) => void
  isConfirmed?: boolean
}

export function LaunchServiceTable({
  data,
  isLoading = false,
  onLaunchServiceSelect,
  onDeleteLaunchService,
  onEditLaunchService,
  onCreateLaunchService,
  onDebitNote,
  onPurchase,
  onRefresh,
  onFilterChange,
  moduleId,
  transactionId,
  onCombinedService,
  isConfirmed,
}: LaunchServiceTableProps) {
  const { decimals } = useAuthStore()
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  // Memoize columns to prevent infinite re-renders
  const columns: ColumnDef<ILaunchService>[] = useMemo(
    () => [
      {
        accessorKey: "debitNoteNo",
        header: "Debit Note No",
        size: 180,
        minSize: 130,
      },
      {
        accessorKey: "date",
        header: "Service Date",
        cell: ({ row }) => {
          const raw = row.getValue("date")
          if (!raw) return "-"
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
        accessorKey: "uomName",
        header: "UOM",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("uomName") || "-"}</div>
        ),
        size: 100,
        minSize: 80,
        maxSize: 120,
      },
      {
        accessorKey: "ameTally",
        header: "AME Tally",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("ameTally") || "-"}</div>
        ),
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: "boatopTally",
        header: "Boat Operator Tally",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("boatopTally") || "-"}</div>
        ),
        size: 150,
        minSize: 120,
        maxSize: 200,
      },
      {
        accessorKey: "boatOperator",
        header: "Boat Operator",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("boatOperator") || "-"}</div>
        ),
        size: 150,
        minSize: 120,
        maxSize: 200,
      },
      {
        accessorKey: "distance",
        header: "Distance from Jetty",
        cell: ({ row }) => {
          const value = row.getValue("distance") as number
          return <div className="text-wrap">{value ? `${value} NM` : "-"}</div>
        },
        size: 150,
        minSize: 120,
        maxSize: 200,
      },
      {
        accessorKey: "deliveredWeight",
        header: "Cargo Delivered",
        cell: ({ row }) => {
          const value = row.getValue("deliveredWeight") as number
          return <div className="text-wrap">{value ? `${value} MT` : "-"}</div>
        },
        size: 150,
        minSize: 120,
        maxSize: 200,
      },
      {
        accessorKey: "landedWeight",
        header: "Cargo Landed",
        cell: ({ row }) => {
          const value = row.getValue("landedWeight") as number
          return <div className="text-wrap">{value ? `${value} MT` : "-"}</div>
        },
        size: 150,
        minSize: 120,
        maxSize: 200,
      },
      {
        accessorKey: "loadingTime",
        header: "Loading Time",
        cell: ({ row }) => {
          const raw = row.getValue("loadingTime")
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
        accessorKey: "leftJetty",
        header: "Left Jetty",
        cell: ({ row }) => {
          const raw = row.getValue("leftJetty")
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
        accessorKey: "waitingTime",
        header: "Waiting Time",
        cell: ({ row }) => {
          const value = row.getValue("waitingTime") as number
          return <div className="text-wrap">{value ? `${value} min` : "-"}</div>
        },
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: "alongsideVessel",
        header: "Alongside Vessel",
        cell: ({ row }) => {
          const raw = row.getValue("alongsideVessel")
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
        accessorKey: "departedFromVessel",
        header: "Departed Vessel",
        cell: ({ row }) => {
          const raw = row.getValue("departedFromVessel")
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
        accessorKey: "timeDiff",
        header: "Time Difference",
        cell: ({ row }) => {
          const value = row.getValue("timeDiff") as number
          return <div className="text-wrap">{value ? `${value} min` : "-"}</div>
        },
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: "arrivedAtJetty",
        header: "Arrived at Jetty",
        cell: ({ row }) => {
          const raw = row.getValue("arrivedAtJetty")
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
        accessorKey: "bargeName",
        header: "Barge Name",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("bargeName") || "-"}</div>
        ),
        size: 150,
        minSize: 120,
        maxSize: 200,
      },
      {
        accessorKey: "invoiceNo",
        header: "Invoice No",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("invoiceNo") || "-"}</div>
        ),
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
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("createBy") || "-"}</div>
        ),
        size: 120,
        minSize: 100,
        maxSize: 150,
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
        maxSize: 150,
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

  const handleItemSelect = (item: ILaunchService | null) => {
    if (onLaunchServiceSelect) {
      onLaunchServiceSelect(item || undefined)
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
      tableName={TableName.launchService}
      emptyMessage="No launch services found."
      accessorId="launchServiceId"
      onRefresh={onRefresh}
      onFilterChange={handleFilterChange}
      onSelect={handleItemSelect}
      onCreate={onCreateLaunchService}
      onEdit={onEditLaunchService}
      onDelete={onDeleteLaunchService}
      onDebitNote={handleDebitNote}
      onPurchase={onPurchase}
      onCombinedService={onCombinedService}
      isConfirmed={isConfirmed}
      showHeader={true}
      showActions={true}
    />
  )
}
