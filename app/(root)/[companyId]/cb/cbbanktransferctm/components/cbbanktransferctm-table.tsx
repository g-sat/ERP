import { useState } from "react"
import { ICbBankTransferCtmFilter, ICbBankTransferCtmHd } from "@/interfaces"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format, subMonths } from "date-fns"
import { FormProvider, useForm } from "react-hook-form"

import { CBTransactionId, ModuleId, TableName } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import { DialogDataTable } from "@/components/table/table-dialog"

export interface BankTransferCtmTableProps {
  data: ICbBankTransferCtmHd[]
  isLoading: boolean
  onBankTransferCtmSelect: (
    selectedBankTransferCtm: ICbBankTransferCtmHd | undefined
  ) => void
  onRefresh: () => void
  onFilterChange: (filters: ICbBankTransferCtmFilter) => void
  initialFilters?: ICbBankTransferCtmFilter
}

export default function BankTransferCtmTable({
  data,
  isLoading = false,
  onBankTransferCtmSelect,
  onRefresh,
  onFilterChange,
  initialFilters,
}: BankTransferCtmTableProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const exhRateDec = decimals[0]?.exhRateDec || 6
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"

  const moduleId = ModuleId.cb
  const transactionId = CBTransactionId.cbbanktransferctm

  const form = useForm({
    defaultValues: {
      startDate:
        initialFilters?.startDate ||
        format(subMonths(new Date(), 1), "yyyy-MM-dd"),
      endDate: initialFilters?.endDate || format(new Date(), "yyyy-MM-dd"),
    },
  })

  const [searchQuery] = useState("")
  const [currentPage] = useState(1)
  const [pageSize] = useState(10)

  const formatNumber = (value: number, decimals: number) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }

  const columns: ColumnDef<ICbBankTransferCtmHd>[] = [
    {
      accessorKey: "transferNo",
      header: "Transfer No",
    },
    {
      accessorKey: "referenceNo",
      header: "Reference No",
    },
    {
      accessorKey: "trnDate",
      header: "Transaction Date",
      cell: ({ row }) => {
        const date = row.original.trnDate
          ? new Date(row.original.trnDate)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "accountDate",
      header: "Account Date",
      cell: ({ row }) => {
        const date = row.original.accountDate
          ? new Date(row.original.accountDate)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "paymentTypeName",
      header: "Payment Type",
    },
    {
      accessorKey: "chequeNo",
      header: "Cheque No",
    },
    {
      accessorKey: "chequeDate",
      header: "Cheque Date",
      cell: ({ row }) => {
        const date = row.original.chequeDate
          ? new Date(row.original.chequeDate)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "fromBankCode",
      header: "From Bank Code",
    },
    {
      accessorKey: "fromBankName",
      header: "From Bank Name",
    },
    {
      accessorKey: "fromCurrencyCode",
      header: "From Currency",
    },
    {
      accessorKey: "fromExhRate",
      header: "From Exh Rate",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("fromExhRate"), exhRateDec)}
        </div>
      ),
    },
    {
      accessorKey: "fromBankChgAmt",
      header: "From Bank Charge",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("fromBankChgAmt"), amtDec)}
        </div>
      ),
    },
    {
      accessorKey: "fromTotAmt",
      header: "From Total Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("fromTotAmt"), amtDec)}
        </div>
      ),
    },
    {
      accessorKey: "fromTotLocalAmt",
      header: "From Total Local",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("fromTotLocalAmt"), locAmtDec)}
        </div>
      ),
    },
    {
      accessorKey: "payeeTo",
      header: "Payee To",
    },
    {
      accessorKey: "exhGainLoss",
      header: "Exh Gain/Loss",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("exhGainLoss"), amtDec)}
        </div>
      ),
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
    },
    {
      accessorKey: "createDate",
      header: "Created Date",
      cell: ({ row }) => {
        const date = row.original.createDate
          ? new Date(row.original.createDate)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "editDate",
      header: "Edited Date",
      cell: ({ row }) => {
        const date = row.original.editDate
          ? new Date(row.original.editDate)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "editVersion",
      header: "Version",
    },
    {
      accessorKey: "isCancel",
      header: "Cancelled",
      cell: ({ row }) => (
        <div className="text-center">{row.original.isCancel ? "✓" : ""}</div>
      ),
    },
    {
      accessorKey: "isPost",
      header: "Posted",
      cell: ({ row }) => (
        <div className="text-center">{row.original.isPost ? "✓" : ""}</div>
      ),
    },
  ]

  const handleSearchInvoice = () => {
    const newFilters: ICbBankTransferCtmFilter = {
      startDate: form.getValues("startDate"),
      endDate: form.getValues("endDate"),
      search: searchQuery,
      sortBy: "invoiceNo",
      sortOrder: "asc",
      pageNumber: currentPage,
      pageSize: pageSize,
    }
    onFilterChange(newFilters)
  }

  const handleDialogFilterChange = (filters: {
    search?: string
    sortOrder?: string
  }) => {
    if (onFilterChange) {
      const newFilters: ICbBankTransferCtmFilter = {
        startDate: form.getValues("startDate"),
        endDate: form.getValues("endDate"),
        search: filters.search || "",
        sortBy: "transferNo",
        sortOrder: (filters.sortOrder as "asc" | "desc") || "asc",
        pageNumber: currentPage,
        pageSize: pageSize,
      }
      onFilterChange(newFilters)
    }
  }

  return (
    <div className="w-full overflow-auto">
      <FormProvider {...form}>
        <div className="mb-4 flex items-center gap-2">
          {/* From Date */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">From Date:</span>
            <CustomDateNew
              form={form}
              name="startDate"
              isRequired={true}
              size="sm"
            />
          </div>

          {/* To Date */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">To Date:</span>
            <CustomDateNew
              form={form}
              name="endDate"
              isRequired={true}
              size="sm"
            />
          </div>

          <Button variant="outline" size="sm" onClick={handleSearchInvoice}>
            Search Bank Transfer
          </Button>
        </div>
      </FormProvider>
      <Separator className="mb-4" />

      <DialogDataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        moduleId={moduleId}
        transactionId={transactionId}
        tableName={TableName.cbBankTransferCtm}
        emptyMessage="No data found."
        onRefresh={onRefresh}
        onFilterChange={handleDialogFilterChange}
        onRowSelect={(row) => onBankTransferCtmSelect(row || undefined)}
      />
    </div>
  )
}
