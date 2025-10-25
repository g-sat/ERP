import { useState } from "react"
import { IGLContraFilter, IGLContraHd } from "@/interfaces"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format, subMonths } from "date-fns"
import { FormProvider, useForm } from "react-hook-form"

import { GlArapContra } from "@/lib/api-routes"
import { GLTransactionId, ModuleId, TableName } from "@/lib/utils"
import { useGetWithDates } from "@/hooks/use-common"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import { DialogDataTable } from "@/components/table/table-dialog"

export interface ArapcontraTableProps {
  onArapcontraSelect: (selectedArapcontra: IGLContraHd | undefined) => void
  onFilterChange: (filters: IGLContraFilter) => void
  initialFilters?: IGLContraFilter
}

export default function ArapcontraTable({
  onArapcontraSelect,
  onFilterChange,
  initialFilters,
}: ArapcontraTableProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const exhRateDec = decimals[0]?.exhRateDec || 9
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"

  const moduleId = ModuleId.gl
  const transactionId = GLTransactionId.arapcontra

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

  // Data fetching - only when table is opened
  const {
    data: arapContrasResponse,
    isLoading: isLoadingArapContras,
    isRefetching: isRefetchingArapContras,
    refetch: refetchArapContras,
  } = useGetWithDates<IGLContraHd>(
    `${GlArapContra.get}`,
    TableName.glArapContra,
    searchQuery,
    form.watch("startDate")?.toString(),
    form.watch("endDate")?.toString(),
    undefined, // options
    true // enabled: Fetch when table is opened
  )

  const data = arapContrasResponse?.data || []
  const isLoading = isLoadingArapContras || isRefetchingArapContras

  const formatNumber = (value: number, decimals: number) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }

  const columns: ColumnDef<IGLContraHd>[] = [
    {
      accessorKey: "contraNo",
      header: "Contra No",
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
      accessorKey: "supplierName",
      header: "Supplier",
    },
    {
      accessorKey: "customerName",
      header: "Customer",
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
      accessorKey: "exhGainLoss",
      header: "Exchange Gain/Loss",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("exhGainLoss"), locAmtDec)}
        </div>
      ),
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
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
      accessorKey: "postById",
      header: "Posted By ID",
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
      accessorKey: "cancelById",
      header: "Cancelled By ID",
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
    {
      accessorKey: "appStatusId",
      header: "Approval Status ID",
    },
    {
      accessorKey: "appById",
      header: "Approved By ID",
    },
    {
      accessorKey: "appDate",
      header: "Approval Date",
      cell: ({ row }) => {
        const date = row.original.appDate
          ? new Date(row.original.appDate)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
  ]

  const handleSearchContra = () => {
    const newFilters: IGLContraFilter = {
      startDate: form.getValues("startDate"),
      endDate: form.getValues("endDate"),
      search: searchQuery,
      sortBy: "contraNo",
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
      const newFilters: IGLContraFilter = {
        startDate: form.getValues("startDate"),
        endDate: form.getValues("endDate"),
        search: filters.search || "",
        sortBy: "contraNo",
        sortOrder: (filters.sortOrder as "asc" | "desc") || "asc",
        pageNumber: currentPage,
        pageSize: pageSize,
      }
      onFilterChange(newFilters)
    }
  }

  // Show loading spinner while data is loading
  if (isLoadingArapContras) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-4 text-sm text-gray-600">Loading AR/AP contra entries...</p>
          <p className="mt-2 text-xs text-gray-500">
            Please wait while we fetch the AR/AP contra list
          </p>
        </div>
      </div>
    )
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

          <Button variant="outline" size="sm" onClick={handleSearchContra}>
            Search Contra
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
        tableName={TableName.arApContra}
        emptyMessage="No contra data found."
        onRefresh={() => refetchArapContras()}
        onFilterChange={handleDialogFilterChange}
        onRowSelect={(row) => onArapcontraSelect(row || undefined)}
      />
    </div>
  )
}
