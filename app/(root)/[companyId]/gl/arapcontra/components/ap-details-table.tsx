import React, { useEffect, useState } from "react"
import { IGLContraDt } from "@/interfaces"
import { ColumnDef } from "@tanstack/react-table"

import { TableName } from "@/lib/utils"
import { AccountBaseTable } from "@/components/table/table-account"

// Use flexible data type that can work with form data
interface ApDetailsTableProps {
  data: IGLContraDt[]
  onDelete?: (itemNo: number) => void
  onBulkDelete?: (selectedItemNos: number[]) => void
  onEdit?: (template: IGLContraDt) => void
  onRefresh?: () => void
  onFilterChange?: (filters: { search?: string; sortOrder?: string }) => void
  onDataReorder?: (newData: IGLContraDt[]) => void
}

export default function ApDetailsTable({
  data,
  onDelete,
  onBulkDelete,
  onEdit,
  onRefresh,
  onFilterChange,
  onDataReorder,
}: ApDetailsTableProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Wrapper functions to convert string to number
  const handleDelete = (itemId: string) => {
    if (onDelete) {
      onDelete(Number(itemId))
    }
  }

  const handleBulkDelete = (selectedIds: string[]) => {
    if (onBulkDelete) {
      onBulkDelete(selectedIds.map((id) => Number(id)))
    }
  }

  // Define columns based on IGLContraDt interface
  const columns: ColumnDef<IGLContraDt>[] = [
    {
      accessorKey: "itemNo",
      header: "Item No",
      size: 60,
      cell: ({ row }: { row: { original: IGLContraDt } }) => (
        <div className="text-right">{row.original.itemNo}</div>
      ),
    },
    {
      accessorKey: "documentNo",
      header: "Document No",
      size: 120,
    },
    {
      accessorKey: "referenceNo",
      header: "Reference No",
      size: 120,
    },
    {
      accessorKey: "docAccountDate",
      header: "Account Date",
      size: 100,
      cell: ({ row }: { row: { original: IGLContraDt } }) => (
        <div className="text-center">
          {row.original.docAccountDate
            ? new Date(row.original.docAccountDate).toLocaleDateString()
            : ""}
        </div>
      ),
    },
    {
      accessorKey: "docDueDate",
      header: "Due Date",
      size: 100,
      cell: ({ row }: { row: { original: IGLContraDt } }) => (
        <div className="text-center">
          {row.original.docDueDate
            ? new Date(row.original.docDueDate).toLocaleDateString()
            : ""}
        </div>
      ),
    },
    {
      accessorKey: "docTotAmt",
      header: "Total Amount",
      size: 100,
      cell: ({ row }: { row: { original: IGLContraDt } }) => (
        <div className="text-right">{row.original.docTotAmt?.toFixed(2)}</div>
      ),
    },
    {
      accessorKey: "docTotLocalAmt",
      header: "Total Local Amount",
      size: 120,
      cell: ({ row }: { row: { original: IGLContraDt } }) => (
        <div className="text-right">
          {row.original.docTotLocalAmt?.toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "docBalAmt",
      header: "Balance Amount",
      size: 120,
      cell: ({ row }: { row: { original: IGLContraDt } }) => (
        <div className="text-right">{row.original.docBalAmt?.toFixed(2)}</div>
      ),
    },
    {
      accessorKey: "docBalLocalAmt",
      header: "Balance Local Amount",
      size: 140,
      cell: ({ row }: { row: { original: IGLContraDt } }) => (
        <div className="text-right">
          {row.original.docBalLocalAmt?.toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "allocAmt",
      header: "Allocation Amount",
      size: 120,
      cell: ({ row }: { row: { original: IGLContraDt } }) => (
        <div className="text-right">{row.original.allocAmt?.toFixed(2)}</div>
      ),
    },
    {
      accessorKey: "allocLocalAmt",
      header: "Allocation Local Amount",
      size: 150,
      cell: ({ row }: { row: { original: IGLContraDt } }) => (
        <div className="text-right">
          {row.original.allocLocalAmt?.toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "docExhRate",
      header: "Exchange Rate",
      size: 100,
      cell: ({ row }: { row: { original: IGLContraDt } }) => (
        <div className="text-right">{row.original.docExhRate?.toFixed(4)}</div>
      ),
    },
    {
      accessorKey: "centDiff",
      header: "Cent Diff",
      size: 80,
      cell: ({ row }: { row: { original: IGLContraDt } }) => (
        <div className="text-right">{row.original.centDiff?.toFixed(2)}</div>
      ),
    },
    {
      accessorKey: "exhGainLoss",
      header: "Exchange Gain/Loss",
      size: 120,
      cell: ({ row }: { row: { original: IGLContraDt } }) => (
        <div className="text-right">{row.original.exhGainLoss?.toFixed(2)}</div>
      ),
    },
  ]

  if (!mounted) {
    return null
  }

  return (
    <div className="w-full p-2">
      <AccountBaseTable
        data={data}
        columns={columns}
        moduleId={25}
        transactionId={1}
        tableName={TableName.arApContraDt}
        emptyMessage="No AP details found."
        accessorId="itemNo"
        onRefresh={onRefresh}
        onFilterChange={onFilterChange}
        onBulkDelete={handleBulkDelete}
        onBulkSelectionChange={() => {}}
        onDataReorder={onDataReorder}
        onEdit={onEdit}
        onDelete={handleDelete}
        showHeader={true}
        showActions={true}
        hideView={false}
        hideEdit={false}
        hideDelete={false}
        hideCheckbox={false}
        disableOnAccountExists={false}
      />
    </div>
  )
}
