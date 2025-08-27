"use client"

import { ILoanRequest } from "@/interfaces/loan"
import { ColumnDef } from "@tanstack/react-table"
import { EyeIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CurrencyFormatter } from "@/components/currencyicons/currency-formatter"

export const columns: ColumnDef<ILoanRequest>[] = [
  {
    accessorKey: "loanRequestId",
    header: "Loan ID",
    cell: ({ row }) => {
      const loanId = row.original.loanRequestId
      return (
        <span className="font-medium">
          LOAN-{String(loanId).padStart(5, "0")}
        </span>
      )
    },
  },
  {
    accessorKey: "employeeName",
    header: "Employee",
    cell: ({ row }) => {
      const employeeName = row.original.employeeName
      const employeeCode = row.original.employeeCode
      return (
        <div>
          <div className="font-medium">
            {employeeName || "Unknown Employee"}
          </div>
          <div className="text-muted-foreground text-sm">
            {employeeCode ||
              `EMP${String(row.original.employeeId).padStart(6, "0")}`}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "requestedAmount",
    header: "Loan Amount",
    cell: ({ row }) => {
      const amount = row.original.requestedAmount
      return (
        <span className="font-medium">
          <CurrencyFormatter amount={amount} size="sm" />
        </span>
      )
    },
  },
  {
    accessorKey: "loanTypeName",
    header: "Loan Type",
    cell: ({ row }) => {
      const loanTypeName = row.original.loanTypeName
      return <span>{loanTypeName || "Unknown"}</span>
    },
  },
  {
    accessorKey: "currentStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.statusName
      return (
        <Badge variant={status === "Approved" ? "default" : "secondary"}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "requestDate",
    header: "Request Date",
    cell: ({ row }) => {
      const date = row.original.requestDate
      return <span>{new Date(date).toLocaleDateString()}</span>
    },
  },
  {
    id: "actions",
    cell: () => {
      return (
        <div className="flex justify-end">
          <Button variant="ghost" className="h-8 w-8 p-0">
            <EyeIcon className="h-4 w-4" />
            <span className="sr-only">View details</span>
          </Button>
        </div>
      )
    },
  },
]
