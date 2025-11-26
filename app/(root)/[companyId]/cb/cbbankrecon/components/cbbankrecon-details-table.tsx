import { useEffect, useState } from "react"
import { ICbBankReconDt } from "@/interfaces"
import { IVisibleFields } from "@/interfaces/setting"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format, parse } from "date-fns"

import { TableName } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { AccountEditableBaseTable } from "@/components/table/table-account-editable"

// Use flexible data type that can work with form data
interface BankReconDetailsTableProps {
  data: ICbBankReconDt[]
  onDeleteAction?: (itemNo: number) => void
  onBulkDeleteAction?: (selectedItemNos: number[]) => void
  onRefreshAction?: () => void
  onFilterChange?: (filters: { search?: string; sortOrder?: string }) => void
  onDataReorder?: (newData: ICbBankReconDt[]) => void
  onCellUpdate?: (
    itemNo: number,
    field: keyof ICbBankReconDt,
    value: string | Date
  ) => void
  visible: IVisibleFields
}

export default function BankReconDetailsTable({
  data,
  onDeleteAction,
  onBulkDeleteAction,
  onRefreshAction,
  onFilterChange,
  onDataReorder,
  onCellUpdate,
  visible: _visible,
}: BankReconDetailsTableProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const exhRateDec = decimals[0]?.exhRateDec || 6
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Wrapper functions to convert string to number
  const handleDelete = (itemId: string) => {
    if (onDeleteAction) {
      onDeleteAction(Number(itemId))
    }
  }

  const handleBulkDelete = (selectedIds: string[]) => {
    if (onBulkDeleteAction) {
      onBulkDeleteAction(selectedIds.map((id) => Number(id)))
    }
  }

  // Define columns - ALL fields from ICbBankReconDt interface
  const columns: ColumnDef<ICbBankReconDt>[] = [
    {
      accessorKey: "itemNo",
      header: "Item No",
      size: 60,
      cell: ({ row }) => (
        <div className="text-right">{row.original.itemNo}</div>
      ),
    },
    {
      accessorKey: "isSel",
      header: "Sel",
      size: 50,
      cell: ({ row }) => (
        <div className="text-center">{row.original.isSel ? "✓" : ""}</div>
      ),
    },
    {
      accessorKey: "moduleId",
      header: "Module",
      size: 70,
      cell: ({ row }) => (
        <div className="text-right">{row.original.moduleId}</div>
      ),
    },
    {
      accessorKey: "transactionId",
      header: "Trans",
      size: 70,
      cell: ({ row }) => (
        <div className="text-right">{row.original.transactionId}</div>
      ),
    },
    {
      accessorKey: "documentId",
      header: "Doc ID",
      size: 80,
      cell: ({ row }) => (
        <div className="text-right">{row.original.documentId}</div>
      ),
    },
    {
      accessorKey: "documentNo",
      header: "Document No",
      size: 120,
    },
    {
      accessorKey: "docReferenceNo",
      header: "Doc Reference",
      size: 120,
    },
    {
      accessorKey: "accountDate",
      header: "Account Date",
      size: 100,
      cell: ({ row }) => {
        const date = row.original.accountDate
          ? new Date(row.original.accountDate)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "paymentTypeId",
      header: "Payment Type",
      size: 80,
      cell: ({ row }) => (
        <div className="text-right">{row.original.paymentTypeId}</div>
      ),
    },
    {
      accessorKey: "chequeNo",
      header: "Cheque No",
      size: 100,
      cell: ({ row }) => (
        <Input
          value={row.original.chequeNo || ""}
          onChange={(e) => {
            if (onCellUpdate) {
              onCellUpdate(row.original.itemNo, "chequeNo", e.target.value)
            }
          }}
          className="hover:border-input focus:border-primary h-7 border-transparent bg-transparent px-2 text-sm"
          placeholder="Enter cheque no"
        />
      ),
    },
    {
      accessorKey: "chequeDate",
      header: "Cheque Date",
      size: 120,
      cell: ({ row }) => {
        const date = row.original.chequeDate
          ? new Date(row.original.chequeDate)
          : null

        return (
          <Input
            type="date"
            value={date ? format(date, "yyyy-MM-dd") : ""}
            onChange={(e) => {
              if (onCellUpdate && e.target.value) {
                const parsedDate = parse(
                  e.target.value,
                  "yyyy-MM-dd",
                  new Date()
                )
                onCellUpdate(row.original.itemNo, "chequeDate", parsedDate)
              }
            }}
            className="hover:border-input focus:border-primary h-7 border-transparent bg-transparent px-2 text-sm"
          />
        )
      },
    },
    {
      accessorKey: "customerId",
      header: "Customer",
      size: 80,
      cell: ({ row }) => (
        <div className="text-right">{row.original.customerId || "-"}</div>
      ),
    },
    {
      accessorKey: "supplierId",
      header: "Supplier",
      size: 80,
      cell: ({ row }) => (
        <div className="text-right">{row.original.supplierId || "-"}</div>
      ),
    },
    {
      accessorKey: "glId",
      header: "GL Account",
      size: 80,
      cell: ({ row }) => (
        <div className="text-right">{row.original.glId || "-"}</div>
      ),
    },
    {
      accessorKey: "isDebit",
      header: "Dr/Cr",
      size: 60,
      cell: ({ row }) => (
        <div className="text-center">{row.original.isDebit ? "Dr" : "Cr"}</div>
      ),
    },
    {
      accessorKey: "exhRate",
      header: "Exh Rate",
      size: 100,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.exhRate.toLocaleString(undefined, {
            minimumFractionDigits: exhRateDec,
            maximumFractionDigits: exhRateDec,
          })}
        </div>
      ),
    },
    {
      accessorKey: "totAmt",
      header: "Amount",
      size: 120,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.totAmt.toLocaleString(undefined, {
            minimumFractionDigits: amtDec,
            maximumFractionDigits: amtDec,
          })}
        </div>
      ),
    },
    {
      accessorKey: "totLocalAmt",
      header: "Local Amount",
      size: 120,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.totLocalAmt.toLocaleString(undefined, {
            minimumFractionDigits: locAmtDec,
            maximumFractionDigits: locAmtDec,
          })}
        </div>
      ),
    },
    {
      accessorKey: "paymentFromTo",
      header: "Payment From/To",
      size: 150,
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      size: 200,
    },
    {
      accessorKey: "editVersion",
      header: "Ver",
      size: 50,
      cell: ({ row }) => (
        <div className="text-right">{row.original.editVersion}</div>
      ),
    },
  ]

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <AccountEditableBaseTable
      data={data as unknown[]}
      columns={columns as ColumnDef<unknown>[]}
      accessorId={"itemNo" as keyof unknown}
      onDeleteAction={handleDelete}
      onBulkDeleteAction={handleBulkDelete}
      onRefreshAction={onRefreshAction}
      onFilterChange={onFilterChange}
      onDataReorder={(newData) => onDataReorder?.(newData as ICbBankReconDt[])}
      tableName={TableName.cbBankReconDt}
      emptyMessage="No reconciliation details. Add transactions to reconcile."
      hideEdit={true}
    />
  )
}
