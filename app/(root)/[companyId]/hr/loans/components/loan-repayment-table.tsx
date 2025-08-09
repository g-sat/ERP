"use client"

import { useEffect, useState } from "react"
import { ILoanRepayment } from "@/interfaces/loans"
import { ColumnDef } from "@tanstack/react-table"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Dummy repayment data
const dummyRepayments: ILoanRepayment[] = [
  {
    repaymentId: 1,
    loanRequestId: 2,
    installmentNumber: 1,
    dueDate: "2025-05-31",
    emiAmount: 0,
    principalComponent: 0,
    interestComponent: 0,
    outstandingBalance: 5000,
    statusId: 1,
    paidDate: undefined,
  },
  {
    repaymentId: 2,
    loanRequestId: 2,
    installmentNumber: 2,
    dueDate: "2025-06-10",
    emiAmount: 500,
    principalComponent: 400,
    interestComponent: 100,
    outstandingBalance: 4600,
    statusId: 2,
    paidDate: "2025-06-10",
  },
  {
    repaymentId: 3,
    loanRequestId: 2,
    installmentNumber: 3,
    dueDate: "2025-06-30",
    emiAmount: 800,
    principalComponent: 700,
    interestComponent: 100,
    outstandingBalance: 3900,
    statusId: 3,
    paidDate: "2025-06-30",
  },
  {
    repaymentId: 4,
    loanRequestId: 2,
    installmentNumber: 4,
    dueDate: "2025-07-31",
    emiAmount: 800,
    principalComponent: 700,
    interestComponent: 100,
    outstandingBalance: 3200,
    statusId: 3,
    paidDate: "2025-07-31",
  },
  {
    repaymentId: 5,
    loanRequestId: 2,
    installmentNumber: 5,
    dueDate: "2025-08-05",
    emiAmount: 400,
    principalComponent: 350,
    interestComponent: 50,
    outstandingBalance: 2850,
    statusId: 2,
    paidDate: "2025-08-05",
  },
]

const repaymentColumns: ColumnDef<ILoanRepayment>[] = [
  {
    accessorKey: "dueDate",
    header: "INSTALMENT DATE",
    cell: ({ row }) => {
      const date = row.getValue("dueDate") as string
      return <span>{new Date(date).toLocaleDateString()}</span>
    },
  },
  {
    accessorKey: "emiAmount",
    header: "EMI",
    cell: ({ row }) => {
      const emi = row.getValue("emiAmount") as number
      const status = row.original.statusId
      return (
        <div>
          <div>AED {emi.toLocaleString()}</div>
          {status === "PartPayment" && (
            <div className="text-xs font-medium text-orange-600">
              PART PAYMENT
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "outstandingBalance",
    header: "TOTAL AMOUNT REPAID",
    cell: ({ row }) => {
      const loanAmount = 5000 // Total loan amount
      const outstanding = row.getValue("outstandingBalance") as number
      const repaid = loanAmount - outstanding
      return (
        <span className="font-medium text-green-600">
          AED {repaid.toLocaleString()}
        </span>
      )
    },
  },
  {
    accessorKey: "outstandingBalance",
    header: "REMAINING AMOUNT",
    cell: ({ row }) => {
      const outstanding = row.getValue("outstandingBalance") as number
      return (
        <div className="flex items-center justify-between">
          <span className="font-medium text-red-600">
            AED {outstanding.toLocaleString()}
          </span>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )
    },
  },
]

interface LoanRepaymentTableProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  loanId: number | null
}

export function LoanRepaymentTable({
  open,
  onOpenChange,
  loanId,
}: LoanRepaymentTableProps) {
  const [repayments, setRepayments] = useState<ILoanRepayment[]>([])

  useEffect(() => {
    if (loanId) {
      // In real app, fetch repayments for the specific loan
      setRepayments(dummyRepayments)
    }
  }, [loanId])

  const totalRepaid = 2500 // In real app, calculate from repayments
  const remainingAmount = 2500 // In real app, calculate from repayments
  const installmentsRemaining = 4 // In real app, calculate from repayments

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Loan Repayment History</DialogTitle>
        </DialogHeader>

        {loanId && (
          <>
            {/* Summary */}
            <div className="mb-6 grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  AED {totalRepaid.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Amount Repaid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  AED {remainingAmount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Remaining Amount</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {installmentsRemaining}
                </div>
                <div className="text-sm text-gray-600">
                  Instalment(s) Remaining
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
