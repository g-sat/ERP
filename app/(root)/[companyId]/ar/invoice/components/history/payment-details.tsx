import { KeyboardEvent, useCallback, useMemo } from "react"
import { useParams } from "next/navigation"
import { ApiResponse } from "@/interfaces/auth"
import { IPaymentHistoryDetails } from "@/interfaces/history"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { clientDateFormat } from "@/lib/date-utils"
import { formatNumber } from "@/lib/format-utils"
import {
  APTransactionId,
  ARTransactionId,
  ModuleId,
  TableName,
} from "@/lib/utils"
import { useGetPaymentDetails } from "@/hooks/use-histoy"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BasicTable } from "@/components/table/table-basic"

interface PaymentDetailsProps {
  invoiceId: string
}

export default function PaymentDetails({ invoiceId }: PaymentDetailsProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const dateFormat = decimals[0]?.dateFormat || clientDateFormat
  const params = useParams()
  const companyId = params.companyId as string
  const moduleId = ModuleId.ar
  const transactionId = ARTransactionId.invoice

  const { data: paymentDetails, refetch: refetchPayment } =
    useGetPaymentDetails<IPaymentHistoryDetails>(
      Number(moduleId),
      Number(transactionId),
      invoiceId
    )

  const { data: paymentDetailsData } =
    (paymentDetails as ApiResponse<IPaymentHistoryDetails>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  const getTargetPath = useCallback(
    (moduleIdValue: number, transactionIdValue: number): string | null => {
      if (!companyId) return null

      if (moduleIdValue === ModuleId.ar) {
        switch (transactionIdValue) {
          case ARTransactionId.receipt:
            return `/${companyId}/ar/receipt`
          case ARTransactionId.adjustment:
            return `/${companyId}/ar/adjustment`
          case ARTransactionId.refund:
            return `/${companyId}/ar/refund`
          case ARTransactionId.docsetoff:
            return `/${companyId}/ar/docsetoff`
          default:
            return null
        }
      }

      if (moduleIdValue === ModuleId.ap) {
        switch (transactionIdValue) {
          case APTransactionId.payment:
            return `/${companyId}/ap/payment`
          case APTransactionId.adjustment:
            return `/${companyId}/ap/adjustment`
          case APTransactionId.refund:
            return `/${companyId}/ap/refund`
          case APTransactionId.docsetoff:
            return `/${companyId}/ap/docsetoff`
          default:
            return null
        }
      }

      return null
    },
    [companyId]
  )

  const getStorageKey = useCallback((targetPath: string | null) => {
    return targetPath ? `history-doc:${targetPath}` : null
  }, [])

  const handleDocumentNavigation = useCallback(
    (detail: IPaymentHistoryDetails) => {
      const moduleIdValue = Number(detail.moduleId)
      const transactionIdValue = Number(detail.transactionId)
      const documentNo = detail.documentNo?.toString().trim()

      if (
        !documentNo ||
        !Number.isFinite(moduleIdValue) ||
        !Number.isFinite(transactionIdValue)
      ) {
        return
      }

      const targetPath = getTargetPath(moduleIdValue, transactionIdValue)
      if (!targetPath) return

      if (typeof window !== "undefined") {
        const storageKey = getStorageKey(targetPath)
        if (storageKey) {
          window.localStorage.setItem(storageKey, documentNo)
        }
        window.open(targetPath, "_blank", "noopener,noreferrer")
      }
    },
    [getStorageKey, getTargetPath]
  )

  const columns: ColumnDef<IPaymentHistoryDetails>[] = useMemo(
    () => [
      {
        accessorKey: "documentNo",
        header: "Document No",
        cell: ({ row }) => {
          const docNo = row.original.documentNo
          const isClickable = !!docNo
          const handleActivate = () => {
            if (isClickable) {
              handleDocumentNavigation(row.original)
            }
          }

          const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
            if (!isClickable) return

            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              handleActivate()
            }
          }

          return isClickable ? (
            <button
              type="button"
              onDoubleClick={handleActivate}
              onKeyDown={handleKeyDown}
              className="text-primary underline decoration-dotted underline-offset-2 hover:decoration-solid"
            >
              {docNo}
            </button>
          ) : (
            "-"
          )
        },
      },
      {
        accessorKey: "referenceNo",
        header: "Reference No",
      },
      {
        accessorKey: "accountDate",
        header: "Account Date",
        cell: ({ row }) => {
          const date = row.original.accountDate
            ? new Date(row.original.accountDate.toString())
            : null
          return date ? format(date, dateFormat) : "-"
        },
      },
      {
        accessorKey: "totAmt",
        header: "Total Amount",
        cell: ({ row }) => (
          <div className="text-right">
            {row.original.totAmt
              ? formatNumber(row.original.totAmt, amtDec)
              : "-"}
          </div>
        ),
      },
      {
        accessorKey: "totLocalAmt",
        header: "Local Amount",
        cell: ({ row }) => (
          <div className="text-right">
            {row.original.totLocalAmt
              ? formatNumber(row.original.totLocalAmt, locAmtDec)
              : "-"}
          </div>
        ),
      },
      {
        accessorKey: "allAmt",
        header: "Allocated Amount",
        cell: ({ row }) => (
          <div className="text-right">
            {row.original.allAmt
              ? formatNumber(row.original.allAmt, amtDec)
              : "-"}
          </div>
        ),
      },
      {
        accessorKey: "allLocalAmt",
        header: "Allocated Local Amount",
        cell: ({ row }) => (
          <div className="text-right">
            {row.original.allLocalAmt
              ? formatNumber(row.original.allLocalAmt, locAmtDec)
              : "-"}
          </div>
        ),
      },
      {
        accessorKey: "exGainLoss",
        header: "Exchange Gain/Loss",
        cell: ({ row }) => (
          <div className="text-right">
            {row.original.exGainLoss
              ? formatNumber(Number(row.original.exGainLoss), amtDec)
              : "-"}
          </div>
        ),
      },
    ],
    [amtDec, dateFormat, handleDocumentNavigation, locAmtDec]
  )

  const handleRefresh = async () => {
    try {
      await refetchPayment()
    } catch (error) {
      console.error("Error refreshing data:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <BasicTable
          data={paymentDetailsData || []}
          columns={columns}
          isLoading={false}
          moduleId={moduleId}
          transactionId={transactionId}
          tableName={TableName.paymentDetails}
          onRefresh={handleRefresh}
          showHeader={true}
          showFooter={false}
          emptyMessage="No results."
          maxHeight="200px"
          pageSizeOption={5}
        />
      </CardContent>
    </Card>
  )
}
