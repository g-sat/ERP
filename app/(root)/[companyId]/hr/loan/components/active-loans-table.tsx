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
      return <span className="font-medium">AED {amount.toLocaleString()}</span>
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
