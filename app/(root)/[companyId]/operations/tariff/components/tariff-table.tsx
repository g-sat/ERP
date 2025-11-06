"use client"

import { ITariff, ITariffFilter } from "@/interfaces/tariff"
import { useAuthStore } from "@/stores/auth-store"
import {
  IconCircleCheckFilled,
  IconSquareRoundedXFilled,
} from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"

import { formatNumber } from "@/lib/format-utils"
import { Task } from "@/lib/operations-utils"
import { TableName } from "@/lib/utils"
import { MainTable } from "@/components/table/table-main"

interface TariffTableProps {
  data: ITariff[]
  isLoading?: boolean
  onDelete?: (tariff: ITariff) => void
  onEdit?: (tariff: ITariff) => void
  onRefresh?: () => void
  onFilterChange?: (filters: ITariffFilter) => void
  moduleId?: number
  transactionId?: number
  // Permission props
  canEdit?: boolean
  canDelete?: boolean
  canView?: boolean
  canCreate?: boolean
  onSelect?: (tariff: ITariff | null) => void
  onCreate?: () => void
}

export function TariffTable({
  data,
  isLoading = false,
  onDelete,
  onEdit,
  onRefresh,
  onFilterChange,
  moduleId,
  transactionId,
  canEdit = true,
  canDelete = true,
  canView = true,
  canCreate = true,
  onSelect,
  onCreate,
}: TariffTableProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2

  // Define columns for the table
  const columns: ColumnDef<ITariff>[] = [
    {
      accessorKey: "taskName",
      header: "Task",
      cell: ({ row }) => <div>{row.getValue("taskName")}</div>,
      size: 100,
    },
    {
      accessorKey: "portName",
      header: "Port",
      cell: ({ row }) => <div>{row.getValue("portName")}</div>,
      size: 80,
    },

    {
      accessorKey: "chargeName",
      header: "Charge",
      size: 250,
    },
    {
      accessorKey: "visaTypeName",
      header: "Visa Type",
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
      size: 80,
    },
    {
      accessorKey: "uomName",
      header: "UOM",
      size: 80,
    },
    {
      accessorKey: "displayRate",
      header: "Display Rate",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("displayRate"), amtDec)}
        </div>
      ),
      size: 80,
    },
    {
      accessorKey: "basicRate",
      header: "Basic Rate",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("basicRate"), amtDec)}
        </div>
      ),
      size: 80,
    },
    {
      accessorKey: "minUnit",
      header: "Min Unit",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("minUnit"), amtDec)}
        </div>
      ),
      size: 80,
    },
    {
      accessorKey: "maxUnit",
      header: "Max Unit",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("maxUnit"), amtDec)}
        </div>
      ),
      size: 80,
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
      size: 80,
    },
    {
      accessorKey: "additionalUnit",
      header: "Additional Unit",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("additionalUnit"), amtDec)}
        </div>
      ),
    },
    {
      accessorKey: "additionalRate",
      header: "Additional Rate",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("additionalRate"), amtDec)}
        </div>
      ),
      size: 80,
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
      size: 80,
    },
    {
      accessorKey: "prepaymentPercentage",
      header: "Prepayment %",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("prepaymentPercentage"), 2)}
        </div>
      ),
      size: 80,
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
      size: 80,
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
      size: 80,
    },
  ]

  // Handle delete with tariff object
  const handleDelete = (tariffId: string) => {
    if (onDelete) {
      const tariff = data.find((t) => t.tariffId?.toString() === tariffId)
      if (tariff) {
        onDelete(tariff)
      }
    }
  }

  return (
    <MainTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      moduleId={moduleId}
      transactionId={transactionId}
      tableName={TableName.tariff}
      emptyMessage="No tariffs found."
      accessorId="tariffId"
      // Add handlers if provided
      onRefresh={onRefresh}
      onFilterChange={onFilterChange}
      //handler column props
      onSelect={onSelect}
      onCreate={onCreate}
      onEdit={onEdit}
      onDelete={handleDelete}
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
