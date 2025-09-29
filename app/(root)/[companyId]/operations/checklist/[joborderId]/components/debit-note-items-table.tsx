"use client"

import { useCallback, useMemo } from "react"
import { IDebitNoteItem } from "@/interfaces/checklist"
import { ColumnDef } from "@tanstack/react-table"

import { TableName } from "@/lib/utils"
import { DebitNoteBaseTable } from "@/components/table/table-debitnote"

interface DebitNoteItemsTableProps {
  data: IDebitNoteItem[]
  isLoading?: boolean
  onRefresh?: () => void
  onFilterChange?: () => void
  onSelect?: (item: IDebitNoteItem | null) => void
  onCreate?: () => void
  onEdit?: (item: IDebitNoteItem) => void
  onDelete?: (item: IDebitNoteItem) => void
  onBulkDelete?: (items: IDebitNoteItem[]) => void
  onDataReorder?: (newData: IDebitNoteItem[]) => void
  moduleId?: number
  transactionId?: number
  isConfirmed?: boolean
}

export function DebitNoteItemsTable({
  data,
  isLoading = false,
  onRefresh,
  onFilterChange,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
  onBulkDelete,
  onDataReorder,
  moduleId,
  transactionId,
  isConfirmed = false,
}: DebitNoteItemsTableProps) {
  // Define columns for the debit note items table
  const columns: ColumnDef<IDebitNoteItem>[] = useMemo(
    () => [
      {
        accessorKey: "taskName",
        header: "Task Name",
        cell: ({ row }) => (
          <div className="max-w-xs truncate">
            {row.getValue("taskName") || "-"}
          </div>
        ),
        size: 150,
        minSize: 120,
      },
      {
        accessorKey: "debitNoteNo",
        header: "Debit Note No.",
        cell: ({ row }) => (
          <div className="font-medium">
            {row.getValue("debitNoteNo") || "-"}
          </div>
        ),
        size: 160,
        minSize: 120,
      },
      {
        accessorKey: "itemNo",
        header: "Item No.",
        cell: ({ row }) => (
          <div className="text-center">{row.getValue("itemNo") || "-"}</div>
        ),
        size: 80,
        minSize: 60,
      },
      {
        accessorKey: "updatedItemNo",
        header: "Updated Item No.",
        cell: ({ row }) => (
          <div className="text-center">
            {row.getValue("updatedItemNo") || "-"}
          </div>
        ),
        size: 80,
        minSize: 60,
      },
      {
        accessorKey: "updatedDebitNoteNo",
        header: "Updated Debit Note No.",
        cell: ({ row }) => (
          <div className="text-center">
            {row.getValue("updatedDebitNoteNo") || "-"}
          </div>
        ),
        size: 160,
        minSize: 120,
      },
    ],
    []
  )

  // Callback handlers for the table
  const handleRefresh = useCallback(() => {
    onRefresh?.()
  }, [onRefresh])

  const handleFilterChange = useCallback(() => {
    onFilterChange?.()
  }, [onFilterChange])

  const handleSelect = useCallback(
    (item: IDebitNoteItem | null) => {
      onSelect?.(item)
    },
    [onSelect]
  )

  const handleCreate = useCallback(() => {
    onCreate?.()
  }, [onCreate])

  const handleEdit = useCallback(
    (item: IDebitNoteItem) => {
      onEdit?.(item)
    },
    [onEdit]
  )

  const handleDelete = useCallback(
    (itemId: string) => {
      const item = data.find((d) => d.debitNoteId.toString() === itemId)
      if (item) {
        onDelete?.(item)
      }
    },
    [onDelete, data]
  )

  const handleBulkDelete = useCallback(
    (selectedIds: string[]) => {
      const items = data.filter((d) =>
        selectedIds.includes(d.debitNoteId.toString())
      )
      onBulkDelete?.(items)
    },
    [onBulkDelete, data]
  )

  const handleDataReorder = useCallback(
    (newData: IDebitNoteItem[]) => {
      // Update itemNo to reflect the new order (1, 2, 3, 4...)
      // Keep actualItemNo unchanged to preserve original order
      const reorderedData = newData.map((item, index) => {
        const newItemNo = index + 1001
        const newDebitNoteNo = item.debitNoteNo.replace(
          /\/\d+$/,
          `/${newItemNo}`
        )

        return {
          ...item,
          updatedItemNo: newItemNo, // Update itemNo to new sequential order
          updatedDebitNoteNo: newDebitNoteNo, // Update debit note number with new item number
          // actualItemNo remains unchanged
        }
      })

      onDataReorder?.(reorderedData)
    },
    [onDataReorder]
  )

  return (
    <DebitNoteBaseTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      moduleId={moduleId}
      transactionId={transactionId}
      tableName={TableName.debitNote}
      emptyMessage="No debit note data available"
      accessorId="debitNoteId"
      onRefresh={handleRefresh}
      onFilterChange={handleFilterChange}
      onSelect={handleSelect}
      onCreate={handleCreate}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onBulkDelete={handleBulkDelete}
      onDataReorder={handleDataReorder}
      isConfirmed={isConfirmed}
      showHeader={false}
      showActions={true}
      hideCheckbox={true}
      hideView={true}
      hideEdit={true}
      hideDelete={true}
      hideCreate={true}
      disableOnDebitNoteExists={false}
    />
  )
}
