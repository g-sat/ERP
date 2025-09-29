"use client"

import { useMemo } from "react"
import { IDebitNoteDt } from "@/interfaces/checklist"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { TableName } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DebitNoteBaseTable } from "@/components/table/table-debitnote"

interface DebitNoteTableProps {
  data: IDebitNoteDt[]
  isLoading?: boolean
  onSelect?: (debitNote: IDebitNoteDt | null) => void
  onDelete?: (debitNoteId: string) => void
  onBulkDelete?: (selectedIds: string[]) => void
  onEdit?: (debitNote: IDebitNoteDt) => void
  onCreate?: () => void
  onRefresh?: () => void
  onFilterChange?: (filters: { search?: string; sortOrder?: string }) => void
  moduleId?: number
  transactionId?: number
  isConfirmed?: boolean
}

export function DebitNoteTable({
  data,
  isLoading = false,
  onSelect,
  onDelete,
  onBulkDelete,
  onEdit,
  onCreate,
  onRefresh,
  onFilterChange,
  moduleId,
  transactionId,
  isConfirmed,
}: DebitNoteTableProps) {
  // Define columns for the debit note table
  const columns: ColumnDef<IDebitNoteDt>[] = useMemo(
    () => [
      {
        accessorKey: "itemNo",
        header: ({ column }) => (
          <div className="flex items-center gap-2">
            <span>Item No</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right font-medium">
            {row.getValue("itemNo") || "-"}
          </div>
        ),
        size: 80,
        minSize: 60,
        maxSize: 100,
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
        accessorKey: "qty",
        header: "Quantity",
        cell: ({ row }) => (
          <div className="text-right">{row.getValue("qty") || "0"}</div>
        ),
        size: 100,
        minSize: 80,
        maxSize: 120,
      },
      {
        accessorKey: "unitPrice",
        header: "Unit Price",
        cell: ({ row }) => (
          <div className="text-right">
            {typeof row.getValue("unitPrice") === "number"
              ? (row.getValue("unitPrice") as number).toFixed(2)
              : "0.00"}
          </div>
        ),
        size: 120,
        minSize: 100,
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
        accessorKey: "gstPercentage",
        header: "GST %",
        cell: ({ row }) => (
          <div className="text-right">
            {typeof row.getValue("gstPercentage") === "number"
              ? `${row.getValue("gstPercentage") as number}%`
              : "0%"}
          </div>
        ),
        size: 80,
        minSize: 60,
        maxSize: 100,
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
        accessorKey: "totAftGstAmt",
        header: "Total After GST",
        cell: ({ row }) => (
          <div className="text-right font-medium">
            {typeof row.getValue("totAftGstAmt") === "number"
              ? (row.getValue("totAftGstAmt") as number).toFixed(2)
              : "0.00"}
          </div>
        ),
        size: 140,
        minSize: 120,
        maxSize: 160,
      },
      {
        accessorKey: "editVersion",
        header: "Version",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Badge
              variant="secondary"
              className="flex items-center justify-center rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white"
            >
              {row.getValue("editVersion") || "0"}
            </Badge>
          </div>
        ),
        size: 80,
        minSize: 60,
        maxSize: 100,
      },
    ],
    [] // No dependencies needed since column definitions don't depend on props
  )

  return (
    <DebitNoteBaseTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      moduleId={moduleId}
      transactionId={transactionId}
      tableName={TableName.debitNote}
      emptyMessage="No debit note details found."
      accessorId="itemNo"
      onRefresh={onRefresh}
      onFilterChange={onFilterChange}
      onSelect={onSelect}
      onCreate={onCreate}
      onEdit={onEdit}
      onDelete={onDelete}
      onBulkDelete={onBulkDelete}
      isConfirmed={isConfirmed}
      showHeader={true}
      showActions={true}
      hideView={false}
      hideEdit={false}
      hideDelete={false}
      hideCreate={false}
      disableOnDebitNoteExists={false}
    />
  )
}

export default DebitNoteTable
