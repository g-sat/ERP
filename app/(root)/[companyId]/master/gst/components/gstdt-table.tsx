"use client"

import { IGstDt } from "@/interfaces/gst"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format, isValid } from "date-fns"

import { TableName } from "@/lib/utils"
import { MainDataTable } from "@/components/table/table-main"

interface GstDtTableProps {
  data: IGstDt[]
  isLoading?: boolean
  onSelect?: (gstdt: IGstDt | null) => void
  onDelete?: (gstId: string) => void
  onEdit?: (gstdt: IGstDt) => void
  onCreate?: () => void
  onRefresh?: () => void
  onFilterChange?: (filters: { search?: string; sortOrder?: string }) => void
  moduleId?: number
  transactionId?: number
  // Permission props
  canView?: boolean
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

export function GstDtTable({
  data,
  isLoading = false,
  onSelect,
  onDelete,
  onEdit,
  onCreate,
  onRefresh,
  onFilterChange,
  moduleId,
  transactionId,
  // Permission props
  canView = true,
  canCreate = true,
  canEdit = true,
  canDelete = true,
}: GstDtTableProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"

  const columns: ColumnDef<IGstDt>[] = [
    {
      accessorKey: "gstName",
      header: "Name",
      size: 200,
      minSize: 50,
      enableColumnFilter: true,
    },
    {
      accessorKey: "gstPercentage",
      header: "Percentage",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("gstPercentage")}%</div>
      ),
      size: 120,
      minSize: 50,
      enableColumnFilter: true,
    },
    {
      accessorKey: "validFrom",
      header: "Valid From",
      cell: ({ row }) => {
        const raw = row.getValue("validFrom")
        let date: Date | null = null
        if (typeof raw === "string") {
          date = new Date(raw)
        } else if (raw instanceof Date) {
          date = raw
        }
        return date && isValid(date) ? format(date, dateFormat) : "-"
      },
      size: 180,
      minSize: 150,
    },
    {
      accessorKey: "createBy",
      header: "Create By",
      cell: ({ row }) => <div>{row.getValue("createBy") || "-"}</div>,
      size: 120,
      minSize: 50,
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
        return date && isValid(date) ? format(date, datetimeFormat) : "-"
      },
      size: 180,
      minSize: 150,
    },
    {
      accessorKey: "editBy",
      header: "Edit By",
      cell: ({ row }) => <div>{row.getValue("editBy") || "-"}</div>,
      size: 120,
      minSize: 50,
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
        return date && isValid(date) ? format(date, datetimeFormat) : "-"
      },
      size: 180,
      minSize: 150,
    },
  ]

  return (
    <MainDataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      moduleId={moduleId}
      transactionId={transactionId}
      tableName={TableName.gst_dt}
      emptyMessage="No GST details found."
      accessorId="gstId"
      // Add handlers if provided
      onRefresh={onRefresh}
      onFilterChange={onFilterChange}
      //handler column props
      onItemSelect={onSelect}
      onCreateItem={onCreate}
      onEditItem={onEdit}
      onDeleteItem={onDelete}
      //show props
      showHeader={true}
      showFooter={true}
      showActions={true}
      // Permission props
      canView={canView}
      canCreate={canCreate}
      canEdit={canEdit}
      canDelete={canDelete}
    />
  )
}
