"use client"

import * as React from "react"
import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"

import { TableName } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BasicTable } from "@/components/table/table-basic"

interface LedgerTransaction {
  id: string
  date: string
  documentNo: string
  job: string
  vessel: string
  cur: string
  transDebit: number
  transCredit: number
  transBalance: number
  baseDebit: number
  baseCredit: number
  baseBalance: number
}

interface LedgerTableProps {
  data: LedgerTransaction[]
  isLoading?: boolean
  onView?: (transaction: LedgerTransaction) => void
}

export default function LedgerTable({
  data = [],
  isLoading = false,
  onView: _onView,
}: LedgerTableProps) {
  const [_selectedRows] = useState<string[]>([])

  const columns: ColumnDef<LedgerTransaction>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("date") as string
        const isEmpty = !date || date === ""
        const isReportTotal = date === "Report Total"
        return (
          <div
            className={`text-sm ${isEmpty || isReportTotal ? "font-bold" : ""}`}
          >
            {isEmpty ? "Sub Total (FC020)" : date}
          </div>
        )
      },
    },
    {
      accessorKey: "documentNo",
      header: "Document No",
      cell: ({ row }) => {
        const docNo = row.getValue("documentNo") as string
        const isEmpty = !docNo || docNo === ""
        return (
          <div className={`font-medium ${isEmpty ? "font-bold" : ""}`}>
            {isEmpty ? "" : docNo}
          </div>
        )
      },
    },
    {
      accessorKey: "job",
      header: "Job",
      cell: ({ row }) => {
        const job = row.getValue("job") as string
        const isEmpty = !job || job === ""
        return (
          <div className={`text-sm ${isEmpty ? "font-bold" : ""}`}>
            {isEmpty ? "" : job}
          </div>
        )
      },
    },
    {
      accessorKey: "vessel",
      header: "Vessel",
      cell: ({ row }) => {
        const vessel = row.getValue("vessel") as string
        const isEmpty = !vessel || vessel === ""
        return (
          <div className={`text-sm ${isEmpty ? "font-bold" : ""}`}>
            {isEmpty ? "" : vessel}
          </div>
        )
      },
    },
    {
      accessorKey: "cur",
      header: "Cur",
      cell: ({ row }) => {
        const cur = row.getValue("cur") as string
        const isEmpty = !cur || cur === ""
        return (
          <div className={`text-sm ${isEmpty ? "font-bold" : ""}`}>
            {isEmpty ? "" : cur}
          </div>
        )
      },
    },
    {
      accessorKey: "transDebit",
      header: "Debit",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("transDebit"))
        return (
          <div className="text-right">
            {amount > 0 ? (
              <span className="text-red-600">
                {amount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            ) : (
              <span className="text-gray-400">0.00</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "transCredit",
      header: "Credit",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("transCredit"))
        return (
          <div className="text-right">
            {amount > 0 ? (
              <span className="text-green-600">
                {amount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            ) : (
              <span className="text-gray-400">0.00</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "transBalance",
      header: "Balance",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("transBalance"))
        return (
          <div className="text-right font-bold">
            <span className={amount >= 0 ? "text-green-600" : "text-red-600"}>
              {amount < 0
                ? `(${Math.abs(amount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })})`
                : amount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "baseDebit",
      header: "Debit",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("baseDebit"))
        return (
          <div className="text-right">
            {amount > 0 ? (
              <span className="text-red-600">
                {amount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            ) : (
              <span className="text-gray-400">0.00</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "baseCredit",
      header: "Credit",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("baseCredit"))
        return (
          <div className="text-right">
            {amount > 0 ? (
              <span className="text-green-600">
                {amount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            ) : (
              <span className="text-gray-400">0.00</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "baseBalance",
      header: "Balance",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("baseBalance"))
        return (
          <div className="text-right font-bold">
            <span className={amount >= 0 ? "text-green-600" : "text-red-600"}>
              {amount < 0
                ? `(${Math.abs(amount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })})`
                : amount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
            </span>
          </div>
        )
      },
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Ledger</CardTitle>
      </CardHeader>
      <CardContent>
        <BasicTable<LedgerTransaction>
          data={data}
          columns={columns}
          isLoading={isLoading}
          tableName={TableName.arInvoice}
        />
      </CardContent>
    </Card>
  )
}
