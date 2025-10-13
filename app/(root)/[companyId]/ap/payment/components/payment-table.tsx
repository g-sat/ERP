import { useState } from "react"
import { IApPaymentFilter, IApPaymentHd } from "@/interfaces/ap-payment"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format, subMonths } from "date-fns"
import { FormProvider, useForm } from "react-hook-form"

import { APTransactionId, ModuleId, TableName } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import { DialogDataTable } from "@/components/table/table-dialog"

export interface PaymentTableProps {
  data: IApPaymentHd[]
  isLoading: boolean
  onPaymentSelect: (selectedPayment: IApPaymentHd | undefined) => void
  onRefresh: () => void
  onFilterChange: (filters: IApPaymentFilter) => void
  initialFilters?: IApPaymentFilter
}

export default function PaymentTable({
  data,
  isLoading = false,
  onPaymentSelect,
  onRefresh,
  onFilterChange,
  initialFilters,
}: PaymentTableProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const exhRateDec = decimals[0]?.exhRateDec || 9
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  //const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  const moduleId = ModuleId.ap
  const transactionId = APTransactionId.payment

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

  const columns: ColumnDef<IApPaymentHd>[] = [
    {
      accessorKey: "paymentNo",
      header: "Payment No",
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
      accessorKey: "supplierCode",
      header: "Supplier Code",
    },
    {
      accessorKey: "supplierName",
      header: "Supplier Name",
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
      accessorKey: "bankCode",
      header: "Bank Code",
    },
    {
      accessorKey: "bankName",
      header: "Bank Name",
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
      accessorKey: "payTotAmt",
      header: "Pay Total Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("payTotAmt"), amtDec)}
        </div>
      ),
    },
    {
      accessorKey: "payTotLocalAmt",
      header: "Pay Total Local Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("payTotLocalAmt"), locAmtDec)}
        </div>
      ),
    },
    {
      accessorKey: "unAllocTotAmt",
      header: "Unallocated Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("unAllocTotAmt"), amtDec)}
        </div>
      ),
    },
    {
      accessorKey: "unAllocTotLocalAmt",
      header: "Unallocated Local Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("unAllocTotLocalAmt"), locAmtDec)}
        </div>
      ),
    },
    {
      accessorKey: "exhGainLoss",
      header: "Exchange Gain/Loss",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("exhGainLoss"), locAmtDec)}
        </div>
      ),
    },
    {
      accessorKey: "bankChargesAmt",
      header: "Bank Charges Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("bankChargesAmt"), amtDec)}
        </div>
      ),
    },
    {
      accessorKey: "bankChargesLocalAmt",
      header: "Bank Charges Local Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("bankChargesLocalAmt"), locAmtDec)}
        </div>
      ),
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "createByCode",
      header: "Created By Code",
    },
    {
      accessorKey: "createByName",
      header: "Created By Name",
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
      accessorKey: "editByCode",
      header: "Edited By Code",
    },
    {
      accessorKey: "editByName",
      header: "Edited By Name",
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
  ]

  const handleSearchPayment = () => {
    const newFilters: IApPaymentFilter = {
      startDate: form.getValues("startDate"),
      endDate: form.getValues("endDate"),
      search: searchQuery,
      sortBy: "paymentNo",
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
      const newFilters: IApPaymentFilter = {
        startDate: form.getValues("startDate"),
        endDate: form.getValues("endDate"),
        search: filters.search || "",
        sortBy: "paymentNo",
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

          <Button variant="outline" size="sm" onClick={handleSearchPayment}>
            Search Payment
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
        tableName={TableName.apPayment}
        emptyMessage="No data found."
        onRefresh={onRefresh}
        onFilterChange={handleDialogFilterChange}
        onRowSelect={(row) => onPaymentSelect(row || undefined)}
      />
    </div>
  )
}
