import { useState } from "react"
import { ICbBankReconFilter, ICbBankReconHd } from "@/interfaces"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format, subMonths } from "date-fns"
import { FormProvider, useForm } from "react-hook-form"

import { CBTransactionId, ModuleId, TableName } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import { DialogDataTable } from "@/components/table/table-dialog"

export interface BankReconTableProps {
  data: ICbBankReconHd[]
  isLoading: boolean
  onBankReconSelect: (selectedBankRecon: ICbBankReconHd | undefined) => void
  onRefresh: () => void
  onFilterChange: (filters: ICbBankReconFilter) => void
  initialFilters?: ICbBankReconFilter
}

export default function BankReconTable({
  data,
  isLoading = false,
  onBankReconSelect,
  onRefresh,
  onFilterChange,
  initialFilters,
}: BankReconTableProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"

  const moduleId = ModuleId.cb
  const transactionId = CBTransactionId.cbbankrecon

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

  const columns: ColumnDef<ICbBankReconHd>[] = [
    {
      accessorKey: "reconNo",
      header: "Reconciliation No",
    },
    {
      accessorKey: "prevReconId",
      header: "Previous Reconciliation ID",
      cell: ({ row }) => (
        <div className="text-right">{row.original.prevReconId || "-"}</div>
      ),
    },
    {
      accessorKey: "prevReconNo",
      header: "Previous Reconciliation No",
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
      accessorKey: "bankId",
      header: "Bank ID",
      cell: ({ row }) => (
        <div className="text-right">{row.original.bankId}</div>
      ),
    },
    {
      accessorKey: "currencyId",
      header: "Currency ID",
      cell: ({ row }) => (
        <div className="text-right">{row.original.currencyId}</div>
      ),
    },
    {
      accessorKey: "fromDate",
      header: "From Date",
      cell: ({ row }) => {
        const date = row.original.fromDate
          ? new Date(row.original.fromDate)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "toDate",
      header: "To Date",
      cell: ({ row }) => {
        const date = row.original.toDate ? new Date(row.original.toDate) : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "totAmt",
      header: "Total Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("totAmt"), amtDec)}
        </div>
      ),
    },
    {
      accessorKey: "opBalAmt",
      header: "Opening Balance",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("opBalAmt"), amtDec)}
        </div>
      ),
    },
    {
      accessorKey: "clBalAmt",
      header: "Closing Balance",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("clBalAmt"), amtDec)}
        </div>
      ),
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
    },
    {
      accessorKey: "createById",
      header: "Created By",
      cell: ({ row }) => (
        <div className="text-right">{row.original.createById}</div>
      ),
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
      accessorKey: "editById",
      header: "Edited By",
      cell: ({ row }) => (
        <div className="text-right">{row.original.editById || "-"}</div>
      ),
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
      cell: ({ row }) => (
        <div className="text-right">{row.original.editVersion}</div>
      ),
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
    {
      accessorKey: "appStatusId",
      header: "Approval Status",
      cell: ({ row }) => (
        <div className="text-right">{row.original.appStatusId || "-"}</div>
      ),
    },
  ]

  const handleSearchInvoice = () => {
    const newFilters: ICbBankReconFilter = {
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
      const newFilters: ICbBankReconFilter = {
        startDate: form.getValues("startDate"),
        endDate: form.getValues("endDate"),
        search: filters.search || "",
        sortBy: "invoiceNo",
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
            Search Invoice
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
        tableName={TableName.cbBankRecon}
        emptyMessage="No data found."
        onRefresh={onRefresh}
        onFilterChange={handleDialogFilterChange}
        onRowSelect={(row) => onBankReconSelect(row || undefined)}
      />
    </div>
  )
}
