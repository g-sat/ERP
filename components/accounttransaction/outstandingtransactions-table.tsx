import { useCallback, useEffect, useState } from "react"
import { IApOutTransaction } from "@/interfaces"
import { IVisibleFields } from "@/interfaces/setting"
import { ColumnDef } from "@tanstack/react-table"

import { TableName } from "@/lib/utils"
import { AccountBaseTable } from "@/components/table/table-account"

// Extended column definition with hide property
type ExtendedColumnDef<T> = ColumnDef<T> & {
  hidden?: boolean
}

// Use flexible data type that can work with form data
interface OutStandingTransactionsTableProps {
  data: IApOutTransaction[]
  onRefresh?: () => void
  onFilterChange?: (filters: { search?: string; sortOrder?: string }) => void
  visible: IVisibleFields
  onSelect?: (transaction: IApOutTransaction | null) => void
  onBulkSelectionChange?: (selectedIds: string[]) => void
}

export default function OutStandingTransactionsTable({
  data,
  onRefresh,
  onFilterChange,
  onSelect,
  onBulkSelectionChange,
  visible: _visible,
}: OutStandingTransactionsTableProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh()
    }
  }, [onRefresh])

  const handleFilterChange = useCallback(
    (filters: { search?: string; sortOrder?: string }) => {
      if (onFilterChange) {
        onFilterChange(filters)
      }
    },
    [onFilterChange]
  )

  const handleSelect = useCallback(
    (transaction: IApOutTransaction | null) => {
      if (onSelect) {
        onSelect(transaction)
      }
    },
    [onSelect]
  )

  const handleBulkSelectionChange = useCallback(
    (selectedIds: string[]) => {
      if (onBulkSelectionChange) {
        onBulkSelectionChange(selectedIds)
      }
    },
    [onBulkSelectionChange]
  )

  // Define columns based on IApOutTransaction interface
  const columns: ExtendedColumnDef<IApOutTransaction>[] = [
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
      accessorKey: "accountDate",
      header: "Account Date",
      size: 120,
    },

    {
      accessorKey: "supplierName",
      header: "Supplier Name",
      size: 150,
    },
    {
      accessorKey: "currencyCode",
      header: "Currency Code",
      size: 100,
    },

    {
      accessorKey: "exhRate",
      header: "Exchange Rate",
      size: 100,
      cell: ({ row }: { row: { original: IApOutTransaction } }) => (
        <div className="text-right">{row.original.exhRate}</div>
      ),
    },
    {
      accessorKey: "totAmt",
      header: "Total Amount",
      size: 120,
      cell: ({ row }: { row: { original: IApOutTransaction } }) => (
        <div className="text-right">{row.original.totAmt}</div>
      ),
    },
    {
      accessorKey: "totLocalAmt",
      header: "Total Local Amt",
      size: 120,
      cell: ({ row }: { row: { original: IApOutTransaction } }) => (
        <div className="text-right">{row.original.totLocalAmt}</div>
      ),
    },
    {
      accessorKey: "balAmt",
      header: "Balance Amount",
      size: 120,
      cell: ({ row }: { row: { original: IApOutTransaction } }) => (
        <div className="text-right">{row.original.balAmt}</div>
      ),
    },
    {
      accessorKey: "balLocalAmt",
      header: "Balance Local Amt",
      size: 140,
      cell: ({ row }: { row: { original: IApOutTransaction } }) => (
        <div className="text-right">{row.original.balLocalAmt}</div>
      ),
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      size: 150,
    },
    {
      accessorKey: "createBy",
      header: "Created By",
      size: 120,
    },
    {
      accessorKey: "createDate",
      header: "Create Date",
      size: 120,
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      size: 120,
    },
    {
      accessorKey: "supplierCode",
      header: "Supplier Code",
      size: 100,
      hidden: true,
    },
    {
      accessorKey: "transactionId",
      header: "Transaction ID",
      size: 100,
      cell: ({ row }: { row: { original: IApOutTransaction } }) => (
        <div className="text-right">{row.original.transactionId}</div>
      ),
      hidden: true,
    },
    {
      accessorKey: "documentId",
      header: "Document ID",
      size: 100,
      cell: ({ row }: { row: { original: IApOutTransaction } }) => (
        <div className="text-right">{row.original.documentId}</div>
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
        columns={visibleColumns as ColumnDef<IApOutTransaction>[]}
        moduleId={25}
        transactionId={2}
        tableName={TableName.apOutTransaction}
        emptyMessage="No outstanding transactions found."
        accessorId="documentId"
        onRefresh={handleRefresh}
        onFilterChange={handleFilterChange}
        onSelect={handleSelect}
        onBulkSelectionChange={handleBulkSelectionChange}
        showHeader={false}
        showActions={true}
        hideView={true}
        hideEdit={true}
        hideDelete={true}
        hideCheckbox={false}
        disableOnAccountExists={false}
      />
    </div>
  )
}
