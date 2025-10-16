"use client"

import { useState } from "react"
import { IGLContraDt, IGLContraHd } from "@/interfaces"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { AlertCircle } from "lucide-react"

import { GLTransactionId, ModuleId, TableName } from "@/lib/utils"
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
  contraId: string
}

export default function EditVersionDetails({
  contraId,
}: EditVersionDetailsProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  const exhRateDec = decimals[0]?.exhRateDec || 2

  const moduleId = ModuleId.gl
  const transactionId = GLTransactionId.arapcontra

  const [selectedContra, setSelectedContra] = useState<IGLContraHd | null>(null)

  // Note: History hooks would need to be implemented
  // The data would come from API calls when implemented

  // Placeholder for demonstration - these would be from useQuery hooks
  const tableData: IGLContraHd[] = []
  const dialogData: IGLContraHd | undefined = undefined
  const hasHistoryError = false
  const hasDetailsError = false
  const historyMessage: string | undefined = undefined
  const detailsMessage: string | undefined = undefined

  const columns: ColumnDef<IGLContraHd>[] = [
    {
      accessorKey: "editVersion",
      header: "Edit Version",
    },
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
          {row.original.exhRate
            ? row.original.exhRate.toFixed(exhRateDec)
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
      accessorKey: "exhGainLoss",
      header: "Exchange Gain/Loss",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.exhGainLoss
            ? row.original.exhGainLoss.toFixed(amtDec)
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

  const detailsColumns: ColumnDef<IGLContraDt>[] = [
    {
      accessorKey: "itemNo",
      header: "Item No",
      cell: ({ row }) => (
        <div className="text-right">{row.original.itemNo}</div>
      ),
    },
    {
      accessorKey: "documentNo",
      header: "Document No",
    },
    {
      accessorKey: "referenceNo",
      header: "Reference No",
    },
    {
      accessorKey: "docAccountDate",
      header: "Account Date",
      cell: ({ row }) => {
        const date = row.original.docAccountDate
          ? new Date(row.original.docAccountDate)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "docDueDate",
      header: "Due Date",
      cell: ({ row }) => {
        const date = row.original.docDueDate
          ? new Date(row.original.docDueDate)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "docTotAmt",
      header: "Document Total Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.docTotAmt
            ? row.original.docTotAmt.toFixed(amtDec)
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "docTotLocalAmt",
      header: "Document Total Local Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.docTotLocalAmt
            ? row.original.docTotLocalAmt.toFixed(locAmtDec)
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "docBalAmt",
      header: "Document Balance Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.docBalAmt
            ? row.original.docBalAmt.toFixed(amtDec)
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "docBalLocalAmt",
      header: "Document Balance Local Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.docBalLocalAmt
            ? row.original.docBalLocalAmt.toFixed(locAmtDec)
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "allocAmt",
      header: "Allocation Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.allocAmt ? row.original.allocAmt.toFixed(amtDec) : "-"}
        </div>
      ),
    },
    {
      accessorKey: "allocLocalAmt",
      header: "Allocation Local Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.allocLocalAmt
            ? row.original.allocLocalAmt.toFixed(locAmtDec)
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "docAllocAmt",
      header: "Document Allocation Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.docAllocAmt
            ? row.original.docAllocAmt.toFixed(amtDec)
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "docAllocLocalAmt",
      header: "Document Allocation Local Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.docAllocLocalAmt
            ? row.original.docAllocLocalAmt.toFixed(locAmtDec)
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "docExhRate",
      header: "Document Exchange Rate",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.docExhRate
            ? row.original.docExhRate.toFixed(exhRateDec)
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "centDiff",
      header: "Cent Difference",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.centDiff ? row.original.centDiff.toFixed(2) : "-"}
        </div>
      ),
    },
    {
      accessorKey: "exhGainLoss",
      header: "Exchange Gain/Loss",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.exhGainLoss
            ? row.original.exhGainLoss.toFixed(amtDec)
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "editVersion",
      header: "Edit Version",
    },
  ]

  const handleRefresh = async () => {
    // Placeholder for future implementation
    console.log("Refresh triggered for contra:", contraId)
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
                historyMessage === "Data does not exist"
                  ? "default"
                  : "destructive"
              }
              className="mb-4"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {historyMessage === "Data does not exist"
                  ? "No contra history found for this entry."
                  : `Failed to load contra history: ${historyMessage || "Unknown error"}`}
              </AlertDescription>
            </Alert>
          )}

          {!hasHistoryError && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Edit version history functionality is not yet implemented for GL
                Contra entries.
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
            onRowSelect={(contra) => setSelectedContra(contra)}
          />
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedContra}
        onOpenChange={() => setSelectedContra(null)}
      >
        <DialogContent className="@container h-[80vh] w-[90vw] !max-w-none overflow-y-auto rounded-lg p-4">
          <DialogHeader>
            <DialogTitle>Contra Details</DialogTitle>
          </DialogHeader>

          {/* Error handling for details data */}
          {hasDetailsError && (
            <Alert
              variant={
                detailsMessage === "Data does not exist"
                  ? "default"
                  : "destructive"
              }
              className="mb-4"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {detailsMessage === "Data does not exist"
                  ? "No contra details found for this version."
                  : `Failed to load contra details: ${detailsMessage || "Unknown error"}`}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Card>
              <CardHeader>
                <CardTitle>Contra Header</CardTitle>
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
                      ? "Error loading contra details"
                      : "No contra details available"}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Contra Details</CardTitle>
              </CardHeader>
              <CardContent>
                <BasicTable
                  data={
                    (dialogData as IGLContraHd | undefined)?.data_details || []
                  }
                  columns={detailsColumns}
                  moduleId={moduleId}
                  transactionId={transactionId}
                  tableName={TableName.arApContraHistory}
                  emptyMessage="No details available"
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
