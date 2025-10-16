"use client"

import { useState } from "react"
import { IGLJournalDt, IGLJournalHd } from "@/interfaces"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { AlertCircle } from "lucide-react"

import { GLTransactionId, ModuleId, TableName } from "@/lib/utils"
import {
  useGetGLJournalEntryHistoryDetails,
  useGetGLJournalEntryHistoryList,
} from "@/hooks/use-gl"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BasicTable } from "@/components/table/table-basic"
import { DialogDataTable } from "@/components/table/table-dialog"

interface EditVersionDetailsProps {
  invoiceId: string
}

export default function EditVersionDetails({
  invoiceId,
}: EditVersionDetailsProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  const exhRateDec = decimals[0]?.exhRateDec || 2

  const moduleId = ModuleId.gl
  const transactionId = GLTransactionId.journalentry

  const [selectedJournalEntry, setSelectedJournalEntry] =
    useState<IGLJournalHd | null>(null)

  const { data: journalEntryHistoryData, refetch: refetchHistory } =
    useGetGLJournalEntryHistoryList<IGLJournalHd[]>(invoiceId)

  const { data: journalDetailsData, refetch: refetchDetails } =
    useGetGLJournalEntryHistoryDetails<IGLJournalHd>(
      selectedJournalEntry?.journalId || "",
      selectedJournalEntry?.editVersion?.toString() || ""
    )

  function isIGLJournalHdArray(arr: unknown): arr is IGLJournalHd[] {
    return (
      Array.isArray(arr) &&
      (arr.length === 0 ||
        (typeof arr[0] === "object" && "journalId" in arr[0]))
    )
  }

  // Check if history data is successful and has valid data
  const tableData: IGLJournalHd[] =
    journalEntryHistoryData?.result === 1 &&
    isIGLJournalHdArray(journalEntryHistoryData?.data)
      ? journalEntryHistoryData.data
      : []

  // Check if details data is successful and has valid data
  const dialogData: IGLJournalHd | undefined =
    journalDetailsData?.result === 1 &&
    journalDetailsData?.data &&
    typeof journalDetailsData.data === "object" &&
    journalDetailsData.data !== null &&
    !Array.isArray(journalDetailsData.data)
      ? (journalDetailsData.data as IGLJournalHd)
      : undefined

  // Check for API errors
  const hasHistoryError = journalEntryHistoryData?.result === -1
  const hasDetailsError = journalDetailsData?.result === -1

  const columns: ColumnDef<IGLJournalHd>[] = [
    {
      accessorKey: "editVersion",
      header: "Edit Version",
    },
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
          {row.original.exhRate
            ? row.original.exhRate.toFixed(exhRateDec)
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "ctyExhRate",
      header: "Country Exchange Rate",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.ctyExhRate
            ? row.original.ctyExhRate.toFixed(exhRateDec)
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "isReverse",
      header: "Reverse Entry",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.isReverse ? "Yes" : "No"}
        </div>
      ),
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
      header: "Recurring Entry",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.isRecurrency ? "Yes" : "No"}
        </div>
      ),
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
      accessorKey: "totAmt",
      header: "Total Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.totAmt ? row.original.totAmt.toFixed(amtDec) : "-"}
        </div>
      ),
    },
    {
      accessorKey: "totLocalAmt",
      header: "Total Local Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.totLocalAmt
            ? row.original.totLocalAmt.toFixed(locAmtDec)
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "gstAmt",
      header: "GST Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.gstAmt ? row.original.gstAmt.toFixed(amtDec) : "-"}
        </div>
      ),
    },
    {
      accessorKey: "gstLocalAmt",
      header: "GST Local Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.gstLocalAmt
            ? row.original.gstLocalAmt.toFixed(locAmtDec)
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "totAmtAftGst",
      header: "Total After GST",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.totAmtAftGst
            ? row.original.totAmtAftGst.toFixed(amtDec)
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "totLocalAmtAftGst",
      header: "Total Local After GST",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.totLocalAmtAftGst
            ? row.original.totLocalAmtAftGst.toFixed(locAmtDec)
            : "-"}
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
      accessorKey: "isPost",
      header: "Posted",
      cell: ({ row }) => (
        <div className="text-center">{row.original.isPost ? "Yes" : "No"}</div>
      ),
    },
    {
      accessorKey: "postBy",
      header: "Posted By",
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

  const detailsColumns: ColumnDef<IGLJournalDt>[] = [
    { accessorKey: "itemNo", header: "Item No" },
    { accessorKey: "glCode", header: "GL Code" },
    { accessorKey: "glName", header: "GL Name" },
    {
      accessorKey: "isDebit",
      header: "Type",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.isDebit ? "Debit" : "Credit"}
        </div>
      ),
    },
    { accessorKey: "productName", header: "Product" },
    { accessorKey: "totAmt", header: "Total Amount" },
    { accessorKey: "totLocalAmt", header: "Total Local Amount" },
    { accessorKey: "gstName", header: "GST" },
    { accessorKey: "gstAmt", header: "GST Amount" },
    { accessorKey: "departmentName", header: "Department" },
    { accessorKey: "employeeName", header: "Employee" },
    { accessorKey: "jobOrderNo", header: "Job Order" },
    { accessorKey: "remarks", header: "Remarks" },
  ]

  const handleRefresh = async () => {
    try {
      // Only refetch if we don't have a "Data does not exist" error
      if (
        !hasHistoryError ||
        journalEntryHistoryData?.message !== "Data does not exist"
      ) {
        await refetchHistory()
      }
      if (
        !hasDetailsError ||
        journalDetailsData?.message !== "Data does not exist"
      ) {
        await refetchDetails()
      }
    } catch (error) {
      console.error("Error refreshing data:", error)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Edit Version Details</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Error handling for history data */}
          {hasHistoryError && (
            <Alert
              variant={
                journalEntryHistoryData?.message === "Data does not exist"
                  ? "default"
                  : "destructive"
              }
              className="mb-4"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {journalEntryHistoryData?.message === "Data does not exist"
                  ? "No Journal Entry history found for this Journal Entry."
                  : `Failed to load Journal Entry history: ${journalEntryHistoryData?.message || "Unknown error"}`}
              </AlertDescription>
            </Alert>
          )}
          <DialogDataTable
            data={tableData}
            columns={columns}
            isLoading={false}
            moduleId={moduleId}
            transactionId={transactionId}
            tableName={TableName.notDefine}
            emptyMessage={
              hasHistoryError ? "Error loading data" : "No results."
            }
            onRefresh={handleRefresh}
            onRowSelect={(journalEntry) =>
              setSelectedJournalEntry(journalEntry)
            }
          />
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedJournalEntry}
        onOpenChange={() => setSelectedJournalEntry(null)}
      >
        <DialogContent className="@container h-[80vh] w-[90vw] !max-w-none overflow-y-auto rounded-lg p-4">
          <DialogHeader>
            <DialogTitle>Journal Entry Details</DialogTitle>
          </DialogHeader>

          {/* Error handling for details data */}
          {hasDetailsError && (
            <Alert
              variant={
                journalDetailsData?.message === "Data does not exist"
                  ? "default"
                  : "destructive"
              }
              className="mb-4"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {journalDetailsData?.message === "Data does not exist"
                  ? "No Journal Entry details found for this version."
                  : `Failed to load Journal Entry details: ${journalDetailsData?.message || "Unknown error"}`}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Card>
              <CardHeader>
                <CardTitle>Journal Entry Header</CardTitle>
              </CardHeader>
              <CardContent>
                {dialogData ? (
                  <div className="grid grid-cols-6 gap-2">
                    {Object.entries(dialogData).map(([key, value]) =>
                      key !== "data_details" ? (
                        <div key={key} className="flex flex-col gap-1">
                          <span className="text-muted-foreground text-sm">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ) : null
                    )}
                  </div>
                ) : (
                  <div className="text-muted-foreground py-4 text-center">
                    {hasDetailsError
                      ? "Error loading Journal Entry details"
                      : "No Journal Entry details available"}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Journal Entry Details</CardTitle>
              </CardHeader>
              <CardContent>
                <BasicTable
                  data={dialogData?.data_details || []}
                  columns={detailsColumns}
                  moduleId={moduleId}
                  transactionId={transactionId}
                  tableName={TableName.journalEntryHistory}
                  emptyMessage="No Journal Entry details available"
                  onRefresh={handleRefresh}
                  showHeader={true}
                  showFooter={false}
                  maxHeight="300px"
                />
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
