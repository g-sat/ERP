import { useEffect, useState } from "react"
import { formatDate } from "@/helpers/account"
import { IArReceiptDt } from "@/interfaces"
import { IVisibleFields } from "@/interfaces/setting"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"

import { formatNumber } from "@/lib/format-utils"
import { ARTransactionId, ModuleId, TableName } from "@/lib/utils"
import { AccountReceiptBaseTable } from "@/components/table/table-account-receipt"

// Extended column definition with hide property
type ExtendedColumnDef<T> = ColumnDef<T> & {
  hidden?: boolean
}

// Use flexible data type that can work with form data
interface ReceiptDetailsTableProps {
  data: IArReceiptDt[]
  onDelete?: (itemNo: number) => void
  onBulkDelete?: (selectedItemNos: number[]) => void
  onDataReorder?: (newData: IArReceiptDt[]) => void
  onCellEdit?: (itemNo: number, field: string, value: number) => void
  visible: IVisibleFields
  isCancelled?: boolean
}

export default function ReceiptDetailsTable({
  data,
  onDelete,
  onBulkDelete,
  onDataReorder,
  onCellEdit,
  visible: _visible,
  isCancelled = false,
}: ReceiptDetailsTableProps) {
  const [mounted, setMounted] = useState(false)
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const exhRateDec = decimals[0]?.exhRateDec || 6

  useEffect(() => {
    setMounted(true)
  }, [])

  const EditableNumberInput = ({
    value,
    decimals,
    onChange,
  }: {
    value: number
    decimals: number
    onChange: (value: number) => void
  }) => {
    const [displayValue, setDisplayValue] = useState(
      formatNumber(value, decimals)
    )

    useEffect(() => {
      setDisplayValue(formatNumber(value, decimals))
    }, [value, decimals])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setDisplayValue(e.target.value)
    }

    const handleBlur = () => {
      const numValue = Number(displayValue) || 0
      const roundedValue = Number(numValue.toFixed(decimals))
      setDisplayValue(formatNumber(roundedValue, decimals))

      // Only trigger onChange if the value actually changed
      if (roundedValue !== value) {
        console.log(
          `Value changed from ${value} to ${roundedValue} - triggering calculation`
        )
        onChange(roundedValue)
      } else {
        console.log(`Value unchanged (${value}) - skipping calculation`)
      }
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.select()
    }

    return (
      <input
        type="text"
        className="w-full rounded border px-2 py-1 text-right focus:ring-2 focus:ring-blue-500 focus:outline-none"
        style={{ textAlign: "right" }}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder="0.00"
      />
    )
  }

  // Define columns with visible prop checks - Receipt specific fields
  const columns: ExtendedColumnDef<IArReceiptDt>[] = [
    {
      accessorKey: "itemNo",
      header: "Item",
      size: 40,
      cell: ({ row }: { row: { original: IArReceiptDt } }) => (
        <div className="text-right">{row.original.itemNo}</div>
      ),
    },

    {
      accessorKey: "documentNo",
      header: "Document No",
      size: 150,
    },
    {
      accessorKey: "referenceNo",
      header: "Reference No",
      size: 120,
    },

    {
      accessorKey: "docCurrencyCode",
      header: "Currency",
      size: 60,
    },
    {
      accessorKey: "docExhRate",
      header: "Exh Rate",
      size: 100,
      cell: ({ row }: { row: { original: IArReceiptDt } }) => (
        <div className="text-right">
          {formatNumber(row.original.docExhRate, exhRateDec)}
        </div>
      ),
    },
    {
      accessorKey: "docAccountDate",
      header: "Account Date",
      size: 120,
      cell: ({ row }: { row: { original: IArReceiptDt } }) => (
        <div className="text-center">
          {formatDate(row.original.docAccountDate)}
        </div>
      ),
    },
    {
      accessorKey: "docBalAmt",
      header: "Balance Amt",
      size: 120,
      cell: ({ row }: { row: { original: IArReceiptDt } }) => (
        <div className="text-right">
          {formatNumber(row.original.docBalAmt, amtDec)}
        </div>
      ),
    },

    {
      accessorKey: "allocAmt",
      header: "Alloc Amt",
      size: 150,
      cell: ({ row }: { row: { original: IArReceiptDt } }) => {
        const docBalAmt = row.original.docBalAmt || 0
        const isNegative = docBalAmt < 0

        return (
          <EditableNumberInput
            value={row.original.allocAmt || 0}
            decimals={amtDec}
            onChange={(value) => {
              let numValue = Number(value) || 0

              if (isNegative && numValue > 0) numValue = -Math.abs(numValue)
              if (!isNegative && numValue < 0) numValue = Math.abs(numValue)

              if (isNegative) {
                if (numValue < docBalAmt) numValue = docBalAmt
              } else {
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
      accessorKey: "docBalLocalAmt",
      header: "Balance Local Amt",
      size: 140,
      cell: ({ row }: { row: { original: IArReceiptDt } }) => (
        <div className="text-right">
          {formatNumber(row.original.docBalLocalAmt, locAmtDec)}
        </div>
      ),
    },
    {
      accessorKey: "allocLocalAmt",
      header: "Alloc Local Amt",
      size: 170,
      cell: ({ row }: { row: { original: IArReceiptDt } }) => (
        <div className="text-right">
          {formatNumber(row.original.allocLocalAmt, locAmtDec)}
        </div>
      ),
    },
    {
      accessorKey: "exhGainLoss",
      header: "Exh Gain/Loss",
      size: 100,
      cell: ({ row }: { row: { original: IArReceiptDt } }) => (
        <div className="text-right">
          {formatNumber(row.original.exhGainLoss, amtDec)}
        </div>
      ),
    },
    {
      accessorKey: "docDueDate",
      header: "Due Date",
      size: 120,
      cell: ({ row }: { row: { original: IArReceiptDt } }) => (
        <div className="text-center">{formatDate(row.original.docDueDate)}</div>
      ),
    },
    {
      accessorKey: "docTotAmt",
      header: "Doc Total Amt",
      size: 100,
      cell: ({ row }: { row: { original: IArReceiptDt } }) => (
        <div className="text-right">
          {formatNumber(row.original.docTotAmt, amtDec)}
        </div>
      ),
    },
    {
      accessorKey: "docTotLocalAmt",
      header: "Doc Total Local Amt",
      size: 120,
      cell: ({ row }: { row: { original: IArReceiptDt } }) => (
        <div className="text-right">
          {formatNumber(row.original.docTotLocalAmt, locAmtDec)}
        </div>
      ),
    },

    {
      accessorKey: "docAllocAmt",
      header: "Doc Alloc Amt",
      size: 120,
      cell: ({ row }: { row: { original: IArReceiptDt } }) => (
        <div className="text-right">
          {formatNumber(row.original.docAllocAmt, amtDec)}
        </div>
      ),
    },
    {
      accessorKey: "docAllocLocalAmt",
      header: "Doc Alloc Local Amt",
      size: 140,
      cell: ({ row }: { row: { original: IArReceiptDt } }) => (
        <div className="text-right">
          {formatNumber(row.original.docAllocLocalAmt, locAmtDec)}
        </div>
      ),
    },
    {
      accessorKey: "centDiff",
      header: "Cent Diff",
      size: 80,
      cell: ({ row }: { row: { original: IArReceiptDt } }) => (
        <div className="text-right">
          {formatNumber(row.original.centDiff, locAmtDec)}
        </div>
      ),
    },

    {
      accessorKey: "transactionId",
      header: "Transaction",
      size: 100,
      cell: ({ row }: { row: { original: IArReceiptDt } }) => (
        <div className="text-right">{row.original.transactionId}</div>
      ),
      hidden: true,
    },
    {
      accessorKey: "docCurrencyId",
      header: "Currency",
      size: 100,
      cell: ({ row }: { row: { original: IArReceiptDt } }) => (
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
      <AccountReceiptBaseTable
        data={data}
        columns={visibleColumns as ColumnDef<IArReceiptDt>[]}
        moduleId={ModuleId.ar}
        transactionId={ARTransactionId.receipt}
        tableName={TableName.arReceiptDt}
        emptyMessage="No receipt details found."
        accessorId="itemNo"
        onBulkDelete={
          isCancelled
            ? undefined
            : (selectedIds: string[]) =>
                onBulkDelete?.(selectedIds.map((id) => Number(id)))
        }
        onBulkSelectionChange={() => {}}
        onDataReorder={isCancelled ? undefined : onDataReorder}
        onDelete={
          isCancelled
            ? undefined
            : (itemId: string) => onDelete?.(Number(itemId))
        }
        showHeader={true}
        showActions={true}
        hideEdit={true}
        hideDelete={isCancelled}
        hideCheckbox={isCancelled}
        disableOnAccountExists={false}
        maxHeight="380px"
        pageSizeOption={10}
      />
    </div>
  )
}
