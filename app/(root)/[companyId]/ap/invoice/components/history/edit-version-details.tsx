"use client"

import { useState } from "react"
import { IApInvoiceDt, IApInvoiceHd } from "@/interfaces/ap-invoice"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { AlertCircle } from "lucide-react"

import { TableName } from "@/lib/utils"
import {
  useGetARInvoiceHistoryDetails,
  useGetARInvoiceHistoryList,
} from "@/hooks/use-ar"
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

  const [selectedInvoice, setSelectedInvoice] = useState<IApInvoiceHd | null>(
    null
  )

  const { data: invoiceHistoryData, refetch: refetchHistory } =
    //useGetARInvoiceHistoryList<IApInvoiceHd[]>("14120250100024")
    useGetARInvoiceHistoryList<IApInvoiceHd[]>(invoiceId)

  const { data: invoiceDetailsData, refetch: refetchDetails } =
    useGetARInvoiceHistoryDetails<IApInvoiceHd>(
      selectedInvoice?.invoiceId || "",
      selectedInvoice?.editVersion?.toString() || ""
    )

  // Debug logging
  console.log("invoiceHistoryData:", invoiceHistoryData)
  console.log("invoiceDetailsData:", invoiceDetailsData)
  console.log("selectedInvoice:", selectedInvoice)

  function isIApInvoiceHdArray(arr: unknown): arr is IApInvoiceHd[] {
    return (
      Array.isArray(arr) &&
      (arr.length === 0 ||
        (typeof arr[0] === "object" && "invoiceId" in arr[0]))
    )
  }

  // Check if history data is successful and has valid data
  const tableData: IApInvoiceHd[] =
    invoiceHistoryData?.result === 1 &&
    isIApInvoiceHdArray(invoiceHistoryData?.data)
      ? invoiceHistoryData.data
      : []

  // Check if details data is successful and has valid data
  const dialogData: IApInvoiceHd | undefined =
    invoiceDetailsData?.result === 1 &&
    invoiceDetailsData?.data &&
    typeof invoiceDetailsData.data === "object" &&
    invoiceDetailsData.data !== null &&
    !Array.isArray(invoiceDetailsData.data)
      ? (invoiceDetailsData.data as IApInvoiceHd)
      : undefined

  // Check for API errors
  const hasHistoryError = invoiceHistoryData?.result === -1
  const hasDetailsError = invoiceDetailsData?.result === -1

  // Debug logging for processed data
  console.log("tableData:", tableData)
  console.log("dialogData:", dialogData)
  console.log("hasHistoryError:", hasHistoryError)
  console.log("hasDetailsError:", hasDetailsError)
  console.log("invoiceHistoryData?.result:", invoiceHistoryData?.result)
  console.log("invoiceDetailsData?.result:", invoiceDetailsData?.result)

  const columns: ColumnDef<IApInvoiceHd>[] = [
    {
      accessorKey: "editVersion",
      header: "Edit Version",
    },
    {
      accessorKey: "invoiceNo",
      header: "Invoice No",
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
      accessorKey: "deliveryDate",
      header: "Delivery Date",
      cell: ({ row }) => {
        const date = row.original.deliveryDate
          ? new Date(row.original.deliveryDate)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => {
        const date = row.original.dueDate
          ? new Date(row.original.dueDate)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "customerCode",
      header: "Customer Code",
    },
    {
      accessorKey: "customerName",
      header: "Customer Name",
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
      accessorKey: "creditTermCode",
      header: "Credit Term Code",
    },
    {
      accessorKey: "creditTermName",
      header: "Credit Term Name",
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

  const detailsColumns: ColumnDef<IApInvoiceDt>[] = [
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
        invoiceHistoryData?.message !== "Data does not exist"
      ) {
        console.log("Refetching history data")
        await refetchHistory()
      }
      if (
        !hasDetailsError ||
        invoiceDetailsData?.message !== "Data does not exist"
      ) {
        console.log("Refetching details data")
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
                invoiceHistoryData?.message === "Data does not exist"
                  ? "default"
                  : "destructive"
              }
              className="mb-4"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {invoiceHistoryData?.message === "Data does not exist"
                  ? "No invoice history found for this invoice."
                  : `Failed to load invoice history: ${invoiceHistoryData?.message || "Unknown error"}`}
              </AlertDescription>
            </Alert>
          )}
          <DialogDataTable
            data={tableData}
            columns={columns}
            isLoading={false}
            moduleId={25}
            transactionId={1}
            tableName={TableName.notDefine}
            emptyMessage={
              hasHistoryError ? "Error loading data" : "No results."
            }
            onRefresh={handleRefresh}
            onRowSelect={(invoice) => setSelectedInvoice(invoice)}
          />
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedInvoice}
        onOpenChange={() => setSelectedInvoice(null)}
      >
        <DialogContent className="@container h-[80vh] w-[90vw] !max-w-none overflow-y-auto rounded-lg p-4">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>

          {/* Error handling for details data */}
          {hasDetailsError && (
            <Alert
              variant={
                invoiceDetailsData?.message === "Data does not exist"
                  ? "default"
                  : "destructive"
              }
              className="mb-4"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {invoiceDetailsData?.message === "Data does not exist"
                  ? "No invoice details found for this version."
                  : `Failed to load invoice details: ${invoiceDetailsData?.message || "Unknown error"}`}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Header</CardTitle>
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
                      ? "Error loading invoice details"
                      : "No invoice details available"}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent>
                <BasicTable
                  data={dialogData?.data_details || []}
                  columns={detailsColumns}
                  moduleId={25}
                  transactionId={1}
                  tableName={TableName.apInvoice}
                  emptyMessage="No invoice details available"
                  onRefresh={handleRefresh}
                  showHeader={true}
                  showFooter={false}
                />
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
