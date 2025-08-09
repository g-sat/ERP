"use client"

import { ILoanRequest } from "@/interfaces/loans"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

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
    accessorKey: "employeeId",
    header: "Employee",
    cell: ({ row }) => {
      const employeeId = row.original.employeeId
      // In real app, you would fetch employee details
      return (
        <div>
          <div className="font-medium">Employee {employeeId}</div>
          <div className="text-muted-foreground text-sm">
            EMP{String(employeeId).padStart(6, "0")}
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
      return <span className="font-medium">AED {amount.toLocaleString()}</span>
    },
  },
  {
    accessorKey: "loanTypeId",
    header: "Loan Type",
    cell: ({ row }) => {
      const loanTypeId = row.original.loanTypeId
      // In real app, you would fetch loan type details
      const loanTypes = {
        1: "Personal Loans",
        2: "Home Improvement Loan",
        3: "Car Loan",
      }
      return (
        <span>
          {loanTypes[loanTypeId as keyof typeof loanTypes] || "Unknown"}
        </span>
      )
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
              Copy loan ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit loan</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
