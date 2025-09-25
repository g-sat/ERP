"use client"

import { ILoanRequest } from "@/interfaces/loan"
import { ColumnDef } from "@tanstack/react-table"
import { Check, MoreHorizontal, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CurrencyFormatter } from "@/components/currency-icons/currency-formatter"

export const columns: ColumnDef<ILoanRequest>[] = [
  {
    accessorKey: "loanRequestId",
    header: "Request ID",
    cell: ({ row }) => {
      const loanId = row.original.loanRequestId
      return (
        <span className="font-medium">
          REQ-{String(loanId).padStart(5, "0")}
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
    header: "Requested Amount",
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
    accessorKey: "desiredEMIAmount",
    header: "Desired EMI",
    cell: ({ row }) => {
      const emi = row.original.desiredEMIAmount
      return (
        <span>
          <CurrencyFormatter amount={emi} size="sm" />
        </span>
      )
    },
  },
  {
    accessorKey: "calculatedTermMonths",
    header: "Term (Months)",
    cell: ({ row }) => {
      const term = row.original.calculatedTermMonths
      return <span>{term} months</span>
    },
  },
  {
    accessorKey: "statusName",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.statusName
      return (
        <Badge variant={status === "Pending" ? "secondary" : "default"}>
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
    cell: ({ row }) => {
      const loan = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(String(loan.loanRequestId))
              }
            >
              Copy request ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-green-600">
              <Check className="mr-2 h-4 w-4" />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <X className="mr-2 h-4 w-4" />
              Reject
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
