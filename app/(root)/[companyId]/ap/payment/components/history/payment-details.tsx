"use client"

import { ApPaymentHdSchemaType } from "@/schemas/ap-payment"
import { format } from "date-fns"
import { UseFormReturn } from "react-hook-form"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface PaymentDetailsProps {
  form: UseFormReturn<ApPaymentHdSchemaType>
  isEdit: boolean
  moduleId: number
  transactionId: number
}

export default function PaymentDetails({
  form,
  isEdit,
  moduleId,
  transactionId,
}: PaymentDetailsProps) {
  const payment = form.getValues()

  // Mock data - replace with actual API call
  const paymentHistory = [
    {
      paymentDate: payment.trnDate
        ? format(new Date(payment.trnDate), "dd/MM/yyyy")
        : "-",
      amount: payment.totAmt || 0,
      localAmount: payment.totLocalAmt || 0,
      currency: payment.currencyId || "-",
      exchangeRate: payment.exhRate || 0,
      status: payment.isCancel
        ? "Cancelled"
        : payment.isPost
          ? "Posted"
          : "Draft",
    },
  ]

  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium">Payment Details</h4>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Local Amount</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Exchange Rate</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentHistory.map((detail, index) => (
              <TableRow key={index}>
                <TableCell>{detail.paymentDate}</TableCell>
                <TableCell>{detail.amount}</TableCell>
                <TableCell>{detail.localAmount}</TableCell>
                <TableCell>{detail.currency}</TableCell>
                <TableCell>{detail.exchangeRate}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      detail.status === "Cancelled"
                        ? "bg-red-100 text-red-800"
                        : detail.status === "Posted"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {detail.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
