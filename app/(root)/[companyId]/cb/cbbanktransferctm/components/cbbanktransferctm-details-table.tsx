import React, { useEffect, useState } from "react"
import { ICbBankTransferCtmDt } from "@/interfaces"
import { IVisibleFields } from "@/interfaces/setting"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"

import { TableName } from "@/lib/utils"
import { AccountBaseTable } from "@/components/table/table-account"

// Use flexible data type that can work with form data
interface BankTransferCtmDetailsTableProps {
  data: ICbBankTransferCtmDt[]
  onDelete?: (itemNo: number) => void
  onBulkDelete?: (selectedItemNos: number[]) => void
  onEdit?: (template: ICbBankTransferCtmDt) => void
  onRefresh?: () => void
  onFilterChange?: (filters: { search?: string; sortOrder?: string }) => void
  onDataReorder?: (newData: ICbBankTransferCtmDt[]) => void
  visible: IVisibleFields
}

export default function BankTransferCtmDetailsTable({
  data,
  onDelete,
  onBulkDelete,
  onEdit,
  onRefresh,
  onFilterChange,
  onDataReorder,
  visible,
}: BankTransferCtmDetailsTableProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const exhRateDec = decimals[0]?.exhRateDec || 6
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

  // Define columns - ALL fields from ICbBankTransferCtmDt interface
  const columns: ColumnDef<ICbBankTransferCtmDt>[] = [
    {
      accessorKey: "itemNo",
      header: "Item No",
      size: 60,
      cell: ({ row }) => (
        <div className="text-right">{row.original.itemNo}</div>
      ),
    },
    // Job Order Fields
    ...(visible?.m_JobOrderId
      ? [
          {
            accessorKey: "jobOrderNo" as const,
            header: "Job Order",
            size: 120,
          },
          {
            accessorKey: "taskName" as const,
            header: "Task",
            size: 150,
          },
          {
            accessorKey: "serviceName" as const,
            header: "Service",
            size: 150,
          },
        ]
      : []),
    // TO Bank Fields
    {
      accessorKey: "toBankCode",
      header: "To Bank",
      size: 100,
    },
    {
      accessorKey: "toCurrencyCode",
      header: "To Currency",
      size: 80,
    },
    {
      accessorKey: "toExhRate",
      header: "To Exh Rate",
      size: 100,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.toExhRate.toLocaleString(undefined, {
            minimumFractionDigits: exhRateDec,
            maximumFractionDigits: exhRateDec,
          })}
        </div>
      ),
    },
    {
      accessorKey: "toBankChgAmt",
      header: "To Bank Charge",
      size: 120,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.toBankChgAmt.toLocaleString(undefined, {
            minimumFractionDigits: amtDec,
            maximumFractionDigits: amtDec,
          })}
        </div>
      ),
    },
    {
      accessorKey: "toTotAmt",
      header: "To Total Amount",
      size: 130,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.toTotAmt.toLocaleString(undefined, {
            minimumFractionDigits: amtDec,
            maximumFractionDigits: amtDec,
          })}
        </div>
      ),
    },
    {
      accessorKey: "toTotLocalAmt",
      header: "To Total Local",
      size: 130,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.toTotLocalAmt.toLocaleString(undefined, {
            minimumFractionDigits: locAmtDec,
            maximumFractionDigits: locAmtDec,
          })}
        </div>
      ),
    },
    // Bank Exchange Fields
    {
      accessorKey: "bankExhRate",
      header: "Bank Exh Rate",
      size: 120,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.bankExhRate.toLocaleString(undefined, {
            minimumFractionDigits: exhRateDec,
            maximumFractionDigits: exhRateDec,
          })}
        </div>
      ),
    },
    {
      accessorKey: "bankTotAmt",
      header: "Bank Total",
      size: 120,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.bankTotAmt.toLocaleString(undefined, {
            minimumFractionDigits: amtDec,
            maximumFractionDigits: amtDec,
          })}
        </div>
      ),
    },
    {
      accessorKey: "bankTotLocalAmt",
      header: "Bank Total Local",
      size: 130,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.bankTotLocalAmt.toLocaleString(undefined, {
            minimumFractionDigits: locAmtDec,
            maximumFractionDigits: locAmtDec,
          })}
        </div>
      ),
    },
  ]

  if (!mounted) {
    return null
  }

  return (
    <div className="w-full p-2">
      <AccountBaseTable
        data={data as unknown[]}
        columns={columns as ColumnDef<unknown>[]}
        tableName={TableName.cbBankTransferCtmDt}
        emptyMessage="No transfer details found. Add transfer destinations."
        accessorId={"itemNo" as keyof unknown}
        onRefresh={onRefresh}
        onFilterChange={onFilterChange}
        onBulkDelete={handleBulkDelete}
        onBulkSelectionChange={() => {}}
        onDataReorder={(newData) =>
          onDataReorder?.(newData as ICbBankTransferCtmDt[])
        }
        onEdit={(row) => onEdit?.(row as ICbBankTransferCtmDt)}
        onDelete={handleDelete}
        showHeader={true}
        showActions={true}
        hideEdit={false}
        hideDelete={false}
        hideCheckbox={false}
        disableOnAccountExists={false}
      />
    </div>
  )
}
