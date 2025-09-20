"use client"

import { useMemo, useState } from "react"
import { IJobOrderHd } from "@/interfaces/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { OperationsStatus } from "@/lib/operations-utils"
import { TableName } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { JobTable } from "@/components/table/table-job"

import { ChecklistTabs } from "./checklist-tabs"

interface ChecklistTableProps {
  data: IJobOrderHd[]
  isLoading?: boolean
  selectedStatus?: string
  moduleId?: number
  transactionId?: number
}

export function ChecklistTable({
  data,
  isLoading = false,
  selectedStatus = "All",
  moduleId,
  transactionId,
}: ChecklistTableProps) {
  const { decimals } = useAuthStore()
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  const [selectedJob, setSelectedJob] = useState<IJobOrderHd | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Filter data based on selected status
  const filteredData = useMemo(() => {
    if (selectedStatus === "All") {
      return data
    }

    return data.filter((job: IJobOrderHd) => {
      switch (selectedStatus) {
        case "Pending":
          return job.statusName === OperationsStatus.Pending.toString()
        case "Completed":
          return job.statusName === OperationsStatus.Completed.toString()
        case "Cancelled":
          return job.statusName === OperationsStatus.Cancelled.toString()
        case "Cancel With Service":
          return (
            job.statusName === OperationsStatus.CancelWithService.toString()
          )
        case "Confirmed":
          return job.statusName === OperationsStatus.Confirmed.toString()
        case "Posted":
          return job.statusName === OperationsStatus.Post.toString()
        default:
          return true
      }
    })
  }, [data, selectedStatus])

  // Memoize columns to prevent infinite re-renders
  const columns: ColumnDef<IJobOrderHd>[] = useMemo(
    () => [
      {
        accessorKey: "jobOrderNo",
        header: "Job No",
        cell: ({ row }) => {
          const jobNo = row.getValue("jobOrderNo") as string
          return (
            <button
              onClick={() => {
                setSelectedJob(row.original)
                setIsDetailsOpen(true)
              }}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {jobNo}
            </button>
          )
        },
      },
      {
        accessorKey: "jobOrderDate",
        header: "Date",
        cell: ({ row }) => {
          const date = row.original.jobOrderDate
            ? new Date(row.original.jobOrderDate)
            : null
          return date ? format(date, dateFormat) : "-"
        },
      },
      {
        accessorKey: "customerName",
        header: "Customer",
      },
      {
        accessorKey: "currencyName",
        header: "Curr.",
      },
      {
        accessorKey: "vesselName",
        header: "Vessel",
      },
      {
        accessorKey: "statusName",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("statusName") as string
          const statusColors: Record<string, string> = {
            Pending: "bg-yellow-100 text-yellow-800",
            Completed: "bg-blue-100 text-blue-800",
            Cancelled: "bg-red-100 text-red-800",
            "Cancel with Service": "bg-orange-100 text-orange-800",
            Confirmed: "bg-green-100 text-green-800",
            Posted: "bg-purple-100 text-purple-800",
            Delivered: "bg-green-100 text-green-800",
            Approved: "bg-blue-100 text-blue-800",
          }
          return (
            <Badge
              className={`px-2 py-1 text-xs font-semibold ${statusColors[status] || "bg-gray-100 text-gray-800"}`}
            >
              {status}
            </Badge>
          )
        },
      },
      {
        accessorKey: "etaDate",
        header: "ETA",
        cell: ({ row }) => {
          const date = row.original.etaDate
            ? new Date(row.original.etaDate)
            : null
          return date ? format(date, dateFormat) : "-"
        },
      },
      {
        accessorKey: "etdDate",
        header: "ETD",
        cell: ({ row }) => {
          const date = row.original.etdDate
            ? new Date(row.original.etdDate)
            : null
          return date ? format(date, dateFormat) : "-"
        },
      },
      {
        accessorKey: "vesselDistance",
        header: "Dist. In.",
      },
      {
        accessorKey: "portName",
        header: "Port",
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
      },
      {
        accessorKey: "editVersion",
        header: "Version",
        cell: ({ row }) => {
          const version = row.getValue("editVersion")
          const variant: "default" | "secondary" | "destructive" | "outline" =
            "secondary"
          return (
            <Badge
              variant={variant}
              className="px-2 py-1 text-xs font-semibold"
            >
              {version ? String(version) : "0"}
            </Badge>
          )
        },
        size: 80,
        minSize: 60,
        maxSize: 100,
      },
    ],
    [dateFormat]
  )

  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800",
    Confirmed: "bg-green-100 text-green-800",
    Completed: "bg-blue-100 text-blue-800",
    Cancelled: "bg-red-100 text-red-800",
  }

  return (
    <div>
      <JobTable
        data={filteredData}
        columns={columns}
        isLoading={isLoading}
        moduleId={moduleId}
        transactionId={transactionId}
        tableName={TableName.checklist}
        emptyMessage="No job orders found."
        accessorId="jobOrderId"
        onRefresh={() => {}}
        onFilterChange={() => {}}
        onSelect={() => {}}
      />

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent
          className="@container h-[95vh] w-[90vw] !max-w-none overflow-y-auto p-0"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="px-6 pt-2 pb-0">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <DialogTitle>
                  <div className="text-foreground text-2xl font-bold tracking-tight">
                    Job Order Details :{" "}
                    <span
                      className={`ml-auto rounded-full px-5 py-1 text-sm font-medium ${statusColors[selectedJob?.statusName as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}`}
                    >
                      {selectedJob?.statusName}
                    </span>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  View and manage job order details and their associated
                  services.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {selectedJob && (
            <div className="px-4 pt-0 pb-0">
              <ChecklistTabs
                key={`${selectedJob.jobOrderId}-${selectedJob.jobOrderNo}`}
                jobData={selectedJob}
                onSuccess={() => {
                  // Don't close the dialog after successful save
                  // setIsDetailsOpen(false)
                }}
                isEdit={true}
                isNewRecord={false}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
