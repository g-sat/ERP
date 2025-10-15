import React, { useEffect, useState } from "react"
import { ICbBankReconDt } from "@/interfaces"
import { IVisibleFields } from "@/interfaces/setting"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { TableName } from "@/lib/utils"
import { AccountBaseTable } from "@/components/table/table-account"

// Use flexible data type that can work with form data
interface BankReconDetailsTableProps {
  data: ICbBankReconDt[]
  onDelete?: (itemNo: number) => void
  onBulkDelete?: (selectedItemNos: number[]) => void
  onEdit?: (template: ICbBankReconDt) => void
  onRefresh?: () => void
  onFilterChange?: (filters: { search?: string; sortOrder?: string }) => void
  onDataReorder?: (newData: ICbBankReconDt[]) => void
  visible: IVisibleFields
}

export default function BankReconDetailsTable({
  data,
  onDelete,
  onBulkDelete,
  onEdit,
  onRefresh,
  onFilterChange,
  onDataReorder,
  visible,
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
    if (onDelete) {
      onDelete(Number(itemId))
    }
  }

  const handleBulkDelete = (selectedIds: string[]) => {
    if (onBulkDelete) {
      onBulkDelete(selectedIds.map((id) => Number(id)))
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
    },
    {
      accessorKey: "chequeDate",
      header: "Cheque Date",
      size: 100,
      cell: ({ row }) => {
        const date = row.original.chequeDate
          ? new Date(row.original.chequeDate)
          : null
        return date ? format(date, dateFormat) : "-"
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
    <AccountBaseTable
      data={data as unknown[]}
      columns={columns as ColumnDef<unknown>[]}
      accessorId={"itemNo" as keyof unknown}
      onDelete={handleDelete}
      onBulkDelete={handleBulkDelete}
      onEdit={(row) => onEdit?.(row as ICbBankReconDt)}
      onRefresh={onRefresh}
      onFilterChange={onFilterChange}
      onDataReorder={(newData) => onDataReorder?.(newData as ICbBankReconDt[])}
      tableName={TableName.cbBankReconDt}
      emptyMessage="No reconciliation details. Add transactions to reconcile."
    />
  )
}
