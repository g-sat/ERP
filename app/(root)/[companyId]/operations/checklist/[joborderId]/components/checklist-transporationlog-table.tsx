"use client"

import { useCallback, useMemo } from "react"
import { ITransportationLog } from "@/interfaces/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format, isValid, parse } from "date-fns"

import { clientDateFormat, parseDate } from "@/lib/date-utils"
import { TableName } from "@/lib/utils"
import { TaskTable } from "@/components/table/table-task"

interface TransportationLogTableProps {
  data: ITransportationLog[]
  isLoading?: boolean
  onTransportationLogSelect?: (
    transportationLog: ITransportationLog | null
  ) => void
  onDeleteTransportationLog?: (transportationLogId: string) => void
  onEditActionTransportationLog?: (
    transportationLog: ITransportationLog
  ) => void
  onCreateActionTransportationLog?: () => void
  onRefreshAction?: () => void
  moduleId?: number
  transactionId?: number
  isConfirmed?: boolean
}

export function TransportationLogTable({
  data,
  isLoading = false,
  onTransportationLogSelect,
  onDeleteTransportationLog,
  onEditActionTransportationLog,
  onCreateActionTransportationLog,
  onRefreshAction,
  moduleId,
  transactionId,
  isConfirmed,
}: TransportationLogTableProps) {
  const { decimals } = useAuthStore()
  const dateFormat = useMemo(
    () => decimals[0]?.dateFormat || clientDateFormat,
    [decimals]
  )

  const formatDateValue = useCallback(
    (value: unknown) => {
      if (!value) return "-"
      if (value instanceof Date) {
        return isNaN(value.getTime()) ? "-" : format(value, dateFormat)
      }
      if (typeof value === "string") {
        const parsed = parseDate(value) || parse(value, dateFormat, new Date())
        if (!parsed || !isValid(parsed)) {
          return value
        }
        return format(parsed, dateFormat)
      }
      return "-"
    },
    [dateFormat]
  )

  // Memoize columns to prevent infinite re-renders
  const columns: ColumnDef<ITransportationLog>[] = useMemo(
    () => [
      {
        accessorKey: "transportDate",
        header: "Transport Date",
        cell: ({ row }) => (
          <div className="text-wrap">
            {formatDateValue(row.getValue("transportDate"))}
          </div>
        ),
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: "serviceName",
        header: "Service",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("serviceName") || "-"}</div>
        ),
        size: 150,
        minSize: 120,
        enableColumnFilter: true,
      },
      {
        accessorKey: "chargeName",
        header: "Charge",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("chargeName") || "-"}</div>
        ),
        size: 150,
        minSize: 120,
      },
      {
        accessorKey: "fromLocation",
        header: "From Location",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("fromLocation") || "-"}</div>
        ),
        size: 150,
        minSize: 120,
        enableColumnFilter: true,
      },
      {
        accessorKey: "toLocation",
        header: "To Location",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("toLocation") || "-"}</div>
        ),
        size: 150,
        minSize: 120,
        enableColumnFilter: true,
      },
      {
        accessorKey: "transportModeName",
        header: "Transport Mode",
        cell: ({ row }) => (
          <div className="text-wrap">
            {row.getValue("transportModeName") || "-"}
          </div>
        ),
        size: 150,
        minSize: 120,
      },
      {
        accessorKey: "vehicleNo",
        header: "Vehicle No",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("vehicleNo") || "-"}</div>
        ),
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: "driverName",
        header: "Driver Name",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("driverName") || "-"}</div>
        ),
        size: 150,
        minSize: 120,
      },
      {
        accessorKey: "passengerCount",
        header: "Passengers",
        cell: ({ row }) => (
          <div className="text-center">
            {row.getValue("passengerCount") || 0}
          </div>
        ),
        size: 100,
        minSize: 80,
      },

      {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => (
          <div className="max-w-xs truncate text-wrap">
            {row.getValue("remarks") || "-"}
          </div>
        ),
        size: 200,
        minSize: 150,
      },
    ],
    [formatDateValue]
  )

  return (
    <TaskTable<ITransportationLog>
      data={data}
      columns={columns}
      isLoading={isLoading}
      tableName={TableName.checklist}
      accessorId="transportationLogId"
      onSelect={onTransportationLogSelect}
      onEditAction={onEditActionTransportationLog}
      onDeleteAction={onDeleteTransportationLog}
      onCreateAction={onCreateActionTransportationLog}
      onRefreshAction={onRefreshAction}
      moduleId={moduleId}
      transactionId={transactionId}
      isConfirmed={isConfirmed}
      emptyMessage="No transportation logs found."
    />
  )
}
