"use client"

import { useMemo } from "react"
import { ITemplateDt } from "@/interfaces/template"
import { ColumnDef } from "@tanstack/react-table"

import { TableName } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { DebitNoteBaseTable } from "@/components/table/table-debitnote"

interface TemplateDetailsTableProps {
  data: ITemplateDt[]
  isLoading?: boolean
  onSelect?: (template: ITemplateDt | null) => void
  onDeleteAction?: (templateId: string) => void
  onBulkDeleteAction?: (selectedIds: string[]) => void
  onEditAction?: (template: ITemplateDt) => void
  onCreateAction?: () => void
  onRefreshAction?: () => void
  onFilterChange?: (filters: { search?: string; sortOrder?: string }) => void
  onDataReorder?: (newData: ITemplateDt[]) => void
}

export function TemplateDetailsTable({
  data,
  isLoading = false,
  onSelect,
  onDeleteAction,
  onBulkDeleteAction,
  onEditAction,
  onCreateAction,
  onRefreshAction,
  onFilterChange,
  onDataReorder,
}: TemplateDetailsTableProps) {
  // Show all data (multiple rows display)
  const displayData = data || []

  // Define columns for the template details table
  const columns: ColumnDef<ITemplateDt>[] = useMemo(
    () => [
      {
        accessorKey: "itemNo",
        header: "Item No",
        size: 100,
        minSize: 50,
      },
      {
        accessorKey: "chargeName",
        header: "Charge Name",
        size: 200,
        minSize: 150,
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        size: 250,
        minSize: 200,
      },
      {
        accessorKey: "isServiceCharge",
        header: "Is Service Charge",
        cell: ({ row }) => (
          <Badge
            variant={row.getValue("isServiceCharge") ? "default" : "secondary"}
          >
            {row.getValue("isServiceCharge") ? "Yes" : "No"}
          </Badge>
        ),
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: "serviceCharge",
        header: "Service Charge",
        cell: ({ row }) => (
          <div className="text-right">
            {typeof row.getValue("serviceCharge") === "number"
              ? (row.getValue("serviceCharge") as number).toFixed(2)
              : "0.00"}
          </div>
        ),
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: "editVersion",
        header: "Version",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Badge
              variant="secondary"
              className="flex items-center justify-center rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white"
            >
              {row.getValue("editVersion") || "0"}
            </Badge>
          </div>
        ),
        size: 80,
        minSize: 60,
      },
    ],
    []
  )

  return (
    <DebitNoteBaseTable
      data={displayData}
      columns={columns}
      isLoading={isLoading}
      moduleId={0}
      transactionId={0}
      tableName={TableName.template}
      emptyMessage="No template details found."
      accessorId="itemNo"
      onRefreshAction={onRefreshAction}
      onFilterChange={onFilterChange}
      onSelect={onSelect}
      onCreateAction={onCreateAction}
      onEditAction={onEditAction}
      onDeleteAction={onDeleteAction}
      onBulkDeleteAction={onBulkDeleteAction}
      onDataReorder={onDataReorder}
      isConfirmed={false}
      showHeader={true}
      showActions={true}
      hideCreate={true}
    />
  )
}
