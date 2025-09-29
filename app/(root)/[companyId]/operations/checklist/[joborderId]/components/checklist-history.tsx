"use client"

import React, { useMemo } from "react"
import { IJobOrderHd } from "@/interfaces/checklist"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { JobOrder } from "@/lib/api-routes"
import { TableName } from "@/lib/utils"
import { useGet } from "@/hooks/use-common"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BasicTable } from "@/components/table/table-basic"

// History interface for job order history
interface IJobOrderHistory {
  editVersion: number
  editBy: string
  editDate: string | Date
  createBy: string
  createDate: string | Date
  statusName: string
  remarks?: string
  jobOrderNo: string
  vesselName: string
  portName: string
  customerName: string
}

interface ChecklistHistoryFormProps {
  jobData?: IJobOrderHd | null
  isConfirmed?: boolean
}

export function ChecklistHistory({
  jobData,
  isConfirmed = false,
}: ChecklistHistoryFormProps) {
  // Fetch history data
  const { data: historyResponse, isLoading: isHistoryLoading } =
    useGet<IJobOrderHistory>(
      jobData?.jobOrderId ? `${JobOrder.getHistory}/${jobData.jobOrderId}` : "",
      "jobOrderHistory",
      jobData?.jobOrderId ? jobData.jobOrderId.toString() : ""
    )

  const formatDate = (dateValue: string | Date | null | undefined) => {
    if (!dateValue) return "-"
    try {
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue)
      return format(date, "dd/MM/yyyy HH:mm")
    } catch {
      return "-"
    }
  }

  // Define columns for the history table
  const historyColumns: ColumnDef<IJobOrderHistory>[] = useMemo(
    () => [
      {
        accessorKey: "editVersion",
        header: "Version",
        cell: ({ row }) => (
          <Badge variant="secondary" className="text-xs">
            {row.getValue("editVersion")}
          </Badge>
        ),
        size: 80,
        minSize: 60,
        maxSize: 100,
      },
      {
        accessorKey: "editBy",
        header: "Modified By",
        cell: ({ row }) => (
          <span className="text-sm">{row.getValue("editBy") || "-"}</span>
        ),
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: "editDate",
        header: "Modified Date",
        cell: ({ row }) => (
          <span className="text-sm">
            {formatDate(row.getValue("editDate"))}
          </span>
        ),
        size: 150,
        minSize: 130,
        maxSize: 180,
      },
      {
        accessorKey: "statusName",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={
              row.getValue("statusName") === "Confirmed"
                ? "default"
                : "secondary"
            }
            className="text-xs"
          >
            {row.getValue("statusName")}
          </Badge>
        ),
        size: 100,
        minSize: 80,
        maxSize: 120,
      },
      {
        accessorKey: "vesselName",
        header: "Vessel",
        cell: ({ row }) => (
          <span className="text-sm">{row.getValue("vesselName") || "-"}</span>
        ),
        size: 150,
        minSize: 120,
        maxSize: 200,
      },
      {
        accessorKey: "portName",
        header: "Port",
        cell: ({ row }) => (
          <span className="text-sm">{row.getValue("portName") || "-"}</span>
        ),
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: "customerName",
        header: "Customer",
        cell: ({ row }) => (
          <span className="text-sm">{row.getValue("customerName") || "-"}</span>
        ),
        size: 150,
        minSize: 120,
        maxSize: 200,
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.getValue("remarks") || "-"}
          </span>
        ),
        size: 200,
        minSize: 150,
        maxSize: 300,
      },
    ],
    []
  )

  // Extract history data from response
  const historyData = historyResponse?.data || []

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Creation Information */}
            <div className="space-y-3">
              <h3 className="text-muted-foreground text-sm font-semibold">
                Creation Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Created By:</span>
                  <span className="text-sm">
                    {jobData?.createBy || "System"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Created Date:</span>
                  <span className="text-sm">
                    {formatDate(jobData?.createDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Information */}
            <div className="space-y-3">
              <h3 className="text-muted-foreground text-sm font-semibold">
                Last Modified
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Modified By:</span>
                  <span className="text-sm">
                    {jobData?.editBy || "Not modified"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Modified Date:</span>
                  <span className="text-sm">
                    {formatDate(jobData?.editDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardContent>
          <BasicTable
            data={historyData}
            columns={historyColumns}
            isLoading={isHistoryLoading}
            tableName={TableName.checklist}
            emptyMessage="No history records found."
            showHeader={true}
            showFooter={false}
          />
        </CardContent>
      </Card>
    </div>
  )
}
