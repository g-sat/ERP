"use client"

import { useState } from "react"
import { IApPaymentDt, IApPaymentHd } from "@/interfaces/ap-payment"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { AlertCircle } from "lucide-react"

import { APTransactionId, ModuleId, TableName } from "@/lib/utils"
import {
  useGetAPInvoiceHistoryDetails,
  useGetAPInvoiceHistoryList,
} from "@/hooks/use-ap"
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
  paymentId: string
}

export default function EditVersionDetails({
  paymentId,
}: EditVersionDetailsProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  const exhRateDec = decimals[0]?.exhRateDec || 2

  const moduleId = ModuleId.ap
  const transactionId = APTransactionId.payment

  const [selectedPayment, setSelectedPayment] = useState<IApPaymentHd | null>(
    null
  )

  const { data: paymentHistoryData, refetch: refetchHistory } =
    useGetAPInvoiceHistoryList<IApPaymentHd[]>(paymentId)

  const { data: paymentDetailsData, refetch: refetchDetails } =
    useGetAPInvoiceHistoryDetails<IApPaymentHd>(
      selectedPayment?.paymentId || "",
      selectedPayment?.editVersion?.toString() || ""
    )

  function isIApPaymentHdArray(arr: unknown): arr is IApPaymentHd[] {
    return (
      Array.isArray(arr) &&
      (arr.length === 0 ||
        (typeof arr[0] === "object" && "paymentId" in arr[0]))
    )
  }

  // Check if history data is successful and has valid data
  const tableData: IApPaymentHd[] =
    paymentHistoryData?.result === 1 &&
    isIApPaymentHdArray(paymentHistoryData?.data)
      ? paymentHistoryData.data
      : []

  // Check if details data is successful and has valid data
  const dialogData: IApPaymentHd | undefined =
    paymentDetailsData?.result === 1 &&
    paymentDetailsData?.data &&
    typeof paymentDetailsData.data === "object" &&
    paymentDetailsData.data !== null &&
    !Array.isArray(paymentDetailsData.data)
      ? (paymentDetailsData.data as IApPaymentHd)
      : undefined

  // Check for API errors
  const hasHistoryError = paymentHistoryData?.result === -1
  const hasDetailsError = paymentDetailsData?.result === -1

  const formatNumber = (value: number, decimals: number) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }

  const columns: ColumnDef<IApPaymentHd>[] = [
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
      accessorKey: "bankChgAmt",
      header: "Bank Charges Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("bankChgAmt"), amtDec)}
        </div>
      ),
    },
    {
      accessorKey: "bankChgLocalAmt",
      header: "Bank Charges Local Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("bankChgLocalAmt"), locAmtDec)}
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
  ]

  const detailsColumns: ColumnDef<IApPaymentDt>[] = [
    { accessorKey: "itemNo", header: "Item No" },
    { accessorKey: "productCode", header: "Product Code" },
    { accessorKey: "productName", header: "Product Name" },
    { accessorKey: "qty", header: "Quantity" },
    { accessorKey: "unitPrice", header: "Unit Price" },
    { accessorKey: "totAmt", header: "Total Amount" },
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
                  : `Failed to load payment history: ${paymentHistoryData?.message || "Unknown error"}`}
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
                  ? "No payment details found for this version."
                  : `Failed to load payment details: ${paymentDetailsData?.message || "Unknown error"}`}
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
                      ? "Error loading payment details"
                      : "No payment details available"}
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
                  tableName={TableName.apPaymentHistory}
                  emptyMessage="No payment details available"
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
