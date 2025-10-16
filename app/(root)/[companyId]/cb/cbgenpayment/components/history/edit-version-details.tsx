"use client"

import { useState } from "react"
import { ICbGenPaymentDt, ICbGenPaymentHd } from "@/interfaces"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { AlertCircle } from "lucide-react"

import { CBTransactionId, ModuleId, TableName } from "@/lib/utils"
import {
  useGetCBGenPaymentHistoryDetails,
  useGetCBGenPaymentHistoryList,
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
  const transactionId = CBTransactionId.cbgenpayment

  const [selectedPayment, setSelectedPayment] =
    useState<ICbGenPaymentHd | null>(null)

  const { data: paymentHistoryData, refetch: refetchHistory } =
    useGetCBGenPaymentHistoryList<ICbGenPaymentHd[]>(invoiceId)

  const { data: paymentDetailsData, refetch: refetchDetails } =
    useGetCBGenPaymentHistoryDetails<ICbGenPaymentHd>(
      selectedPayment?.paymentId || "",
      selectedPayment?.editVersion?.toString() || ""
    )

  function isICbGenPaymentHdArray(arr: unknown): arr is ICbGenPaymentHd[] {
    return (
      Array.isArray(arr) &&
      (arr.length === 0 ||
        (typeof arr[0] === "object" && "paymentId" in arr[0]))
    )
  }

  // Check if history data is successful and has valid data
  const tableData: ICbGenPaymentHd[] =
    paymentHistoryData?.result === 1 &&
    isICbGenPaymentHdArray(paymentHistoryData?.data)
      ? paymentHistoryData.data
      : []

  // Check if details data is successful and has valid data
  const dialogData: ICbGenPaymentHd | undefined =
    paymentDetailsData?.result === 1 &&
    paymentDetailsData?.data &&
    typeof paymentDetailsData.data === "object" &&
    paymentDetailsData.data !== null &&
    !Array.isArray(paymentDetailsData.data)
      ? (paymentDetailsData.data as ICbGenPaymentHd)
      : undefined

  // Check for API errors
  const hasHistoryError = paymentHistoryData?.result === -1
  const hasDetailsError = paymentDetailsData?.result === -1

  const columns: ColumnDef<ICbGenPaymentHd>[] = [
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
      accessorKey: "paymentTypeCode",
      header: "Payment Type Code",
    },
    {
      accessorKey: "paymentTypeName",
      header: "Payment Type Name",
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
      accessorKey: "payeeTo",
      header: "Payee To",
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
  ]

  const detailsColumns: ColumnDef<ICbGenPaymentDt>[] = [
    { accessorKey: "itemNo", header: "Item No" },
    { accessorKey: "glCode", header: "GL Code" },
    { accessorKey: "glName", header: "GL Name" },
    { accessorKey: "totAmt", header: "Total Amount" },
    { accessorKey: "totLocalAmt", header: "Total Local Amount" },
    { accessorKey: "gstName", header: "GST" },
    { accessorKey: "gstAmt", header: "GST Amount" },
    { accessorKey: "remarks", header: "Remarks" },
  ]

  const handleRefresh = async () => {
    try {
      // Only refetch if we don't have a "Data does not exist" error
      if (
        !hasHistoryError ||
        paymentHistoryData?.message !== "Data does not exist"
      ) {
        await refetchHistory()
      }
      if (
        !hasDetailsError ||
        paymentDetailsData?.message !== "Data does not exist"
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
                paymentHistoryData?.message === "Data does not exist"
                  ? "default"
                  : "destructive"
              }
              className="mb-4"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {paymentHistoryData?.message === "Data does not exist"
                  ? "No payment history found for this payment."
                  : `Failed to load Gen Payment history: ${paymentHistoryData?.message || "Unknown error"}`}
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
            onRowSelect={(payment) => setSelectedPayment(payment)}
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
                paymentDetailsData?.message === "Data does not exist"
                  ? "default"
                  : "destructive"
              }
              className="mb-4"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {paymentDetailsData?.message === "Data does not exist"
                  ? "No Gen Payment details found for this version."
                  : `Failed to load Gen Payment details: ${paymentDetailsData?.message || "Unknown error"}`}
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
                      ? "Error loading Gen Payment details"
                      : "No Gen Payment details available"}
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
                  tableName={TableName.cbGenPaymentHistory}
                  emptyMessage="No Gen Payment details available"
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
