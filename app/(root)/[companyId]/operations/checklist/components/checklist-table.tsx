"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"
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
import { JobTable } from "@/components/table/table-job"

interface ChecklistTableProps {
  data: IJobOrderHd[]
  isLoading?: boolean
  selectedStatus?: string
  moduleId?: number
  transactionId?: number
  onCreateAction?: () => void
  onRefreshAction?: () => void
}

export function ChecklistTable({
  data,
  isLoading = false,
  selectedStatus = "All",
  moduleId,
  transactionId,
  onCreateAction,
  onRefreshAction,
}: ChecklistTableProps) {
  const params = useParams()
  const companyId = params.companyId as string
  const { decimals } = useAuthStore()
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

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
          const jobOrderId = row.original.jobOrderId
          return (
            <button
              onClick={() => {
                console.log("🚀 STEP 1: Job Order Click Initiated")
                console.log("📋 Job Order Details:", {
                  jobOrderNo: jobNo,
                  jobOrderId: jobOrderId,
                  companyId: companyId,
                })

                console.log("🔍 STEP 2: Building URL for new tab")
                const url = `/${companyId}/operations/checklist/${jobOrderId}`
                console.log("🌐 Final URL:", url)

                console.log("🔄 STEP 3: Opening new tab with window.open()")
                console.log("📝 Tab parameters:", {
                  url: url,
                  target: "_blank",
                  method: "window.open",
                })

                // Check current company ID before opening new tab
                const currentCompanyId =
                  useAuthStore.getState().currentCompany?.companyId
                const sessionStorageCompanyId =
                  sessionStorage.getItem("tab_company_id")
                console.log("🔍 Company ID state before new tab:", {
                  zustandStore: currentCompanyId,
                  sessionStorage: sessionStorageCompanyId,
                  urlCompanyId: companyId,
                })

                const newTab = window.open(url, "_blank")

                console.log("✅ STEP 4: New tab opened successfully")
                console.log("📊 Tab reference:", newTab)
                console.log(
                  "⚠️ POTENTIAL ISSUE: New tab might use old company ID until page loads"
                )
                console.log(
                  "💡 The new tab will get correct company ID after CompanyProvider runs"
                )
                console.log(
                  "🎯 Navigation completed - user can now work in new tab"
                )
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
          return date && isValid(date) ? format(date, datetimeFormat) : "-"
        },
      },
      {
        accessorKey: "etdDate",
        header: "ETD",
        cell: ({ row }) => {
          const date = row.original.etdDate
            ? new Date(row.original.etdDate)
            : null
          return date && isValid(date) ? format(date, datetimeFormat) : "-"
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
    [dateFormat, datetimeFormat, companyId]
  )

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
        onRefreshAction={onRefreshAction}
        onCreateAction={onCreateAction}
      />
    </div>
  )
}
