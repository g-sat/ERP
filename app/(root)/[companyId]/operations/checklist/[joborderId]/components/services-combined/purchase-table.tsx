"use client"

import { useCallback, useMemo } from "react"
import { IPurchaseData } from "@/interfaces"
import { ColumnDef } from "@tanstack/react-table"

import { TableName } from "@/lib/utils"
import { DebitNoteBaseTable } from "@/components/table/table-debitnote"

interface PurchaseTableProps {
  data: IPurchaseData[]
  isLoading?: boolean
  onSelect?: (debitNote: IPurchaseData | null) => void
  onDataReorder?: (newData: IPurchaseData[]) => void
  onBulkSelectionChange?: (selectedIds: string[]) => void
  isConfirmed?: boolean
  initialSelectedIds?: string[]
  selectedIds?: string[]
}

// Table component (existing)
export function PurchaseTable({
  data,
  isLoading = false,
  onSelect,
  onDataReorder,
  onBulkSelectionChange,
  isConfirmed,
  initialSelectedIds = [],
  selectedIds = [],
}: PurchaseTableProps) {
  console.log("Purchase data", data)

  // Add uniqueId field combining invoiceId and itemNo for proper identification
  // and update isAllocated based on current selection
  const dataWithUniqueId = useMemo(
    () =>
      data.map((item) => {
        const uniqueId = `${item.invoiceId}_${item.itemNo}`
        const isCurrentlySelected = selectedIds.includes(uniqueId)

        return {
          ...item,
          uniqueId,
          // Update isAllocated: true if originally allocated OR currently selected
          isAllocated: item.isAllocated || isCurrentlySelected,
        }
      }),
    [data, selectedIds]
  )
  // Define columns for the purchase table
  const columns: ColumnDef<IPurchaseData & { uniqueId: string }>[] = useMemo(
    () => [
      {
        accessorKey: "uniqueId",
        header: "ID",
        cell: ({ row }) => {
          const uniqueId = row.getValue("uniqueId") as string
          return <span className="font-mono text-xs">{uniqueId}</span>
        },
        size: 100,
        minSize: 80,
        enableHiding: true,
      },
      {
        accessorKey: "isAllocated",
        header: "Status",
        cell: ({ row }) => {
          const isAllocated = row.getValue("isAllocated") as boolean

          return (
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                isAllocated
                  ? "bg-green-100 text-green-800"
                  : "bg-orange-100 text-orange-800"
              }`}
            >
              {isAllocated ? "Allocated" : "Unallocated"}
            </span>
          )
        },
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: "invoiceNo",
        header: "Invoice No",
        size: 150,
        minSize: 120,
        enableColumnFilter: true,
      },
      {
        accessorKey: "itemNo",
        header: "Item No",
        size: 100,
        minSize: 80,
        cell: ({ row }) => {
          const itemNo = row.getValue("itemNo")
          return <span className="font-mono">{String(itemNo)}</span>
        },
      },
      {
        accessorKey: "accountDate",
        header: "Invoice Date",
        cell: ({ row }) => {
          const date = row.getValue("accountDate") as Date | string
          return date ? new Date(date).toLocaleDateString() : "-"
        },
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: "suppInvoiceNo",
        header: "Supplier Invoice No",
        size: 180,
        minSize: 150,
        enableColumnFilter: true,
      },
      {
        accessorKey: "supplierName",
        header: "Supplier Name",
        size: 200,
        minSize: 150,
        enableColumnFilter: true,
      },
      {
        accessorKey: "totAmt",
        header: "Amount",
        cell: ({ row }) => {
          const value = row.getValue("totAmt") as number
          return (
            <div className="text-right font-mono">
              {value?.toFixed(2) || "0.00"}
            </div>
          )
        },
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: "gstAmt",
        header: "GST Amount",
        cell: ({ row }) => {
          const value = row.getValue("gstAmt") as number
          return (
            <div className="text-right font-mono">
              {value?.toFixed(2) || "0.00"}
            </div>
          )
        },
        size: 120,
        minSize: 100,
      },

      {
        accessorKey: "totAmtAftGst",
        header: "Total Amount",
        cell: ({ row }) => {
          const value = row.getValue("totAmtAftGst") as number
          return (
            <div className="text-right font-mono">
              {value?.toFixed(2) || "0.00"}
            </div>
          )
        },
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        size: 200,
        minSize: 150,
      },
      {
        accessorKey: "isServiceCharge",
        header: "Service Charge",
        cell: ({ row }) => {
          const value = row.getValue("isServiceCharge") as boolean
          return value ? "Yes" : "No"
        },
      },
      {
        accessorKey: "serviceCharge",
        header: "Service %",
        cell: ({ row }) => {
          const value = row.getValue("serviceCharge") as number
          return value?.toFixed(2) || "0.00"
        },
      },
    ],
    [] // No dependencies needed since column definitions don't depend on props
  )

  // Stable callback functions to prevent infinite re-renders
  const handleRefresh = useCallback(() => {
    // No-op for purchase table
  }, [])

  const handleFilterChange = useCallback(() => {
    // No-op for purchase table - this prevents the useEffect from triggering
  }, [])

  const handleSelect = useCallback(() => {
    // No-op for purchase table
  }, [])

  const handleCreate = useCallback(() => {
    // No-op for purchase table
  }, [])

  const handleEdit = useCallback(() => {
    // No-op for purchase table
  }, [])

  const handleDelete = useCallback(() => {
    // No-op for purchase table
  }, [])

  const handleBulkDelete = useCallback(() => {
    // No-op for purchase table
  }, [])

  const handleDataReorder = useCallback(() => {
    // No-op for purchase table
  }, [])

  // Prevent onBulkSelectionChange from being called unnecessarily
  const handleBulkSelectionChange = useCallback(
    (selectedIds: string[]) => {
      console.log("selectedIds", selectedIds)
      // Always call the parent's handler if it exists
      onBulkSelectionChange?.(selectedIds)
    },
    [onBulkSelectionChange]
  )

  // All columns are visible for purchase table
  const visibleColumns = columns

  return (
    <DebitNoteBaseTable
      data={dataWithUniqueId}
      columns={visibleColumns}
      isLoading={isLoading}
      moduleId={0}
      transactionId={0}
      tableName={TableName.debitNote}
      emptyMessage="No purchase details found."
      accessorId="uniqueId"
      onRefresh={handleRefresh}
      onFilterChange={handleFilterChange}
      onSelect={onSelect || handleSelect}
      onCreate={handleCreate}
      onEdit={handleEdit}
      onDelete={handleDelete}
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
      initialSelectedIds={initialSelectedIds}
    />
  )
}
