"use client"

import { useEffect } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IAgencyRemuneration } from "@/interfaces/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format, isValid } from "date-fns"

import { JobOrder_AgencyRemuneration } from "@/lib/api-routes"
import { TableName } from "@/lib/utils"
import { useGet } from "@/hooks/use-common"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BasicTable } from "@/components/table/table-basic"

interface AgencyRemunerationHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobOrderId: number
  agencyRemunerationId: number
  agencyRemunerationIdDisplay?: number
}

export function AgencyRemunerationHistoryDialog({
  open,
  onOpenChange,
  jobOrderId,
  agencyRemunerationId,
  agencyRemunerationIdDisplay,
}: AgencyRemunerationHistoryDialogProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  // Fetch history data
  const {
    data: historyResponse,
    isLoading,
    refetch,
  } = useGet<IAgencyRemuneration>(
    `${JobOrder_AgencyRemuneration.getByIdHistory}/${jobOrderId}/${agencyRemunerationId}`,
    "agencyRemunerationHistory"
  )

  // Destructure with fallback values
  const { data: historyData } =
    (historyResponse as ApiResponse<IAgencyRemuneration>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // Define columns for the history table
  const columns: ColumnDef<IAgencyRemuneration>[] = [
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
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const dateValue = row.getValue("date")
        if (!dateValue) return <div>-</div>

        const date = new Date(dateValue as string)
        return (
          <div className="text-center">
            {isValid(date) ? format(date, "dd/MM/yyyy") : "-"}
          </div>
        )
      },
      size: 120,
      minSize: 100,
    },
    {
      accessorKey: "chargeName",
      header: "Charge",
      cell: ({ row }) => (
        <div className="max-w-xs truncate">
          {row.getValue("chargeName") || "-"}
        </div>
      ),
      size: 150,
      minSize: 120,
    },
    {
      accessorKey: "totAmt",
      header: "Total Amount",
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {typeof row.getValue("totAmt") === "number"
            ? (row.getValue("totAmt") as number).toFixed(2)
            : "0.00"}
        </div>
      ),
      size: 130,
      minSize: 100,
    },
    {
      accessorKey: "gstAmt",
      header: "GST Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {typeof row.getValue("gstAmt") === "number"
            ? (row.getValue("gstAmt") as number).toFixed(2)
            : "0.00"}
        </div>
      ),
      size: 120,
      minSize: 100,
    },
    {
      accessorKey: "totAmtAftGst",
      header: "Total After GST",
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {typeof row.getValue("totAmtAftGst") === "number"
            ? (row.getValue("totAmtAftGst") as number).toFixed(2)
            : "0.00"}
        </div>
      ),
      size: 140,
      minSize: 120,
    },
    {
      accessorKey: "statusName",
      header: "Status",
      cell: ({ row }) => (
        <div className="text-center">
          <Badge variant="outline">{row.getValue("statusName") || "-"}</Badge>
        </div>
      ),
      size: 100,
      minSize: 80,
    },
    {
      accessorKey: "debitNoteNo",
      header: "Debit Note",
      cell: ({ row }) => {
        const debitNoteNo = row.getValue("debitNoteNo")
        return (
          <div className="text-center">
            {debitNoteNo ? (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                {debitNoteNo}
              </Badge>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        )
      },
      size: 120,
      minSize: 100,
    },
    {
      accessorKey: "glName",
      header: "GL Account",
      cell: ({ row }) => (
        <div className="max-w-xs truncate">{row.getValue("glName") || "-"}</div>
      ),
      size: 150,
      minSize: 120,
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ row }) => (
        <div className="max-w-xs truncate">
          {row.getValue("remarks") || "-"}
        </div>
      ),
      size: 200,
      minSize: 150,
    },
    {
      accessorKey: "createBy",
      header: "Create By",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("createBy") || "-"}</div>
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
        <div className="text-center">{row.getValue("editBy") || "-"}</div>
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
  ]

  // Refetch data when dialog opens
  useEffect(() => {
    if (open) {
      refetch()
    }
  }, [open, refetch])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[80vh] w-[60vw] !max-w-none overflow-y-auto"
        onPointerDownOutside={(e) => {
          e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>Agency Remuneration History</DialogTitle>
          <DialogDescription>
            View version history for Agency Remuneration ID:{" "}
            {agencyRemunerationIdDisplay || agencyRemunerationId}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <BasicTable<IAgencyRemuneration>
            data={historyData || []}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No history found for this agency remuneration."
            tableName={TableName.agencyRemuneration}
            showHeader={false}
            showFooter={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AgencyRemunerationHistoryDialog
