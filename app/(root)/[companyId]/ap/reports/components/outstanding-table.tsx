"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"

import { TableName } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BasicTable } from "@/components/table/table-basic"

interface OutstandingTransaction {
  id: string
  date: string
  documentNo: string
  job: string
  vessel: string
  debit: number
  credit: number
  balance: number
}

interface OutstandingTableProps {
  data: OutstandingTransaction[]
  isLoading?: boolean
}

export default function OutstandingTable({
  data = [],
  isLoading = false,
}: OutstandingTableProps) {
  const [_selectedRows] = useState<string[]>([])

  // Dummy data matching the format from the image
  const dummyData: OutstandingTransaction[] = [
    {
      id: "1",
      date: "16/04/2025",
      documentNo: "RCT25-04-047",
      job: "2504/FJR/21316/AM",
      vessel: "GROTON",
      debit: 0.0,
      credit: 5000.0,
      balance: -5000.0,
    },
    {
      id: "2",
      date: "30/04/2025",
      documentNo: "RCT25-04-093",
      job: "2504/JAP/21388/AM",
      vessel: "ADDISON",
      debit: 0.0,
      credit: 1850.0,
      balance: -6850.0,
    },
    {
      id: "3",
      date: "13/05/2025",
      documentNo: "RCT25-05-028",
      job: "2504/JAP/21397/AM",
      vessel: "ADDISON",
      debit: 0.0,
      credit: 900.0,
      balance: -7750.0,
    },
    {
      id: "4",
      date: "20/05/2025",
      documentNo: "RCT25-05-062",
      job: "2505/JAP/21473/AM",
      vessel: "ADDISON",
      debit: 0.0,
      credit: 950.0,
      balance: -8700.0,
    },
    {
      id: "5",
      date: "20/05/2025",
      documentNo: "RCT25-05-085",
      job: "2505/JAP/21487/AM",
      vessel: "ADDISON",
      debit: 0.0,
      credit: 900.0,
      balance: -9600.0,
    },
    {
      id: "6",
      date: "12/06/2025",
      documentNo: "RCT25-06-035",
      job: "2506/AUH/21655/AM",
      vessel: "GROTON",
      debit: 0.0,
      credit: 2400.0,
      balance: -12000.0,
    },
    {
      id: "7",
      date: "16/06/2025",
      documentNo: "RCT25-06-049",
      job: "2505/JAP/21555/AM",
      vessel: "ADDISON",
      debit: 0.0,
      credit: 800.0,
      balance: -12800.0,
    },
    {
      id: "8",
      date: "16/06/2025",
      documentNo: "RCT25-06-050",
      job: "2506/JAP/21635/AM",
      vessel: "ADDISON",
      debit: 0.0,
      credit: 1300.0,
      balance: -14100.0,
    },
    {
      id: "9",
      date: "25/06/2025",
      documentNo: "RCT25-06-078",
      job: "2506/JAP/21692/AM",
      vessel: "ADDISON",
      debit: 0.0,
      credit: 1300.0,
      balance: -15400.0,
    },
    {
      id: "10",
      date: "01/07/2025",
      documentNo: "AM-2505-0094",
      job: "2504/JAP/21388/AM",
      vessel: "ADDISON",
      debit: 1307.47,
      credit: 0.0,
      balance: -14092.53,
    },
    {
      id: "11",
      date: "01/07/2025",
      documentNo: "AM-2505-0095",
      job: "2504/JAP/21397/AM",
      vessel: "ADDISON",
      debit: 1813.83,
      credit: 0.0,
      balance: -12278.7,
    },
    {
      id: "12",
      date: "01/07/2025",
      documentNo: "AM-2505-0096",
      job: "2505/JAP/21473/AM",
      vessel: "ADDISON",
      debit: 2453.27,
      credit: 0.0,
      balance: -9825.43,
    },
    {
      id: "13",
      date: "01/07/2025",
      documentNo: "AM-2505-0097",
      job: "2505/JAP/21487/AM",
      vessel: "ADDISON",
      debit: 2124.64,
      credit: 0.0,
      balance: -7700.79,
    },
    {
      id: "14",
      date: "01/07/2025",
      documentNo: "AM-2505-0098",
      job: "2505/JAP/21433/AM",
      vessel: "GROTON",
      debit: 1106.49,
      credit: 0.0,
      balance: -6594.3,
    },
    {
      id: "15",
      date: "01/07/2025",
      documentNo: "AM-2506-0073",
      job: "2505/JAP/21567/AM",
      vessel: "ADDISON",
      debit: 987.1,
      credit: 0.0,
      balance: -5607.2,
    },
    {
      id: "16",
      date: "01/07/2025",
      documentNo: "AM-2506-0074",
      job: "2505/JAP/21555/AM",
      vessel: "ADDISON",
      debit: 3959.1,
      credit: 0.0,
      balance: -1648.1,
    },
    {
      id: "17",
      date: "01/07/2025",
      documentNo: "AM-2506-0075",
      job: "2506/JAP/21635/AM",
      vessel: "ADDISON",
      debit: 3971.37,
      credit: 0.0,
      balance: 2323.27,
    },
    {
      id: "18",
      date: "01/07/2025",
      documentNo: "AM-2506-0076",
      job: "2506/JAP/21692/AM",
      vessel: "ADDISON",
      debit: 1571.26,
      credit: 0.0,
      balance: 3894.53,
    },
    {
      id: "19",
      date: "01/07/2025",
      documentNo: "AM-2506-0077",
      job: "2505/JAP/21492/AM",
      vessel: "GROTON",
      debit: 2338.34,
      credit: 0.0,
      balance: 6232.87,
    },
    {
      id: "20",
      date: "01/07/2025",
      documentNo: "AM-2506-0078",
      job: "2506/AUH/21655/AM",
      vessel: "GROTON",
      debit: 4257.05,
      credit: 0.0,
      balance: 10489.92,
    },
    {
      id: "21",
      date: "09/07/2025",
      documentNo: "RCT25-07-027",
      job: "2507/KHD/21808/AM",
      vessel: "ADDISON",
      debit: 0.0,
      credit: 4200.0,
      balance: 6289.92,
    },
    {
      id: "22",
      date: "14/07/2025",
      documentNo: "RCT25-07-038",
      job: "2507/JAP/21834/AM",
      vessel: "ADDISON",
      debit: 0.0,
      credit: 1100.0,
      balance: 5189.92,
    },
    {
      id: "23",
      date: "24/07/2025",
      documentNo: "RCT25-07-063",
      job: "2507/JAP/21842/AM",
      vessel: "ADDISON",
      debit: 0.0,
      credit: 1600.0,
      balance: 3589.92,
    },
    {
      id: "24",
      date: "17/10/2025",
      documentNo: "RCT25-10-056",
      job: "2510/AUH/22490/AM",
      vessel: "GROTON",
      debit: 0.0,
      credit: 3700.0,
      balance: -110.08,
    },
    {
      id: "25",
      date: "Conbulk Shipping S.A",
      documentNo: "",
      job: "Sub Total : USD",
      vessel: "",
      debit: 25889.92,
      credit: 26000.0,
      balance: -110.08,
    },
    {
      id: "26",
      date: "",
      documentNo: "Report Total",
      job: "",
      vessel: "",
      debit: 25889.92,
      credit: 26000.0,
      balance: -110.08,
    },
  ]

  // Use dummy data if no data provided
  const tableData = data.length > 0 ? data : dummyData

  const columns: ColumnDef<OutstandingTransaction>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("date") as string
        const isSubTotal = date === "Conbulk Shipping S.A"
        const isReportTotal = date === ""
        return (
          <div
            className={`text-sm ${isSubTotal || isReportTotal ? "font-bold" : ""}`}
          >
            {date}
          </div>
        )
      },
    },
    {
      accessorKey: "documentNo",
      header: "Document No",
      cell: ({ row }) => {
        const docNo = row.getValue("documentNo") as string
        const isReportTotal = docNo === "Report Total"
        return (
          <div className={`text-sm ${isReportTotal ? "font-bold" : ""}`}>
            {docNo}
          </div>
        )
      },
    },
    {
      accessorKey: "job",
      header: "Job",
      cell: ({ row }) => {
        const job = row.getValue("job") as string
        const isSubTotal = job === "Sub Total : USD"
        return (
          <div className={`text-sm ${isSubTotal ? "font-bold" : ""}`}>
            {job}
          </div>
        )
      },
    },
    {
      accessorKey: "vessel",
      header: "Vessel",
      cell: ({ row }) => {
        const vessel = row.getValue("vessel") as string
        return <div className="text-sm">{vessel}</div>
      },
    },
    {
      accessorKey: "debit",
      header: "Debit",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("debit"))
        const isSubTotal = row.original.date === "Conbulk Shipping S.A"
        const isReportTotal = row.original.documentNo === "Report Total"
        return (
          <div
            className={`text-right ${isSubTotal || isReportTotal ? "font-bold underline" : ""}`}
          >
            {amount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        )
      },
    },
    {
      accessorKey: "credit",
      header: "Credit",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("credit"))
        const isSubTotal = row.original.date === "Conbulk Shipping S.A"
        const isReportTotal = row.original.documentNo === "Report Total"
        return (
          <div
            className={`text-right ${isSubTotal || isReportTotal ? "font-bold underline" : ""}`}
          >
            {amount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        )
      },
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("balance"))
        const isSubTotal = row.original.date === "Conbulk Shipping S.A"
        const isReportTotal = row.original.documentNo === "Report Total"
        return (
          <div
            className={`text-right font-medium ${isSubTotal || isReportTotal ? "font-bold underline" : ""}`}
          >
            {amount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        )
      },
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Outstanding Payables</CardTitle>
      </CardHeader>
      <CardContent>
        <BasicTable<OutstandingTransaction>
          data={tableData}
          columns={columns}
          isLoading={isLoading}
          tableName={TableName.apInvoice}
        />
      </CardContent>
    </Card>
  )
}
