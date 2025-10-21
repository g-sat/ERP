import { useEffect, useState } from "react"
import { IApPaymentDt } from "@/interfaces"
import { IVisibleFields } from "@/interfaces/setting"
import { useAuthStore } from "@/stores/auth-store"
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
  onCellEdit?: (itemNo: number, field: string, value: number) => void
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
  onCellEdit,
  visible: _visible,
}: PaymentDetailsTableProps) {
  const [mounted, setMounted] = useState(false)
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const exhRateDec = decimals[0]?.exhRateDec || 6

  useEffect(() => {
    setMounted(true)
  }, [])

  // Helper function to format numbers with proper decimals
  const formatNumber = (
    value: number | string | null | undefined,
    decimals: number
  ): string => {
    const numValue = Number(value) || 0
    return numValue.toFixed(decimals)
  }

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
        <div className="text-right">
          {formatNumber(row.original.docExhRate, exhRateDec)}
        </div>
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
        <div className="text-right">
          {formatNumber(row.original.docBalAmt, amtDec)}
        </div>
      ),
    },
    {
      accessorKey: "docBalLocalAmt",
      header: "Balance Local Amt",
      size: 140,
      cell: ({ row }: { row: { original: IApPaymentDt } }) => (
        <div className="text-right">
          {formatNumber(row.original.docBalLocalAmt, locAmtDec)}
        </div>
      ),
    },
    {
      accessorKey: "allocAmt",
      header: "Alloc Amt",
      size: 150,
      cell: ({ row }: { row: { original: IApPaymentDt } }) => {
        const docBalAmt = row.original.docBalAmt || 0
        const isNegative = docBalAmt < 0

        return (
          <input
            type="number"
            className="w-full rounded border px-2 py-1 text-right focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={formatNumber(row.original.allocAmt, amtDec)}
            onChange={(e) => {
              let value = parseFloat(e.target.value) || 0

              // Validate: same sign as docBalAmt
              if (isNegative && value > 0) value = -Math.abs(value)
              if (!isNegative && value < 0) value = Math.abs(value)

              // Validate: can't exceed docBalAmt
              if (isNegative) {
                // For negative, value should be >= docBalAmt (more negative is smaller)
                if (value < docBalAmt) value = docBalAmt
              } else {
                // For positive, value should be <= docBalAmt
                if (value > docBalAmt) value = docBalAmt
              }

              if (onCellEdit) {
                onCellEdit(row.original.itemNo, "allocAmt", value)
              }
            }}
            step="0.01"
          />
        )
      },
    },
    {
      accessorKey: "allocLocalAmt",
      header: "Alloc Local Amt",
      size: 170,
      cell: ({ row }: { row: { original: IApPaymentDt } }) => {
        const docBalLocalAmt = row.original.docBalLocalAmt || 0
        const isNegative = docBalLocalAmt < 0

        return (
          <input
            type="number"
            className="w-full rounded border px-2 py-1 text-right focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={formatNumber(row.original.allocLocalAmt, locAmtDec)}
            onChange={(e) => {
              let value = parseFloat(e.target.value) || 0

              // Validate: same sign as docBalLocalAmt
              if (isNegative && value > 0) value = -Math.abs(value)
              if (!isNegative && value < 0) value = Math.abs(value)

              // Validate: can't exceed docBalLocalAmt
              if (isNegative) {
                // For negative, value should be >= docBalLocalAmt (more negative is smaller)
                if (value < docBalLocalAmt) value = docBalLocalAmt
              } else {
                // For positive, value should be <= docBalLocalAmt
                if (value > docBalLocalAmt) value = docBalLocalAmt
              }

              if (onCellEdit) {
                onCellEdit(row.original.itemNo, "allocLocalAmt", value)
              }
            }}
            step="0.01"
          />
        )
      },
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
        <div className="text-right">
          {formatNumber(row.original.docTotAmt, amtDec)}
        </div>
      ),
    },
    {
      accessorKey: "docTotLocalAmt",
      header: "Doc Total Local Amt",
      size: 120,
      cell: ({ row }: { row: { original: IApPaymentDt } }) => (
        <div className="text-right">
          {formatNumber(row.original.docTotLocalAmt, locAmtDec)}
        </div>
      ),
    },

    {
      accessorKey: "docAllocAmt",
      header: "Doc Alloc Amt",
      size: 120,
      cell: ({ row }: { row: { original: IApPaymentDt } }) => (
        <div className="text-right">
          {formatNumber(row.original.docAllocAmt, amtDec)}
        </div>
      ),
    },
    {
      accessorKey: "docAllocLocalAmt",
      header: "Doc Alloc Local Amt",
      size: 140,
      cell: ({ row }: { row: { original: IApPaymentDt } }) => (
        <div className="text-right">
          {formatNumber(row.original.docAllocLocalAmt, locAmtDec)}
        </div>
      ),
    },
    {
      accessorKey: "centDiff",
      header: "Cent Diff",
      size: 80,
      cell: ({ row }: { row: { original: IApPaymentDt } }) => (
        <div className="text-right">
          {formatNumber(row.original.centDiff, locAmtDec)}
        </div>
      ),
    },
    {
      accessorKey: "exhGainLoss",
      header: "Exh Gain/Loss",
      size: 100,
      cell: ({ row }: { row: { original: IApPaymentDt } }) => (
        <div className="text-right">
          {formatNumber(row.original.exhGainLoss, amtDec)}
        </div>
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
    <div>
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
