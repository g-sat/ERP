"use client"

import { useMemo, useState } from "react"
import { IJobOrderHd } from "@/interfaces/checklist"
import { useAuthStore } from "@/stores/auth-store"
import {
  IconCircleCheckFilled,
  IconSquareRoundedXFilled,
} from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { format, isValid } from "date-fns"

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
  onCreate?: () => void
  onRefresh?: () => void
}

export function ChecklistTable({
  data,
  isLoading = false,
  selectedStatus = "All",
  moduleId,
  transactionId,
  onCreate,
  onRefresh,
}: ChecklistTableProps) {
  const { decimals } = useAuthStore()
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
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
        size: 150,
        minSize: 120,
        maxSize: 180,
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
        size: 100,
        minSize: 80,
      },
      {
        accessorKey: "customerName",
        header: "Customer",
        size: 180,
        minSize: 140,
      },
      {
        accessorKey: "currencyCode",
        header: "Curr.",
        size: 50,
        minSize: 50,
      },
      {
        accessorKey: "portName",
        header: "Port",
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: "vesselName",
        header: "Vessel",
        size: 140,
        minSize: 100,
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
              className={`px-1.5 py-0.5 text-xs font-medium ${statusColors[status] || "bg-gray-100 text-gray-800"}`}
            >
              {status}
            </Badge>
          )
        },
        size: 120,
        minSize: 80,
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
        size: 80,
        minSize: 60,
      },

      {
        accessorKey: "remarks",
        header: "Remarks",
        size: 150,
        minSize: 50,
      },
      {
        accessorKey: "lastPortName",
        header: "Last Port",
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: "nextPortName",
        header: "Next Port",
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: "istaxable",
        header: "Tax",
        cell: ({ row }) => (
          <Badge
            variant={row.getValue("istaxable") ? "default" : "destructive"}
          >
            {row.getValue("istaxable") ? (
              <IconCircleCheckFilled className="mr-1 fill-green-500 dark:fill-green-400" />
            ) : (
              <IconSquareRoundedXFilled className="mr-1 fill-red-500 dark:fill-red-400" />
            )}
            {row.getValue("istaxable") ? "Yes" : "No"}
          </Badge>
        ),
        size: 120,
        minSize: 50,
      },
      {
        accessorKey: "isPost",
        header: "Post",
        cell: ({ row }) => (
          <Badge variant={row.getValue("isPost") ? "default" : "destructive"}>
            {row.getValue("isPost") ? (
              <IconCircleCheckFilled className="mr-1 fill-green-500 dark:fill-green-400" />
            ) : (
              <IconSquareRoundedXFilled className="mr-1 fill-red-500 dark:fill-red-400" />
            )}
            {row.getValue("isPost") ? "Yes" : "No"}
          </Badge>
        ),
        size: 120,
        minSize: 50,
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.getValue("isActive") ? "default" : "destructive"}>
            {row.getValue("isActive") ? (
              <IconCircleCheckFilled className="mr-1 fill-green-500 dark:fill-green-400" />
            ) : (
              <IconSquareRoundedXFilled className="mr-1 fill-red-500 dark:fill-red-400" />
            )}
            {row.getValue("isActive") ? "Active" : "Inactive"}
          </Badge>
        ),
        size: 120,
        minSize: 50,
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
      {
        accessorKey: "createBy",
        header: "Create By",
        size: 120,
        minSize: 50,
      },
      {
        accessorKey: "createDate",
        header: "Create Date",
        cell: ({ row }) => {
          const raw = row.getValue("createDate")
          let date: Date | null = null
          if (typeof raw === "string") date = new Date(raw)
          else if (raw instanceof Date) date = raw
          return date && isValid(date) ? format(date, datetimeFormat) : "-"
        },
        size: 180,
        minSize: 150,
      },
      {
        accessorKey: "editBy",
        header: "Edit By",
        size: 120,
        minSize: 50,
      },
      {
        accessorKey: "editDate",
        header: "Edit Date",
        cell: ({ row }) => {
          const raw = row.getValue("editDate")
          let date: Date | null = null
          if (typeof raw === "string") date = new Date(raw)
          else if (raw instanceof Date) date = raw
          return date && isValid(date) ? format(date, datetimeFormat) : "-"
        },
        size: 180,
        minSize: 150,
      },
    ],
    [dateFormat, datetimeFormat]
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
        onRefresh={onRefresh}
        onCreate={onCreate}
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
