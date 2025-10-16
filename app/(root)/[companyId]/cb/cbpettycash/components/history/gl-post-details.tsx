import { ApiResponse } from "@/interfaces/auth"
import { IGlTransactionDetails } from "@/interfaces/history"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { CBTransactionId, ModuleId, TableName } from "@/lib/utils"
import { useGetGlPostDetails } from "@/hooks/use-histoy"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BasicTable } from "@/components/table/table-basic"

// Extended column definition with hide property
type ExtendedColumnDef<T> = ColumnDef<T> & {
  hidden?: boolean
}

interface GLPostDetailsProps {
  invoiceId: string
}

export default function GLPostDetails({ invoiceId }: GLPostDetailsProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const exhRateDec = decimals[0]?.exhRateDec || 6
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  const moduleId = ModuleId.cb
  const transactionId = CBTransactionId.cbpettycash

  const { data: glPostDetails, refetch: refetchGlPost } =
    //useGetGlPostDetails<IGlTransactionDetails>(25, 1, "14120250100024")
    useGetGlPostDetails<IGlTransactionDetails>(
      Number(moduleId),
      Number(transactionId),
      invoiceId
    )

  const { data: glPostDetailsData } =
    (glPostDetails as ApiResponse<IGlTransactionDetails>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // const {
  //   result: glPostDetailsResult,
  //   message: glPostDetailsMessage,
  //   data: glPostDetailsData,
  // } = glPostDetails ?? {}

  const columns: ExtendedColumnDef<IGlTransactionDetails>[] = [
    {
      accessorKey: "DocumentNo",
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
          ? new Date(row.original.AccountDate)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "CurrencyCode",
      header: "Currency Code",
    },
    {
      accessorKey: "CurrencyName",
      header: "Currency Name",
      hidden: true,
    },
    {
      accessorKey: "ExhRate",
      header: "Exchange Rate",
      cell: ({ row }) =>
        row.original.ExhRate ? row.original.ExhRate.toFixed(exhRateDec) : "-",
    },

    {
      accessorKey: "CtyExhRate",
      header: "Country Exchange Rate",
      cell: ({ row }) =>
        row.original.CtyExhRate
          ? row.original.CtyExhRate.toFixed(exhRateDec)
          : "-",
      hidden: true,
    },
    {
      accessorKey: "BankCode",
      header: "Bank Code",
      hidden: true,
    },
    {
      accessorKey: "BankName",
      header: "Bank Name",
    },
    {
      accessorKey: "GLCode",
      header: "GL Code",
    },
    {
      accessorKey: "GLName",
      header: "GL Name",
    },
    {
      accessorKey: "IsDebit",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant={row.original.IsDebit ? "default" : "destructive"}>
          {row.original.IsDebit ? "Debit" : "Credit"}
        </Badge>
      ),
    },
    {
      accessorKey: "TotAmt",
      header: "Total Amount",
      cell: ({ row }) =>
        row.original.TotAmt ? row.original.TotAmt.toFixed(amtDec) : "-",
    },
    {
      accessorKey: "TotLocalAmt",
      header: "Total Local Amount",
      cell: ({ row }) =>
        row.original.TotLocalAmt
          ? row.original.TotLocalAmt.toFixed(locAmtDec)
          : "-",
    },
    {
      accessorKey: "TotCtyAmt",
      header: "Total Country Amount",
      cell: ({ row }) =>
        row.original.TotCtyAmt
          ? row.original.TotCtyAmt.toFixed(locAmtDec)
          : "-",
      hidden: true,
    },
    {
      accessorKey: "gstCode",
      header: "GST Code",
    },
    {
      accessorKey: "gstName",
      header: "GST Name",
    },
    {
      accessorKey: "gstAmt",
      header: "GST Amount",
      cell: ({ row }) =>
        row.original.gstAmt ? row.original.gstAmt.toFixed(amtDec) : "-",
    },
    {
      accessorKey: "gstLocalAmt",
      header: "GST Local Amount",
      cell: ({ row }) =>
        row.original.gstLocalAmt
          ? row.original.gstLocalAmt.toFixed(locAmtDec)
          : "-",
    },
    {
      accessorKey: "gstCtyAmt",
      header: "GST Country Amount",
      cell: ({ row }) =>
        row.original.gstCtyAmt
          ? row.original.gstCtyAmt.toFixed(locAmtDec)
          : "-",
      hidden: true,
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
    },
    {
      accessorKey: "departmentCode",
      header: "Department Code",
      hidden: true,
    },
    {
      accessorKey: "departmentName",
      header: "Department Name",
    },
    {
      accessorKey: "employeeCode",
      header: "Employee Code",
      hidden: true,
    },
    {
      accessorKey: "employeeName",
      header: "Employee Name",
    },
    {
      accessorKey: "portCode",
      header: "Port Code",
      hidden: true,
    },
    {
      accessorKey: "portName",
      header: "Port Name",
    },
    {
      accessorKey: "vesselCode",
      header: "Vessel Code",
      hidden: true,
    },
    {
      accessorKey: "vesselName",
      header: "Vessel Name",
    },
    {
      accessorKey: "voyageNo",
      header: "Voyage No",
    },
    {
      accessorKey: "bargeCode",
      header: "Barge Code",
      hidden: true,
    },
    {
      accessorKey: "bargeName",
      header: "Barge Name",
    },
    {
      accessorKey: "productCode",
      header: "Product Code",
      hidden: true,
    },
    {
      accessorKey: "productName",
      header: "Product Name",
    },
    {
      accessorKey: "supplierCode",
      header: "Supplier Code",
      hidden: true,
    },
    {
      accessorKey: "supplierName",
      header: "Supplier Name",
    },
    {
      accessorKey: "moduleFrom",
      header: "Module",
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
  ]

  const handleRefresh = async () => {
    try {
      await refetchGlPost()
    } catch (error) {
      console.error("Error refreshing data:", error)
    }
  }

  // Filter out columns with hidden: true
  const visibleColumns = columns.filter((column) => !column.hidden)

  return (
    <Card>
      <CardHeader>
        <CardTitle>GL Post Details</CardTitle>
      </CardHeader>
      <CardContent>
        <BasicTable
          data={glPostDetailsData || []}
          columns={visibleColumns}
          isLoading={false}
          moduleId={moduleId}
          transactionId={transactionId}
          tableName={TableName.glPostDetails}
          emptyMessage="No results."
          onRefresh={handleRefresh}
          showHeader={true}
          showFooter={false}
          maxHeight="300px"
        />
      </CardContent>
    </Card>
  )
}
