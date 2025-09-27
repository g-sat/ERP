"use client"

import { useCallback, useMemo, useState } from "react"
import { IBulkChargeData } from "@/interfaces/checklist"
import { ColumnDef } from "@tanstack/react-table"
import { X } from "lucide-react"

import { TableName } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

interface BulkDebitNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: IBulkChargeData[]
  isLoading?: boolean
  onAddSelected?: (selectedItems: IBulkChargeData[]) => void
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
  // Define columns for the debit note table
  const columns: ColumnDef<IBulkChargeData>[] = useMemo(
    () => [
      {
        accessorKey: "chargeName",
        header: "Charge Name",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("chargeName") || "-"}</div>
        ),
        size: 200,
        minSize: 150,
        enableColumnFilter: true,
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => (
          <div className="max-w-xs truncate">
            {row.getValue("remarks") || "-"}
          </div>
        ),
        size: 350,
        minSize: 250,
      },
      {
        accessorKey: "chargeId",
        header: "Charge",
        cell: ({ row }) => (
          <div className="max-w-xs truncate">
            {row.getValue("chargeId") || "-"}
          </div>
        ),
        size: 100,
        minSize: 80,
      },
      {
        accessorKey: "glId",
        header: "GL",
        cell: ({ row }) => (
          <div className="max-w-xs truncate">{row.getValue("glId") || "-"}</div>
        ),
        size: 100,
        minSize: 80,
      },
    ],
    [] // No dependencies needed since column definitions don't depend on props
  )

  return (
    <DebitNoteBaseTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      moduleId={moduleId}
      transactionId={transactionId}
      tableName={TableName.debitNote}
      emptyMessage="No bulk charge details found."
      accessorId="chargeId"
      onRefresh={() => {}}
      onFilterChange={() => {}}
      onSelect={onSelect}
      onCreate={() => {}}
      onEdit={() => {}}
      onDelete={() => {}}
      onBulkDelete={() => {}}
      onBulkSelectionChange={onBulkSelectionChange}
      onDataReorder={onDataReorder}
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

// Dialog component (new)
export function BulkDebitNoteDialog({
  open,
  onOpenChange,
  data,
  isLoading = false,
  onAddSelected,
  moduleId,
  transactionId,
  isConfirmed,
}: BulkDebitNoteDialogProps) {
  const [selectedItems, setSelectedItems] = useState<IBulkChargeData[]>([])

  const handleBulkSelectionChange = useCallback(
    (selectedIds: string[]) => {
      const selected = data.filter(
        (item) =>
          item.chargeId && selectedIds.includes(item.chargeId.toString())
      )
      setSelectedItems(selected)
    },
    [data]
  )

  const handleAddSelected = useCallback(() => {
    if (onAddSelected && selectedItems.length > 0) {
      onAddSelected(selectedItems)
      setSelectedItems([])
      onOpenChange(false)
    }
  }, [onAddSelected, selectedItems, onOpenChange])

  const handleCancel = useCallback(() => {
    setSelectedItems([])
    onOpenChange(false)
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[90vw] !max-w-none overflow-y-auto">
        <DialogHeader className="border-b pb-2">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">
                Bulk Charges
              </DialogTitle>
              <DialogDescription>
                Select charges to add to the debit note.
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <BulkDebitNoteTable
            data={data}
            isLoading={isLoading}
            moduleId={moduleId}
            transactionId={transactionId}
            isConfirmed={isConfirmed}
            onBulkSelectionChange={handleBulkSelectionChange}
          />
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              {selectedItems.length} item(s) selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                onClick={handleAddSelected}
                disabled={selectedItems.length === 0}
              >
                Add Selected Items ({selectedItems.length})
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Default export (backward compatibility)
export default BulkDebitNoteTable
