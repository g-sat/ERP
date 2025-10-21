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

  // Custom Number Input Component for table cells
  const CustomTableNumberInput = ({
    value,
    decimals,
    onChange,
    className = "",
  }: {
    value: number
    decimals: number
    onChange: (value: number) => void
    className?: string
  }) => {
    const [displayValue, setDisplayValue] = useState(
      formatNumber(value, decimals)
    )

    useEffect(() => {
      setDisplayValue(formatNumber(value, decimals))
    }, [value, decimals])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      setDisplayValue(inputValue)
    }

    const handleBlur = () => {
      const numValue = Number(displayValue) || 0
      const roundedValue = Number(numValue.toFixed(decimals))
      setDisplayValue(formatNumber(roundedValue, decimals))
      onChange(roundedValue)
    }

    return (
      <input
        type="text"
        className={`w-full rounded border px-2 py-1 text-right focus:ring-2 focus:ring-blue-500 focus:outline-none ${className}`}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="0.00"
      />
    )
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
          <CustomTableNumberInput
            value={row.original.allocAmt || 0}
            decimals={amtDec}
            onChange={(value) => {
              let numValue = Number(value) || 0

              // Validate: same sign as docBalAmt
              if (isNegative && numValue > 0) numValue = -Math.abs(numValue)
              if (!isNegative && numValue < 0) numValue = Math.abs(numValue)

              // Validate: can't exceed docBalAmt
              if (isNegative) {
                // For negative, value should be >= docBalAmt (more negative is smaller)
                if (numValue < docBalAmt) numValue = docBalAmt
              } else {
                // For positive, value should be <= docBalAmt
                if (numValue > docBalAmt) numValue = docBalAmt
              }

              if (onCellEdit) {
                onCellEdit(row.original.itemNo, "allocAmt", numValue)
              }
            }}
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
          <CustomTableNumberInput
            value={row.original.allocLocalAmt || 0}
            decimals={locAmtDec}
            onChange={(value) => {
              let numValue = Number(value) || 0

              // Validate: same sign as docBalLocalAmt
              if (isNegative && numValue > 0) numValue = -Math.abs(numValue)
              if (!isNegative && numValue < 0) numValue = Math.abs(numValue)

              // Validate: can't exceed docBalLocalAmt
              if (isNegative) {
                // For negative, value should be >= docBalLocalAmt (more negative is smaller)
                if (numValue < docBalLocalAmt) numValue = docBalLocalAmt
              } else {
                // For positive, value should be <= docBalLocalAmt
                if (numValue > docBalLocalAmt) numValue = docBalLocalAmt
              }

              if (onCellEdit) {
                onCellEdit(row.original.itemNo, "allocLocalAmt", numValue)
              }
            }}
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
