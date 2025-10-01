"use client"

import { useMemo, useState } from "react"
import {
  IConsignmentExport,
  IConsignmentExportFilter,
} from "@/interfaces/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format, isValid } from "date-fns"

import { TableName } from "@/lib/utils"
import { TaskTable } from "@/components/table/table-task"

import ConsignmentExportHistoryDialog from "../services-history/consignment-export-history-dialog"

interface ConsignmentExportTableProps {
  data: IConsignmentExport[]
  isLoading?: boolean
  onConsignmentExportSelect?: (
    consignmentExport: IConsignmentExport | undefined
  ) => void
  onDeleteConsignmentExport?: (consignmentExportId: string) => void
  onEditConsignmentExport?: (consignmentExport: IConsignmentExport) => void
  onCreateConsignmentExport?: () => void
  onDebitNote?: (consignmentExportId: string, debitNoteNo?: string) => void
  onPurchase?: (consignmentExportId: string) => void
  onRefresh?: () => void
  onFilterChange?: (filters: IConsignmentExportFilter) => void
  moduleId?: number
  transactionId?: number
  onCombinedService?: (selectedIds: string[]) => void
  isConfirmed?: boolean
}

export function ConsignmentExportTable({
  data,
  isLoading = false,
  onConsignmentExportSelect,
  onDeleteConsignmentExport,
  onEditConsignmentExport,
  onCreateConsignmentExport,
  onDebitNote,
  onPurchase,
  onRefresh,
  onFilterChange,
  moduleId,
  transactionId,
  onCombinedService,
  isConfirmed,
}: ConsignmentExportTableProps) {
  const { decimals } = useAuthStore()
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  // State for history dialog
  const [historyDialog, setHistoryDialog] = useState<{
    isOpen: boolean
    jobOrderId: number
    consignmentExportId: number
    consignmentExportIdDisplay?: number
  }>({
    isOpen: false,
    jobOrderId: 0,
    consignmentExportId: 0,
    consignmentExportIdDisplay: 0,
  })

  // Handler to open history dialog
  const _handleOpenHistory = (item: IConsignmentExport) => {
    setHistoryDialog({
      isOpen: true,
      jobOrderId: item.jobOrderId,
      consignmentExportId: item.consignmentExportId,
      consignmentExportIdDisplay: item.consignmentExportId,
    })
  }

  // Memoize columns to prevent infinite re-renders
  const columns: ColumnDef<IConsignmentExport>[] = useMemo(
    () => [
      {
        accessorKey: "debitNoteNo",
        header: "Debit Note No",
        size: 180,
        minSize: 130,
      },
      {
        accessorKey: "awbNo",
        header: "AWB No",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("awbNo") || "-"}</div>
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
        accessorKey: "carrierTypeName",
        header: "Carrier Type",
        cell: ({ row }) => (
          <div className="text-wrap">
            {row.getValue("carrierTypeName") || "-"}
          </div>
        ),
        size: 150,
        minSize: 120,
        enableColumnFilter: true,
      },
      {
        accessorKey: "consignmentTypeName",
        header: "Consignment Type",
        cell: ({ row }) => (
          <div className="text-wrap">
            {row.getValue("consignmentTypeName") || "-"}
          </div>
        ),
        size: 150,
        minSize: 120,
        enableColumnFilter: true,
      },
      {
        accessorKey: "weight",
        header: "Weight",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("weight") || "-"}</div>
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
        accessorKey: "pickupLocation",
        header: "Pickup Location",
        cell: ({ row }) => (
          <div className="text-wrap">
            {row.getValue("pickupLocation") || "-"}
          </div>
        ),
        size: 150,
        minSize: 120,
      },
      {
        accessorKey: "deliveryLocation",
        header: "Delivery Location",
        cell: ({ row }) => (
          <div className="text-wrap">
            {row.getValue("deliveryLocation") || "-"}
          </div>
        ),
        size: 150,
        minSize: 120,
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

  const handleItemSelect = (item: IConsignmentExport | null) => {
    if (onConsignmentExportSelect) {
      onConsignmentExportSelect(item || undefined)
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
        tableName={TableName.consignmentExport}
        emptyMessage="No consignment exports found."
        accessorId="consignmentExportId"
        onRefresh={onRefresh}
        onFilterChange={handleFilterChange}
        onSelect={handleItemSelect}
        onCreate={onCreateConsignmentExport}
        onEdit={onEditConsignmentExport}
        onDelete={onDeleteConsignmentExport}
        onDebitNote={handleDebitNote}
        onPurchase={onPurchase}
        onCombinedService={onCombinedService}
        isConfirmed={isConfirmed}
        showHeader={true}
        showActions={true}
      />

      {/* History Dialog */}
      {historyDialog.isOpen && (
        <ConsignmentExportHistoryDialog
          open={historyDialog.isOpen}
          onOpenChange={(isOpen) =>
            setHistoryDialog((prev) => ({ ...prev, isOpen }))
          }
          jobOrderId={historyDialog.jobOrderId}
          consignmentExportId={historyDialog.consignmentExportId}
          consignmentExportIdDisplay={historyDialog.consignmentExportIdDisplay}
        />
      )}
    </>
  )
}
