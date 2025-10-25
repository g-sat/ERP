import { useState } from "react"
import { IGLJournalFilter, IGLJournalHd } from "@/interfaces/gl-journalentry"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format, subMonths } from "date-fns"
import { FormProvider, useForm } from "react-hook-form"
import { useGetWithDates } from "@/hooks/use-common"

import { GlJournalEntry } from "@/lib/api-routes"
import { GLTransactionId, ModuleId, TableName } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import { DialogDataTable } from "@/components/table/table-dialog"

export interface JournalTableProps {
  onJournalSelect: (selectedJournal: IGLJournalHd | undefined) => void
  onFilterChange: (filters: IGLJournalFilter) => void
  initialFilters?: IGLJournalFilter
}

export default function JournalTable({
  onJournalSelect,
  onFilterChange,
  initialFilters,
}: JournalTableProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const exhRateDec = decimals[0]?.exhRateDec || 9
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"

  const moduleId = ModuleId.gl
  const transactionId = GLTransactionId.journalentry

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
    data: journalsResponse,
    isLoading: isLoadingJournals,
    isRefetching: isRefetchingJournals,
    refetch: refetchJournals,
  } = useGetWithDates<IGLJournalHd>(
    `${GlJournalEntry.get}`,
    TableName.glJournalEntry,
    searchQuery,
    form.watch("startDate")?.toString(),
    form.watch("endDate")?.toString(),
    undefined, // options
    true // enabled: Fetch when table is opened
  )

  const data = journalsResponse?.data || []
  const isLoading = isLoadingJournals || isRefetchingJournals

  const formatNumber = (value: number, decimals: number) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }

  const columns: ColumnDef<IGLJournalHd>[] = [
    {
      accessorKey: "journalNo",
      header: "Journal No",
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
      header: "Currency",
      cell: ({ row }) => {
        return row.original.currencyCode || "-"
      },
    },
    {
      accessorKey: "exhRate",
      header: "Exchange Rate",
      cell: ({ row }) => {
        return formatNumber(row.original.exhRate || 0, exhRateDec)
      },
    },
    {
      accessorKey: "totAmt",
      header: "Total Amount",
      cell: ({ row }) => {
        return formatNumber(row.original.totAmt || 0, amtDec)
      },
    },
    {
      accessorKey: "totLocalAmt",
      header: "Total Local Amount",
      cell: ({ row }) => {
        return formatNumber(row.original.totLocalAmt || 0, locAmtDec)
      },
    },
    {
      accessorKey: "gstAmt",
      header: "GST Amount",
      cell: ({ row }) => {
        return formatNumber(row.original.gstAmt || 0, amtDec)
      },
    },
    {
      accessorKey: "totAmtAftGst",
      header: "Total After GST",
      cell: ({ row }) => {
        return formatNumber(row.original.totAmtAftGst || 0, amtDec)
      },
    },
    {
      accessorKey: "isReverse",
      header: "Reverse",
      cell: ({ row }) => {
        return row.original.isReverse ? "Yes" : "No"
      },
    },
    {
      accessorKey: "revDate",
      header: "Reversal Date",
      cell: ({ row }) => {
        const date = row.original.revDate
          ? new Date(row.original.revDate)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "isRecurrency",
      header: "Recurring",
      cell: ({ row }) => {
        return row.original.isRecurrency ? "Yes" : "No"
      },
    },
    {
      accessorKey: "recurrenceUntil",
      header: "Recurrence Until",
      cell: ({ row }) => {
        const date = row.original.recurrenceUntil
          ? new Date(row.original.recurrenceUntil)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
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
      accessorKey: "isPost",
      header: "Posted",
      cell: ({ row }) => {
        return row.original.isPost ? "Yes" : "No"
      },
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
  ]

  const handleStartDateChange = () => {
    const newFilters = {
      startDate: form.getValues("startDate"),
      endDate: form.getValues("endDate"),
      search: searchQuery,
      sortOrder: "asc",
      sortBy: "journalNo",
      pageNumber: currentPage,
      pageSize: pageSize,
    }
    onFilterChange(newFilters)
  }

  const handleEndDateChange = () => {
    const newFilters = {
      startDate: form.getValues("startDate"),
      endDate: form.getValues("endDate"),
      search: searchQuery,
      sortOrder: "asc",
      sortBy: "journalNo",
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
      const newFilters: IGLJournalFilter = {
        startDate: form.getValues("startDate"),
        endDate: form.getValues("endDate"),
        search: filters.search || "",
        sortBy: "journalNo",
        sortOrder: (filters.sortOrder as "asc" | "desc") || "asc",
        pageNumber: currentPage,
        pageSize: pageSize,
      }
      onFilterChange(newFilters)
    }
  }

  // Show loading spinner while data is loading
  if (isLoadingJournals) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-4 text-sm text-gray-600">Loading journal entries...</p>
          <p className="mt-2 text-xs text-gray-500">
            Please wait while we fetch the journal entry list
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <FormProvider {...form}>
        <div className="flex items-center gap-2">
          <CustomDateNew
            form={form}
            name="startDate"
            label="Start Date"
            onChangeEvent={handleStartDateChange}
          />
          <CustomDateNew
            form={form}
            name="endDate"
            label="End Date"
            onChangeEvent={handleEndDateChange}
          />
          <Button onClick={onRefresh} variant="outline">
            Refresh
          </Button>
        </div>
      </FormProvider>

      <Separator />

      <DialogDataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        moduleId={moduleId}
        transactionId={transactionId}
        tableName={TableName.journalEntry}
        emptyMessage="No data found."
        onRefresh={() => refetchJournals()}
        onFilterChange={handleDialogFilterChange}
        onRowSelect={(row: IGLJournalHd | null) =>
          onJournalSelect(row || undefined)
        }
      />
    </div>
  )
}
