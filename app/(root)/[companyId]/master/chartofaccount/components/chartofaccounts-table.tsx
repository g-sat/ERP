"use client"

import {
  IChartofAccount,
  IChartofAccountFilter,
} from "@/interfaces/chartofaccount"
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

interface ChartOfAccountsTableProps {
  data: IChartofAccount[]
  isLoading?: boolean
  onSelect?: (chartOfAccount: IChartofAccount | null) => void
  onDelete?: (chartOfAccountId: string) => void
  onEdit?: (chartOfAccount: IChartofAccount) => void
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

export function ChartOfAccountsTable({
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
}: ChartOfAccountsTableProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  const columns: ColumnDef<IChartofAccount>[] = [
    {
      accessorKey: "glCode",
      header: "GL Code",
      cell: ({ row }) => (
        <div className="truncate font-medium" title={row.getValue("glCode")}>
          {row.getValue("glCode")}
        </div>
      ),
      size: 120,
      minSize: 100,
      enableColumnFilter: true,
    },
    {
      accessorKey: "glName",
      header: "GL Name",
      cell: ({ row }) => (
        <div className="truncate" title={row.getValue("glName") || "—"}>
          {row.getValue("glName") || "—"}
        </div>
      ),
      size: 200,
      minSize: 150,
      enableColumnFilter: true,
    },
    {
      accessorKey: "accTypeName",
      header: "Account Type",
      cell: ({ row }) => (
        <div className="truncate" title={row.getValue("accTypeName") || "—"}>
          {row.getValue("accTypeName") || "—"}
        </div>
      ),
      size: 120,
      minSize: 100,
    },
    {
      accessorKey: "accGroupName",
      header: "Account Group",
      cell: ({ row }) => (
        <div className="truncate" title={row.getValue("accGroupName") || "—"}>
          {row.getValue("accGroupName") || "—"}
        </div>
      ),
      size: 120,
      minSize: 100,
    },
    {
      accessorKey: "coaCategoryName1",
      header: "Category 1",
      cell: ({ row }) => (
        <div
          className="truncate"
          title={row.getValue("coaCategoryName1") || "—"}
        >
          {row.getValue("coaCategoryName1") || "—"}
        </div>
      ),
      size: 120,
      minSize: 100,
    },
    {
      accessorKey: "coaCategoryName2",
      header: "Category 2",
      cell: ({ row }) => (
        <div
          className="truncate"
          title={row.getValue("coaCategoryName2") || "—"}
        >
          {row.getValue("coaCategoryName2") || "—"}
        </div>
      ),
      size: 120,
      minSize: 100,
    },
    {
      accessorKey: "coaCategoryName3",
      header: "Category 3",
      cell: ({ row }) => (
        <div
          className="truncate"
          title={row.getValue("coaCategoryName3") || "—"}
        >
          {row.getValue("coaCategoryName3") || "—"}
        </div>
      ),
      size: 120,
      minSize: 100,
    },
    {
      accessorKey: "isSysControl",
      header: "System Control",
      cell: ({ row }) => (
        <Badge
          variant={row.getValue("isSysControl") ? "default" : "destructive"}
        >
          {row.getValue("isSysControl") ? (
            <IconCircleCheckFilled className="mr-1 fill-green-500 dark:fill-green-400" />
          ) : (
            <IconSquareRoundedXFilled className="mr-1 fill-red-500 dark:fill-red-400" />
          )}
          {row.getValue("isSysControl") ? "Yes" : "No"}
        </Badge>
      ),
      size: 120,
      minSize: 100,
    },
    {
      accessorKey: "isHeading",
      header: "Heading",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isHeading") ? "default" : "destructive"}>
          {row.getValue("isHeading") ? "Yes" : "No"}
        </Badge>
      ),
      size: 120,
      minSize: 100,
    },
    {
      accessorKey: "isDeptMandatory",
      header: "Dept Mandatory",
      cell: ({ row }) => (
        <Badge
          variant={row.getValue("isDeptMandatory") ? "default" : "destructive"}
        >
          {row.getValue("isDeptMandatory") ? (
            <IconCircleCheckFilled className="mr-1 fill-green-500 dark:fill-green-400" />
          ) : (
            <IconSquareRoundedXFilled className="mr-1 fill-red-500 dark:fill-red-400" />
          )}
          {row.getValue("isDeptMandatory") ? "Yes" : "No"}
        </Badge>
      ),
      size: 120,
      minSize: 100,
    },
    {
      accessorKey: "isBargeMandatory",
      header: "Barge Mandatory",
      cell: ({ row }) => (
        <Badge
          variant={row.getValue("isBargeMandatory") ? "default" : "destructive"}
        >
          {row.getValue("isBargeMandatory") ? (
            <IconCircleCheckFilled className="mr-1 fill-green-500 dark:fill-green-400" />
          ) : (
            <IconSquareRoundedXFilled className="mr-1 fill-red-500 dark:fill-red-400" />
          )}
          {row.getValue("isBargeMandatory") ? "Yes" : "No"}
        </Badge>
      ),
      size: 120,
      minSize: 100,
    },
    {
      accessorKey: "isJobControl",
      header: "Job Control",
      cell: ({ row }) => (
        <Badge
          variant={row.getValue("isJobControl") ? "default" : "destructive"}
        >
          {row.getValue("isJobControl") ? (
            <IconCircleCheckFilled className="mr-1 fill-green-500 dark:fill-green-400" />
          ) : (
            <IconSquareRoundedXFilled className="mr-1 fill-red-500 dark:fill-red-400" />
          )}
          {row.getValue("isJobControl") ? "Yes" : "No"}
        </Badge>
      ),
      size: 120,
      minSize: 100,
    },
    {
      accessorKey: "isBankControl",
      header: "Bank Control",
      cell: ({ row }) => (
        <Badge
          variant={row.getValue("isBankControl") ? "default" : "destructive"}
        >
          {row.getValue("isBankControl") ? (
            <IconCircleCheckFilled className="mr-1 fill-green-500 dark:fill-green-400" />
          ) : (
            <IconSquareRoundedXFilled className="mr-1 fill-red-500 dark:fill-red-400" />
          )}
          {row.getValue("isBankControl") ? "Yes" : "No"}
        </Badge>
      ),
      size: 120,
      minSize: 100,
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
      minSize: 100,
    },
    {
      accessorKey: "seqNo",
      header: "Sequence",
      cell: ({ row }) => (
        <div className="truncate" title={String(row.getValue("seqNo"))}>
          {row.getValue("seqNo")}
        </div>
      ),
      size: 100,
      minSize: 80,
      maxSize: 120,
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ row }) => (
        <div className="truncate" title={row.getValue("remarks") || "—"}>
          {row.getValue("remarks") || "—"}
        </div>
      ),
      size: 200,
      minSize: 150,
    },
    {
      accessorKey: "createBy",
      header: "Create By",
      cell: ({ row }) => (
        <div className="truncate" title={row.getValue("createBy") || "—"}>
          {row.getValue("createBy") || "—"}
        </div>
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
        if (typeof raw === "string") date = new Date(raw)
        else if (raw instanceof Date) date = raw
        const formattedDate =
          date && isValid(date) ? format(date, datetimeFormat) : "-"
        return (
          <div className="truncate" title={formattedDate}>
            {formattedDate}
          </div>
        )
      },
      size: 180,
      minSize: 150,
    },
    {
      accessorKey: "editBy",
      header: "Edit By",
      cell: ({ row }) => (
        <div className="truncate" title={row.getValue("editBy") || "—"}>
          {row.getValue("editBy") || "—"}
        </div>
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
        if (typeof raw === "string") date = new Date(raw)
        else if (raw instanceof Date) date = raw
        const formattedDate =
          date && isValid(date) ? format(date, datetimeFormat) : "-"
        return (
          <div className="truncate" title={formattedDate}>
            {formattedDate}
          </div>
        )
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
      tableName={TableName.chart_of_account}
      emptyMessage="No chart of accounts found."
      accessorId="glId"
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
