"use client"

import { IUser } from "@/interfaces/admin"
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

interface UsersTableProps {
  data: IUser[]
  isLoading?: boolean
  onSelect?: (user: IUser | null) => void
  onDelete?: (userId: string) => void
  onEdit?: (user: IUser) => void
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

export function UserTable({
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
}: UsersTableProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  const columns: ColumnDef<IUser>[] = [
    {
      accessorKey: "userName",
      header: "Name",
      size: 200,
      minSize: 50,
      maxSize: 250,
      enableColumnFilter: true,
    },
    {
      accessorKey: "userCode",
      header: "Code",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("userCode")}</div>
      ),
      size: 120,
      minSize: 50,
      maxSize: 150,
      enableColumnFilter: true,
    },
    {
      accessorKey: "userEmail",
      header: "Email",
      size: 100,
      minSize: 50,
      maxSize: 150,
      enableColumnFilter: true,
    },

    {
      accessorKey: "userRoleName",
      header: "Role",
      size: 200,
      minSize: 50,
      maxSize: 250,
      enableColumnFilter: true,
    },

    {
      accessorKey: "userGroupName",
      header: "Group",
      size: 200,
      minSize: 50,
      maxSize: 250,
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
      accessorKey: "isLocked",
      header: "Locked",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isLocked") ? "destructive" : "secondary"}>
          {row.getValue("isLocked") ? (
            <IconCircleCheckFilled className="mr-1 fill-green-500 dark:fill-green-400" />
          ) : (
            <IconSquareRoundedXFilled className="mr-1 fill-red-500 dark:fill-red-400" />
          )}
          {row.getValue("isLocked") ? "Locked" : "Unlocked"}
        </Badge>
      ),
      size: 120,
      minSize: 50,
      maxSize: 150,
    },

    {
      accessorKey: "remarks",
      header: "Remarks",

      size: 200,
      minSize: 50,
      maxSize: 250,
    },
    {
      accessorKey: "createBy",
      header: "Create By",

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
        if (typeof raw === "string") {
          date = new Date(raw)
        } else if (raw instanceof Date) {
          date = raw
        }
        return date && isValid(date) ? format(date, datetimeFormat) : "-"
      },
      size: 180,
      minSize: 150,
      maxSize: 220,
    },
    {
      accessorKey: "editBy",
      header: "Edit By",

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
        if (typeof raw === "string") {
          date = new Date(raw)
        } else if (raw instanceof Date) {
          date = raw
        }
        return date && isValid(date) ? format(date, datetimeFormat) : "-"
      },
      size: 180,
      minSize: 150,
      maxSize: 220,
    },
  ]

  return (
    <MainDataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      moduleId={moduleId}
      transactionId={transactionId}
      tableName={TableName.user}
      emptyMessage="No users found."
      accessorId="userId"
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
