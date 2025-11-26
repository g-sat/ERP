"use client"

import { useCallback, useMemo } from "react"
import { IBulkChargeData } from "@/interfaces/checklist"
import { ColumnDef } from "@tanstack/react-table"

import { TableName } from "@/lib/utils"
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
        size: 200,
        minSize: 150,
        enableColumnFilter: true,
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        size: 350,
        minSize: 250,
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
        accessorKey: "chargeId",
        header: "Charge",
        size: 100,
        minSize: 80,
      },
      {
        accessorKey: "glId",
        header: "GL",
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
      onBulkDelete={handleBulkDelete}
      onBulkSelectionChange={handleBulkSelectionChange}
      onDataReorder={onDataReorder || handleDataReorder}
      isConfirmed={isConfirmed}
      showHeader={false}
      showActions={true}
      hideView={true}
      hideEdit={true}
      hideDelete={true}
      hideCreate={true}
      disableOnDebitNoteExists={false}
    />
  )
}
