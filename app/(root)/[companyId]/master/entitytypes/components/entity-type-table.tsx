"use client"

import { IEntityType } from "@/interfaces/entitytype"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format, isValid } from "date-fns"

import { TableName } from "@/lib/utils"
import { MainDataTable } from "@/components/table/table-main"

interface EntityTypesTableProps {
  data: IEntityType[]
  isLoading?: boolean
  onSelect?: (entityType: IEntityType | null) => void
  onDelete?: (entityTypeId: string) => void
  onEdit?: (entityType: IEntityType) => void
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

export function EntityTypesTable({
  data,
  isLoading = false,
  onSelect,
  onDelete,
  onEdit,
  onCreate,
  onRefresh,
  onFilterChange,
  moduleId = 1,
  transactionId = 1,
  canEdit = true,
  canDelete = true,
  canView = true,
  canCreate = true,
}: EntityTypesTableProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  const columns: ColumnDef<IEntityType>[] = [
    {
      accessorKey: "entityTypeCode",
      header: "Code",
      size: 120,
      minSize: 100,
      maxSize: 150,
    },
    {
      accessorKey: "entityTypeName",
      header: "Name",
      size: 250,
      minSize: 200,
      maxSize: 300,
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
  ]

  return (
    <MainDataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      moduleId={moduleId}
      transactionId={transactionId}
      tableName={TableName.entityTypes}
      accessorId="entityTypeId"
      onItemSelect={onSelect}
      onEditItem={onEdit}
      onDeleteItem={onDelete}
      onCreateItem={onCreate}
      onRefresh={onRefresh}
      onFilterChange={onFilterChange}
      canView={canView}
      canEdit={canEdit}
      canDelete={canDelete}
      canCreate={canCreate}
      emptyMessage="No entity types found. Create your first entity type!"
    />
  )
}
