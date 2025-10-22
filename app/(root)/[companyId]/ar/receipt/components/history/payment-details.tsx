import { IPaymentDetails } from "@/interfaces"
import { ApiResponse } from "@/interfaces/auth"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { ARTransactionId, ModuleId, TableName } from "@/lib/utils"
import { useGetPaymentDetails } from "@/hooks/use-histoy"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BasicTable } from "@/components/table/table-basic"

interface ReceiptDetailsProps {
  receiptId: string
}

export default function ReceiptDetails({ receiptId }: ReceiptDetailsProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  const moduleId = ModuleId.ar
  const transactionId = ARTransactionId.receipt

  const { data: receiptDetails, refetch: refetchReceipt } =
    //useGetReceiptDetails<IPaymentDetails>(25, 1, "14120250100024")
    useGetPaymentDetails<IPaymentDetails>(
      Number(moduleId),
      Number(transactionId),
      receiptId
    )

  const { data: receiptDetailsData } =
    (receiptDetails as ApiResponse<IPaymentDetails>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  const columns: ColumnDef<IPaymentDetails>[] = [
    {
      accessorKey: "DocumentNO",
      header: "Document No",
    },
    {
      accessorKey: "ReferenceNo",
      header: "Reference No",
    },
    {
      accessorKey: "AccountDate",
      header: "Account Date",
      cell: ({ row }) => {
        const date = row.original.AccountDate
          ? new Date(row.original.AccountDate.toString())
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "TotAmt",
      header: "Total Amount",
      cell: ({ row }) =>
        row.original.TotAmt ? row.original.TotAmt.toFixed(amtDec) : "-",
    },
    {
      accessorKey: "TotLocalAmt",
      header: "Local Amount",
      cell: ({ row }) =>
        row.original.TotLocalAmt
          ? row.original.TotLocalAmt.toFixed(locAmtDec)
          : "-",
    },
    {
      accessorKey: "AllAmt",
      header: "Allocated Amount",
      cell: ({ row }) =>
        row.original.AllAmt ? row.original.AllAmt.toFixed(amtDec) : "-",
    },
    {
      accessorKey: "AllLocalAmt",
      header: "Allocated Local Amount",
      cell: ({ row }) =>
        row.original.AllLocalAmt
          ? row.original.AllLocalAmt.toFixed(locAmtDec)
          : "-",
    },
    {
      accessorKey: "ExGainLoss",
      header: "Exchange Gain/Loss",
      cell: ({ row }) =>
        row.original.ExGainLoss
          ? Number(row.original.ExGainLoss).toFixed(amtDec)
          : "-",
    },
  ]

  const handleRefresh = async () => {
    try {
      await refetchReceipt()
    } catch (error) {
      console.error("Error refreshing data:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receipt Details</CardTitle>
      </CardHeader>
      <CardContent>
        <BasicTable
          data={receiptDetailsData || []}
          columns={columns}
          isLoading={false}
          moduleId={moduleId}
          transactionId={transactionId}
          tableName={TableName.arReceiptDt}
          onRefresh={handleRefresh}
          showHeader={true}
          showFooter={false}
          emptyMessage="No results."
          maxHeight="300px"
        />
      </CardContent>
    </Card>
  )
}
