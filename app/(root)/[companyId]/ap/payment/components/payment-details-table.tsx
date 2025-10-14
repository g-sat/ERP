import { useEffect, useState } from "react"
import { IApPaymentDt } from "@/interfaces"
import { IVisibleFields } from "@/interfaces/setting"
import { ColumnDef } from "@tanstack/react-table"

import { TableName } from "@/lib/utils"
import { AccountBaseTable } from "@/components/table/table-account"

// Extended column definition with hide property
type ExtendedColumnDef<T> = ColumnDef<T> & {
  hidden?: boolean
}

// Use flexible data type that can work with form data
interface PaymentDetailsTableProps {
  data: IApPaymentDt[]
  onDelete?: (itemNo: number) => void
  onBulkDelete?: (selectedItemNos: number[]) => void
  onEdit?: (template: IApPaymentDt) => void
  onRefresh?: () => void
  onFilterChange?: (filters: { search?: string; sortOrder?: string }) => void
  onDataReorder?: (newData: IApPaymentDt[]) => void
  visible: IVisibleFields
}

export default function PaymentDetailsTable({
  data,
  onDelete,
  onBulkDelete,
  onEdit,
  onRefresh,
  onFilterChange,
  onDataReorder,
  visible: _visible,
}: PaymentDetailsTableProps) {
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

  // Define columns with visible prop checks - Payment specific fields
  const columns: ExtendedColumnDef<IApPaymentDt>[] = [
    {
      accessorKey: "itemNo",
      header: "Item No",
      size: 60,
      cell: ({ row }: { row: { original: IApPaymentDt } }) => (
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
      accessorKey: "docCurrencyCode",
      header: "Currency",
      size: 100,
      cell: ({ row }: { row: { original: IApPaymentDt } }) => (
        <div className="text-right">{row.original.docCurrencyCode}</div>
      ),
    },
    {
      accessorKey: "docExhRate",
      header: "Exh Rate",
      size: 100,
      cell: ({ row }: { row: { original: IApPaymentDt } }) => (
        <div className="text-right">{row.original.docExhRate}</div>
      ),
    },
    {
      accessorKey: "docAccountDate",
      header: "Account Date",
      size: 120,
    },
    {
      accessorKey: "docBalAmt",
      header: "Balance Amt",
      size: 120,
      cell: ({ row }: { row: { original: IApPaymentDt } }) => (
        <div className="text-right">{row.original.docBalAmt}</div>
      ),
    },
    {
      accessorKey: "docBalLocalAmt",
      header: "Balance Local Amt",
      size: 140,
      cell: ({ row }: { row: { original: IApPaymentDt } }) => (
        <div className="text-right">{row.original.docBalLocalAmt}</div>
      ),
    },
    {
      accessorKey: "allocAmt",
      header: "Alloc Amt",
      size: 100,
      cell: ({ row }: { row: { original: IApPaymentDt } }) => (
        <div className="text-right">{row.original.allocAmt}</div>
      ),
    },
    {
      accessorKey: "allocLocalAmt",
      header: "Alloc Local Amt",
      size: 120,
      cell: ({ row }: { row: { original: IApPaymentDt } }) => (
        <div className="text-right">{row.original.allocLocalAmt}</div>
      ),
    },
    {
      accessorKey: "docDueDate",
      header: "Due Date",
      size: 120,
    },
    {
      accessorKey: "docTotAmt",
      header: "Doc Total Amt",
      size: 100,
      cell: ({ row }: { row: { original: IApPaymentDt } }) => (
        <div className="text-right">{row.original.docTotAmt}</div>
      ),
    },
    {
      accessorKey: "docTotLocalAmt",
      header: "Doc Total Local Amt",
      size: 120,
      cell: ({ row }: { row: { original: IApPaymentDt } }) => (
        <div className="text-right">{row.original.docTotLocalAmt}</div>
      ),
    },

    {
      accessorKey: "docAllocAmt",
      header: "Doc Alloc Amt",
      size: 120,
      cell: ({ row }: { row: { original: IApPaymentDt } }) => (
        <div className="text-right">{row.original.docAllocAmt}</div>
      ),
    },
    {
      accessorKey: "docAllocLocalAmt",
      header: "Doc Alloc Local Amt",
      size: 140,
      cell: ({ row }: { row: { original: IApPaymentDt } }) => (
        <div className="text-right">{row.original.docAllocLocalAmt}</div>
      ),
    },
    {
      accessorKey: "centDiff",
      header: "Cent Diff",
      size: 80,
      cell: ({ row }: { row: { original: IApPaymentDt } }) => (
        <div className="text-right">{row.original.centDiff}</div>
      ),
    },
    {
      accessorKey: "exhGainLoss",
      header: "Exh Gain/Loss",
      size: 100,
      cell: ({ row }: { row: { original: IApPaymentDt } }) => (
        <div className="text-right">{row.original.exhGainLoss}</div>
      ),
    },
    {
      accessorKey: "transactionId",
      header: "Transaction",
      size: 100,
      cell: ({ row }: { row: { original: IApPaymentDt } }) => (
        <div className="text-right">{row.original.transactionId}</div>
      ),
      hidden: true,
    },
    {
      accessorKey: "docCurrencyId",
      header: "Currency",
      size: 100,
      cell: ({ row }: { row: { original: IApPaymentDt } }) => (
        <div className="text-right">{row.original.docCurrencyId}</div>
      ),
      hidden: true,
    },
  ]

  // Filter out columns with hidden: true
  const visibleColumns = columns.filter((column) => !column.hidden)

  if (!mounted) {
    return null
  }

  return (
    <div className="w-full p-2">
      <AccountBaseTable
        data={data}
        columns={visibleColumns as ColumnDef<IApPaymentDt>[]}
        moduleId={25}
        transactionId={2}
        tableName={TableName.apPaymentDt}
        emptyMessage="No payment details found."
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
        hideView={true}
        hideEdit={true}
        hideDelete={false}
        hideCheckbox={false}
        disableOnAccountExists={false}
      />
    </div>
  )
}
