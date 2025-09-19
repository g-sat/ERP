"use client"

import { IAuditLog } from "@/interfaces/admin"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format, isValid } from "date-fns"

import { TableName } from "@/lib/utils"
import { BasicTable } from "@/components/table/table-basic"

interface AuditLogTableProps {
  data: IAuditLog[]
  isLoading?: boolean
  onRefresh?: () => void
  onFilterChange?: (filters: { search?: string; sortOrder?: string }) => void
  moduleId?: number
  transactionId?: number
}

export function AuditLogTable({
  data,
  isLoading = false,
  onRefresh,
  onFilterChange,
  moduleId,
  transactionId,
}: AuditLogTableProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  const columns: ColumnDef<IAuditLog>[] = [
    {
      accessorKey: "companyName",
      header: "Company",
      size: 200,
      minSize: 50,
      enableColumnFilter: true,
    },
    {
      accessorKey: "moduleName",
      header: "Module",
      size: 100,
      minSize: 50,
      enableColumnFilter: true,
    },
    {
      accessorKey: "transactionName",
      header: "Transaction",
      size: 120,
      minSize: 50,
      enableColumnFilter: true,
    },

    {
      accessorKey: "documentNo",
      header: "Document No",
      size: 120,
      minSize: 50,
      enableColumnFilter: true,
    },

    {
      accessorKey: "tblName",
      header: "Table",
      size: 120,
      minSize: 50,
      enableColumnFilter: true,
    },
    {
      accessorKey: "modeName",
      header: "Mode",
      size: 100,
      minSize: 50,
      enableColumnFilter: true,
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      size: 250,
      minSize: 50,
      enableColumnFilter: true,
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
    <BasicTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      moduleId={moduleId}
      transactionId={transactionId}
      tableName={TableName.auditlog}
      emptyMessage="No audit log found."
      onRefresh={onRefresh}
      onFilterChange={onFilterChange}
    />
  )
}
