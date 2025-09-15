"use client"

import { IDesignation } from "@/interfaces/designation"
import { useAuthStore } from "@/stores/auth-store"
import {
  IconCircleCheckFilled,
  IconSquareRoundedXFilled,
} from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { format, isValid } from "date-fns"

import { TableName } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { MainDataTable } from "@/components/table/table-main"

interface DesignationsTableProps {
  data: IDesignation[]
  isLoading?: boolean
  onSelect?: (designation: IDesignation | null) => void
  onDelete?: (designationId: string) => void
  onEdit?: (designation: IDesignation) => void
  onCreate?: () => void
  onRefresh?: () => void
  onFilterChange?: (filters: { search?: string; sortOrder?: string }) => void
  moduleId?: number
  transactionId?: number
  // Permission props
  canEdit?: boolean
  canDelete?: boolean
  canView?: boolean
  canCreate?: boolean
}

export function DesignationsTable({
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
  canEdit = true,
  canDelete = true,
  canView = true,
  canCreate = true,
}: DesignationsTableProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  const columns: ColumnDef<IDesignation>[] = [
    {
      accessorKey: "designationCode",
      header: "Code",
      size: 120,
      minSize: 50,
      maxSize: 150,
      enableColumnFilter: true,
    },
    {
      accessorKey: "designationName",
      header: "Name",
      size: 200,
      minSize: 50,
      maxSize: 300,
      enableColumnFilter: true,
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
      maxSize: 150,
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ row }) => <div>{row.getValue("remarks") || "-"}</div>,
      size: 200,
      minSize: 50,
      maxSize: 300,
    },
    {
      accessorKey: "createBy",
      header: "Create By",
      cell: ({ row }) => <div>{row.getValue("createBy") || "-"}</div>,
      size: 120,
      minSize: 50,
      maxSize: 150,
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
      maxSize: 200,
    },
    {
      accessorKey: "editBy",
      header: "Edit By",
      cell: ({ row }) => <div>{row.getValue("editBy") || "-"}</div>,
      size: 120,
      minSize: 50,
      maxSize: 150,
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
      maxSize: 200,
    },
  ]

  return (
    <MainDataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      moduleId={moduleId}
      transactionId={transactionId}
      tableName={TableName.designation}
      emptyMessage="No designations found."
      accessorId="designationId"
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
      canEdit={canEdit}
      canDelete={canDelete}
      canView={canView}
      canCreate={canCreate}
    />
  )
}
