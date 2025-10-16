"use client"

import { useState } from "react"
import { ICbPettyCashDt, ICbPettyCashHd } from "@/interfaces"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { AlertCircle } from "lucide-react"

import { CBTransactionId, ModuleId, TableName } from "@/lib/utils"
import {
  useGetCBPettyCashHistoryDetails,
  useGetCBPettyCashHistoryList,
} from "@/hooks/use-cb"
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

  const moduleId = ModuleId.cb
  const transactionId = CBTransactionId.cbpettycash

  const [selectedPayment, setSelectedPayment] = useState<ICbPettyCashHd | null>(
    null
  )

  const { data: receiptHistoryData, refetch: refetchHistory } =
    useGetCBPettyCashHistoryList<ICbPettyCashHd[]>(invoiceId)

  const { data: receiptDetailsData, refetch: refetchDetails } =
    useGetCBPettyCashHistoryDetails<ICbPettyCashHd>(
      selectedPayment?.paymentId || "",
      selectedPayment?.editVersion?.toString() || ""
    )

  function isICbPettyCashHdArray(arr: unknown): arr is ICbPettyCashHd[] {
    return (
      Array.isArray(arr) &&
      (arr.length === 0 ||
        (typeof arr[0] === "object" && "paymentId" in arr[0]))
    )
  }

  // Check if history data is successful and has valid data
  const tableData: ICbPettyCashHd[] =
    receiptHistoryData?.result === 1 &&
    isICbPettyCashHdArray(receiptHistoryData?.data)
      ? receiptHistoryData.data
      : []

  // Check if details data is successful and has valid data
  const dialogData: ICbPettyCashHd | undefined =
    receiptDetailsData?.result === 1 &&
    receiptDetailsData?.data &&
    typeof receiptDetailsData.data === "object" &&
    receiptDetailsData.data !== null &&
    !Array.isArray(receiptDetailsData.data)
      ? (receiptDetailsData.data as ICbPettyCashHd)
      : undefined

  // Check for API errors
  const hasHistoryError = receiptHistoryData?.result === -1
  const hasDetailsError = receiptDetailsData?.result === -1

  const columns: ColumnDef<ICbPettyCashHd>[] = [
    {
      accessorKey: "editVersion",
      header: "Edit Version",
    },
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
      accessorKey: "bankChgAmt",
      header: "Bank Charge Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.bankChgAmt
            ? row.original.bankChgAmt.toFixed(amtDec)
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "bankChgLocalAmt",
      header: "Bank Charge Local Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.bankChgLocalAmt
            ? row.original.bankChgLocalAmt.toFixed(locAmtDec)
            : "-"}
        </div>
      ),
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
      accessorKey: "totCtyAmt",
      header: "Total Country Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.totCtyAmt
            ? row.original.totCtyAmt.toFixed(amtDec)
            : "-"}
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
      accessorKey: "gstCtyAmt",
      header: "GST Country Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.gstCtyAmt
            ? row.original.gstCtyAmt.toFixed(amtDec)
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
      accessorKey: "totCtyAmtAftGst",
      header: "Total Country After GST",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.totCtyAmtAftGst
            ? row.original.totCtyAmtAftGst.toFixed(amtDec)
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "payeeTo",
      header: "Payee To",
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
      accessorKey: "isPost",
      header: "Posted",
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
      header: "Cancelled",
      cell: ({ row }) => (row.original.isCancel ? "Yes" : "No"),
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
      accessorKey: "cancelBy",
      header: "Cancelled By",
    },
  ]

  const detailsColumns: ColumnDef<ICbPettyCashDt>[] = [
    { accessorKey: "itemNo", header: "Item No" },
    { accessorKey: "seqNo", header: "Seq No" },
    { accessorKey: "glCode", header: "GL Code" },
    { accessorKey: "glName", header: "GL Name" },
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
      accessorKey: "totCtyAmt",
      header: "Total Country Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.totCtyAmt
            ? row.original.totCtyAmt.toFixed(amtDec)
            : "-"}
        </div>
      ),
    },
    { accessorKey: "gstName", header: "GST" },
    {
      accessorKey: "gstPercentage",
      header: "GST %",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.gstPercentage
            ? row.original.gstPercentage.toFixed(2)
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
      accessorKey: "gstCtyAmt",
      header: "GST Country Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.gstCtyAmt
            ? row.original.gstCtyAmt.toFixed(amtDec)
            : "-"}
        </div>
      ),
    },
    { accessorKey: "departmentCode", header: "Department Code" },
    { accessorKey: "departmentName", header: "Department Name" },
    { accessorKey: "employeeCode", header: "Employee Code" },
    { accessorKey: "employeeName", header: "Employee Name" },
    { accessorKey: "portCode", header: "Port Code" },
    { accessorKey: "portName", header: "Port Name" },
    { accessorKey: "vesselCode", header: "Vessel Code" },
    { accessorKey: "vesselName", header: "Vessel Name" },
    { accessorKey: "bargeCode", header: "Barge Code" },
    { accessorKey: "bargeName", header: "Barge Name" },
    { accessorKey: "voyageNo", header: "Voyage No" },
    { accessorKey: "remarks", header: "Remarks" },
  ]

  const handleRefresh = async () => {
    try {
      // Only refetch if we don't have a "Data does not exist" error
      if (
        !hasHistoryError ||
        receiptHistoryData?.message !== "Data does not exist"
      ) {
        await refetchHistory()
      }
      if (
        !hasDetailsError ||
        receiptDetailsData?.message !== "Data does not exist"
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
                receiptHistoryData?.message === "Data does not exist"
                  ? "default"
                  : "destructive"
              }
              className="mb-4"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {receiptHistoryData?.message === "Data does not exist"
                  ? "No receipt history found for this receipt."
                  : `Failed to load receipt history: ${receiptHistoryData?.message || "Unknown error"}`}
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
            onRowSelect={(receipt) => setSelectedPayment(receipt)}
          />
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedPayment}
        onOpenChange={() => setSelectedPayment(null)}
      >
        <DialogContent className="@container h-[80vh] w-[90vw] !max-w-none overflow-y-auto rounded-lg p-4">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>

          {/* Error handling for details data */}
          {hasDetailsError && (
            <Alert
              variant={
                receiptDetailsData?.message === "Data does not exist"
                  ? "default"
                  : "destructive"
              }
              className="mb-4"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {receiptDetailsData?.message === "Data does not exist"
                  ? "No receipt details found for this version."
                  : `Failed to load receipt details: ${receiptDetailsData?.message || "Unknown error"}`}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Header</CardTitle>
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
                      ? "Error loading receipt details"
                      : "No receipt details available"}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <BasicTable
                  data={dialogData?.data_details || []}
                  columns={detailsColumns}
                  moduleId={moduleId}
                  transactionId={transactionId}
                  tableName={TableName.cbPettyCashHistory}
                  emptyMessage="No receipt details available"
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
