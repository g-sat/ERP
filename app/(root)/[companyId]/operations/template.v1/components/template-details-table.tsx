"use client"

import { ITemplateDt } from "@/interfaces/template"
import { ColumnDef } from "@tanstack/react-table"

import { TableName } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { MainTable } from "@/components/table/table-main"

interface TemplateDetailsTableProps {
  data: ITemplateDt[]
  isLoading?: boolean
  onDeleteAction?: (detail: ITemplateDt) => void
  onEditAction?: (detail: ITemplateDt) => void
  onRefreshAction?: () => void
  // Permission props
  canEdit?: boolean
  canDelete?: boolean
  canView?: boolean
  canCreate?: boolean
  onSelect?: (detail: ITemplateDt | null) => void
  onCreateAction?: () => void
  createButtonText?: string // Custom text for create button
}

export function TemplateDetailsTable({
  data,
  isLoading = false,
  onDeleteAction,
  onEditAction,
  onRefreshAction,
  canEdit = true,
  canDelete = true,
  canView = true,
  canCreate = true,
  onSelect,
  onCreateAction,
  createButtonText = "Add Detail",
}: TemplateDetailsTableProps) {
  // Define columns for the table
  const columns: ColumnDef<ITemplateDt>[] = [
    {
      accessorKey: "itemNo",
      header: "Item No",
      cell: ({ row }) => (
        <div className="text-center">
          <Badge variant="outline">{row.getValue("itemNo")}</Badge>
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "chargeName",
      header: "Charge",
      cell: ({ row }) => (
        <div>
          {row.getValue("chargeName") || `Charge ID: ${row.original.chargeId}`}
        </div>
      ),
      size: 250,
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ row }) => (
        <div className="max-w-md truncate">
          {row.getValue("remarks") || "-"}
        </div>
      ),
      size: 300,
    },
  ]

  // Handle delete with detail object
  const handleDelete = (itemNo: string) => {
    if (onDeleteAction) {
      const detail = data.find((d) => d.itemNo?.toString() === itemNo)
      if (detail) {
        onDeleteAction(detail)
      }
    }
  }

  return (
    <MainTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      tableName={TableName.template}
      emptyMessage="No template details found."
      accessorId="itemNo"
      // Add handlers if provided
      onRefreshAction={onRefreshAction}
      //handler column props
      onSelect={onSelect}
      onCreateAction={onCreateAction}
      createButtonText={createButtonText}
      onEditAction={onEditAction}
      onDeleteAction={handleDelete}
      //show props
      showHeader={true}
      showFooter={true}
      showActions={true}
      // Permission props
      canEdit={canEdit}
      canDelete={canDelete}
      canView={canView}
      canCreate={canCreate}
    />
  )
}
