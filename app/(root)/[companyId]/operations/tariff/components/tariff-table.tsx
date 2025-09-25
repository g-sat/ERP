"use client"

import { ITariff, ITariffFilter } from "@/interfaces/tariff"
import {
  IconCircleCheckFilled,
  IconSquareRoundedXFilled,
} from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"

import { Task } from "@/lib/operations-utils"
import { TableName, cn } from "@/lib/utils"
import { MainTable } from "@/components/table/table-main"

interface TariffTableProps {
  data: ITariff[]
  isLoading?: boolean
  onDeleteTariff?: (tariffId: string, task: string) => void
  onEditTariff?: (tariff: ITariff) => void
  onRefresh?: () => void
  onFilterChange?: (filters: ITariffFilter) => void
  moduleId?: number
  transactionId?: number
}

export function TariffTable({
  data,
  isLoading = false,
  onDeleteTariff,
  onEditTariff,
  onRefresh,
  onFilterChange,
  moduleId,
  transactionId,
}: TariffTableProps) {
  // Define columns for the table
  const columns: ColumnDef<ITariff>[] = [
    {
      accessorKey: "portName",
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <span>Port</span>
          <div className="flex flex-col">
            <ArrowUpIcon
              className={cn(
                "h-3 w-3 transform",
                column.getIsSorted() === "asc"
                  ? "text-foreground"
                  : "text-muted-foreground/50"
              )}
              onClick={() => column.toggleSorting(false)}
            />
            <ArrowDownIcon
              className={cn(
                "h-3 w-3 transform",
                column.getIsSorted() === "desc"
                  ? "text-foreground"
                  : "text-muted-foreground/50"
              )}
              onClick={() => column.toggleSorting(true)}
            />
          </div>
        </div>
      ),
      cell: ({ row }) => <div>{row.getValue("portName")}</div>,
    },
    {
      accessorKey: "taskName",
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <span>Task</span>
          <div className="flex flex-col">
            <ArrowUpIcon
              className={cn(
                "h-3 w-3 transform",
                column.getIsSorted() === "asc"
                  ? "text-foreground"
                  : "text-muted-foreground/50"
              )}
              onClick={() => column.toggleSorting(false)}
            />
            <ArrowDownIcon
              className={cn(
                "h-3 w-3 transform",
                column.getIsSorted() === "desc"
                  ? "text-foreground"
                  : "text-muted-foreground/50"
              )}
              onClick={() => column.toggleSorting(true)}
            />
          </div>
        </div>
      ),
      cell: ({ row }) => <div>{row.getValue("taskName")}</div>,
    },
    {
      accessorKey: "chargeName",
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <span>Charge</span>
          <div className="flex flex-col">
            <ArrowUpIcon
              className={cn(
                "h-3 w-3 transform",
                column.getIsSorted() === "asc"
                  ? "text-foreground"
                  : "text-muted-foreground/50"
              )}
              onClick={() => column.toggleSorting(false)}
            />
            <ArrowDownIcon
              className={cn(
                "h-3 w-3 transform",
                column.getIsSorted() === "desc"
                  ? "text-foreground"
                  : "text-muted-foreground/50"
              )}
              onClick={() => column.toggleSorting(true)}
            />
          </div>
        </div>
      ),
    },
    {
      accessorKey: "visaTypeName",
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <span>Visa Type</span>
          <div className="flex flex-col">
            <ArrowUpIcon
              className={cn(
                "h-3 w-3 transform",
                column.getIsSorted() === "asc"
                  ? "text-foreground"
                  : "text-muted-foreground/50"
              )}
              onClick={() => column.toggleSorting(false)}
            />
            <ArrowDownIcon
              className={cn(
                "h-3 w-3 transform",
                column.getIsSorted() === "desc"
                  ? "text-foreground"
                  : "text-muted-foreground/50"
              )}
              onClick={() => column.toggleSorting(true)}
            />
          </div>
        </div>
      ),
      cell: ({ row }) => {
        const taskId = row.original.taskId
        const taskName = row.original.taskName
        const visaTypeName = row.getValue("visaTypeName") as string

        // Only show visa type name if it's VisaService task
        if (taskId === Task.VisaService || taskName === "Visa Service") {
          return <div>{visaTypeName || "-"}</div>
        }
        return <div>-</div>
      },
    },
    {
      accessorKey: "uomName",
      header: "UOM",
    },
    {
      accessorKey: "displayRate",
      header: "Display Rate",
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("displayRate")}</div>
      ),
    },
    {
      accessorKey: "basicRate",
      header: "Basic Rate",
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("basicRate")}</div>
      ),
    },
    {
      accessorKey: "minUnit",
      header: "Min Unit",
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("minUnit")}</div>
      ),
    },
    {
      accessorKey: "maxUnit",
      header: "Max Unit",
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("maxUnit")}</div>
      ),
    },
    {
      accessorKey: "isAdditional",
      header: "Is Additional",
      cell: ({ row }) => (
        <div className="flex justify-center">
          {row.getValue("isAdditional") ? (
            <IconCircleCheckFilled className="h-4 w-4 text-green-500" />
          ) : (
            <IconSquareRoundedXFilled className="h-4 w-4 text-red-500" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "additionalUnit",
      header: "Additional Unit",
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("additionalUnit")}</div>
      ),
    },
    {
      accessorKey: "additionalRate",
      header: "Additional Rate",
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("additionalRate")}</div>
      ),
    },
    {
      accessorKey: "isPrepayment",
      header: "Is Prepayment",
      cell: ({ row }) => (
        <div className="flex justify-center">
          {row.getValue("isPrepayment") ? (
            <IconCircleCheckFilled className="h-4 w-4 text-green-500" />
          ) : (
            <IconSquareRoundedXFilled className="h-4 w-4 text-red-500" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "prepaymentPercentage",
      header: "Prepayment %",
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("prepaymentPercentage")}</div>
      ),
    },
    {
      accessorKey: "isDefault",
      header: "Default",
      cell: ({ row }) => (
        <div className="flex justify-center">
          {row.getValue("isDefault") ? (
            <IconCircleCheckFilled className="h-4 w-4 text-green-500" />
          ) : (
            <IconSquareRoundedXFilled className="h-4 w-4 text-red-500" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Active",
      cell: ({ row }) => (
        <div className="flex justify-center">
          {row.getValue("isActive") ? (
            <IconCircleCheckFilled className="h-4 w-4 text-green-500" />
          ) : (
            <IconSquareRoundedXFilled className="h-4 w-4 text-red-500" />
          )}
        </div>
      ),
    },
  ]

  // Handle delete with task name
  const handleDelete = (tariffId: string) => {
    if (onDeleteTariff) {
      const tariff = data.find((t) => t.tariffId?.toString() === tariffId)
      if (tariff) {
        onDeleteTariff(tariffId, tariff.taskName || "")
      }
    }
  }

  // Handle filter changes for server-side filtering
  const handleFilterChange = (filters: {
    search?: string
    sortOrder?: string
  }) => {
    if (onFilterChange) {
      const newFilters: ITariffFilter = {
        search: filters.search,
      }
      onFilterChange(newFilters)
    }
  }

  return (
    <MainTable<ITariff>
      data={data}
      columns={columns}
      isLoading={isLoading}
      tableName={TableName.tariff}
      accessorId="tariffId"
      moduleId={moduleId}
      transactionId={transactionId}
      onRefresh={onRefresh}
      onFilterChange={handleFilterChange}
      onEdit={onEditTariff}
      onDelete={handleDelete}
      showHeader={true}
      showFooter={true}
      showActions={true}
      canCreate={false}
      canEdit={true}
      canDelete={true}
      canView={true}
      emptyMessage="No tariffs found."
    />
  )
}
