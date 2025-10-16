import { useState } from "react"
import {
  ICbGenReceiptFilter,
  ICbGenReceiptHd,
} from "@/interfaces/cb-genreceipt"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format, subMonths } from "date-fns"
import { FormProvider, useForm } from "react-hook-form"

import { CBTransactionId, ModuleId, TableName } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import { DialogDataTable } from "@/components/table/table-dialog"

export interface ReceiptTableProps {
  data: ICbGenReceiptHd[]
  isLoading: boolean
  onReceiptSelect: (selectedReceipt: ICbGenReceiptHd | undefined) => void
  onRefresh: () => void
  onFilterChange: (filters: ICbGenReceiptFilter) => void
  initialFilters?: ICbGenReceiptFilter
}

export default function ReceiptTable({
  data,
  isLoading = false,
  onReceiptSelect,
  onRefresh,
  onFilterChange,
  initialFilters,
}: ReceiptTableProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const exhRateDec = decimals[0]?.exhRateDec || 9
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  //const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  const moduleId = ModuleId.cb
  const transactionId = CBTransactionId.cbgenreceipt

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

  const columns: ColumnDef<ICbGenReceiptHd>[] = [
    {
      accessorKey: "receiptNo",
      header: "Receipt No",
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
      accessorKey: "currencyCode",
      header: "Currency Code",
    },
    {
      accessorKey: "currencyName",
      header: "Currency Name",
    },
    {
      accessorKey: "exhRate",
      header: "Exchange Rate",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("exhRate"), exhRateDec)}
        </div>
      ),
    },
    {
      accessorKey: "ctyExhRate",
      header: "Country Exchange Rate",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("ctyExhRate"), exhRateDec)}
        </div>
      ),
    },
    {
      accessorKey: "paymentTypeCode",
      header: "Payment Type Code",
    },
    {
      accessorKey: "paymentTypeName",
      header: "Payment Type Name",
    },
    {
      accessorKey: "bankCode",
      header: "Bank Code",
    },
    {
      accessorKey: "bankName",
      header: "Bank Name",
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
      accessorKey: "bankChgAmt",
      header: "Bank Charge Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("bankChgAmt"), amtDec)}
        </div>
      ),
    },
    {
      accessorKey: "bankChgLocalAmt",
      header: "Bank Charge Local Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("bankChgLocalAmt"), locAmtDec)}
        </div>
      ),
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
      accessorKey: "totLocalAmt",
      header: "Total Local Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("totLocalAmt"), locAmtDec)}
        </div>
      ),
    },
    {
      accessorKey: "totCtyAmt",
      header: "Total Country Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("totCtyAmt"), amtDec)}
        </div>
      ),
    },
    {
      accessorKey: "gstClaimDate",
      header: "GST Claim Date",
      cell: ({ row }) => {
        const date = row.original.gstClaimDate
          ? new Date(row.original.gstClaimDate)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "gstAmt",
      header: "GST Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("gstAmt"), amtDec)}
        </div>
      ),
    },
    {
      accessorKey: "gstLocalAmt",
      header: "GST Local Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("gstLocalAmt"), locAmtDec)}
        </div>
      ),
    },
    {
      accessorKey: "gstCtyAmt",
      header: "GST Country Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("gstCtyAmt"), amtDec)}
        </div>
      ),
    },
    {
      accessorKey: "totAmtAftGst",
      header: "Total After GST",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("totAmtAftGst"), amtDec)}
        </div>
      ),
    },
    {
      accessorKey: "totLocalAmtAftGst",
      header: "Total Local After GST",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("totLocalAmtAftGst"), locAmtDec)}
        </div>
      ),
    },
    {
      accessorKey: "totCtyAmtAftGst",
      header: "Total Country After GST",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("totCtyAmtAftGst"), amtDec)}
        </div>
      ),
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
    },
    {
      accessorKey: "payeeTo",
      header: "Payee To",
    },
    {
      accessorKey: "moduleFrom",
      header: "Module From",
    },
    {
      accessorKey: "createById",
      header: "Created By ID",
    },
    {
      accessorKey: "createBy",
      header: "Created By",
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
      header: "Edited By ID",
    },
    {
      accessorKey: "editBy",
      header: "Edited By",
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
      header: "Edit Version",
    },
    {
      accessorKey: "isPost",
      header: "Is Posted",
      cell: ({ row }) => (row.original.isPost ? "Yes" : "No"),
    },
    {
      accessorKey: "postDate",
      header: "Post Date",
      cell: ({ row }) => {
        const date = row.original.postDate
          ? new Date(row.original.postDate)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "isCancel",
      header: "Is Cancelled",
      cell: ({ row }) => (row.original.isCancel ? "Yes" : "No"),
    },
    {
      accessorKey: "cancelBy",
      header: "Cancelled By",
    },
    {
      accessorKey: "cancelDate",
      header: "Cancel Date",
      cell: ({ row }) => {
        const date = row.original.cancelDate
          ? new Date(row.original.cancelDate)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "cancelRemarks",
      header: "Cancel Remarks",
    },
  ]

  const handleSearchInvoice = () => {
    const newFilters: ICbGenReceiptFilter = {
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
      const newFilters: ICbGenReceiptFilter = {
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
        tableName={TableName.cbGenReceipt}
        emptyMessage="No data found."
        onRefresh={onRefresh}
        onFilterChange={handleDialogFilterChange}
        onRowSelect={(row) => onReceiptSelect(row || undefined)}
      />
    </div>
  )
}
