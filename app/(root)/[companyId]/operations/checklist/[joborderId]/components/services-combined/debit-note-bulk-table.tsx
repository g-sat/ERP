"use client"

import { useCallback, useMemo } from "react"
import { IBulkChargeData } from "@/interfaces/checklist"
import { ColumnDef } from "@tanstack/react-table"

import { TableName } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { DebitNoteBaseTable } from "@/components/table/table-debitnote"

interface BulkDebitNoteTableProps {
  data: IBulkChargeData[]
  isLoading?: boolean
  onSelect?: (debitNote: IBulkChargeData | null) => void
  onDataReorder?: (newData: IBulkChargeData[]) => void
  onBulkSelectionChange?: (selectedIds: string[]) => void
  moduleId?: number
  transactionId?: number
  isConfirmed?: boolean
}

// Table component (existing)
export function BulkDebitNoteTable({
  data,
  isLoading = false,
  onSelect,
  onDataReorder,
  onBulkSelectionChange,
  moduleId,
  transactionId,
  isConfirmed,
}: BulkDebitNoteTableProps) {
  console.log("data", data)
  // Define columns for the debit note table
  const columns: ColumnDef<IBulkChargeData>[] = useMemo(
    () => [
      {
        accessorKey: "chargeName",
        header: "Charge Name",
        size: 300,
        minSize: 200,
        enableColumnFilter: true,
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        size: 250,
        minSize: 200,
      },
      {
        accessorKey: "isTariff",
        header: "Tariff Status",
        cell: ({ row }) => {
          const isTariff = row.getValue("isTariff") as boolean
          return (
            <Badge
              variant={isTariff ? "default" : "secondary"}
              className={
                isTariff
                  ? "border-green-200 bg-green-100 text-green-800"
                  : "border-red-200 bg-red-100 text-red-800"
              }
            >
              {isTariff ? "Available" : "Not Available"}
            </Badge>
          )
        },
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: "basicRate",
        header: "Amount",
        cell: ({ row }) => {
          const value = row.getValue("basicRate")
          const numericValue = parseFloat(value as string) || 0
          return (
            <div className="text-right font-mono">
              {numericValue.toFixed(2)}
            </div>
          )
        },
        size: 100,
        minSize: 80,
      },
      {
        accessorKey: "minUnit",
        header: "Min Unit",
        cell: ({ row }) => {
          const value = row.getValue("minUnit")
          const numericValue = parseFloat(value as string) || 0
          return (
            <div className="text-right font-mono">
              {numericValue.toFixed(2)}
            </div>
          )
        },
        size: 100,
        minSize: 80,
      },
      {
        accessorKey: "maxUnit",
        header: "Max Unit",
        cell: ({ row }) => {
          const value = row.getValue("maxUnit")
          const numericValue = parseFloat(value as string) || 0
          return (
            <div className="text-right font-mono">
              {numericValue.toFixed(2)}
            </div>
          )
        },
        size: 100,
        minSize: 80,
      },
      {
        accessorKey: "displayRate",
        header: "Display Rate",
        cell: ({ row }) => {
          const value = row.getValue("displayRate")
          const numericValue = parseFloat(value as string) || 0
          return (
            <div className="text-right font-mono">
              {numericValue.toFixed(2)}
            </div>
          )
        },
        size: 100,
        minSize: 80,
      },
      {
        accessorKey: "additionalRate",
        header: "Additional Rate",
        cell: ({ row }) => {
          const value = row.getValue("additionalRate")
          const numericValue = parseFloat(value as string) || 0
          return (
            <div className="text-right font-mono">
              {numericValue.toFixed(2)}
            </div>
          )
        },
        size: 100,
        minSize: 80,
      },

      {
        accessorKey: "chargeId",
        header: "Charge",
        size: 100,
        minSize: 80,
      },
    ],
    [] // No dependencies needed since column definitions don't depend on props
  )

  // Stable callback functions to prevent infinite re-renders
  const handleRefresh = useCallback(() => {
    // No-op for bulk charges table
  }, [])

  const handleFilterChange = useCallback(() => {
    // No-op for bulk charges table - this prevents the useEffect from triggering
  }, [])

  const handleSelect = useCallback(() => {
    // No-op for bulk charges table
  }, [])

  const handleCreate = useCallback(() => {
    // No-op for bulk charges table
  }, [])

  const handleEdit = useCallback(() => {
    // No-op for bulk charges table
  }, [])

  const handleDelete = useCallback(() => {
    // No-op for bulk charges table
  }, [])

  const handleBulkDelete = useCallback(() => {
    // No-op for bulk charges table
  }, [])

  const handleDataReorder = useCallback(() => {
    // No-op for bulk charges table
  }, [])

  // Prevent onBulkSelectionChange from being called unnecessarily
  const handleBulkSelectionChange = useCallback(
    (selectedIds: string[]) => {
      console.log("selectedIds", selectedIds)
      // Only call the parent's handler if it exists and we have actual selections
      if (onBulkSelectionChange && selectedIds.length > 0) {
        onBulkSelectionChange(selectedIds)
      }
    },
    [onBulkSelectionChange]
  )

  // Filter out hidden columns (chargeId and glId)
  const visibleColumns = columns.filter((col) => {
    const accessorKey = "accessorKey" in col ? col.accessorKey : undefined
    return accessorKey !== "chargeId" && accessorKey !== "glId"
  })

  return (
    <DebitNoteBaseTable
      data={data}
      columns={visibleColumns}
      isLoading={isLoading}
      moduleId={moduleId}
      transactionId={transactionId}
      tableName={TableName.debitNote}
      emptyMessage="No bulk charge details found."
      accessorId="chargeId"
      onRefreshAction={handleRefresh}
      onFilterChange={handleFilterChange}
      onSelect={onSelect || handleSelect}
      onCreateAction={handleCreate}
      onEditAction={handleEdit}
      onDeleteAction={handleDelete}
      onBulkDeleteAction={handleBulkDelete}
      onBulkSelectionChange={handleBulkSelectionChange}
      onDataReorder={onDataReorder || handleDataReorder}
      isConfirmed={isConfirmed}
      showHeader={true}
      showActions={true}
      hideView={true}
      hideEdit={true}
      hideDelete={true}
      hideCreate={true}
      disableOnDebitNoteExists={false}
    />
  )
}
