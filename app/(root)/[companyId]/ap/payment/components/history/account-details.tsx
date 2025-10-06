"use client"

import { ApPaymentHdSchemaType } from "@/schemas/ap-payment"
import { UseFormReturn } from "react-hook-form"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface AccountDetailsProps {
  form: UseFormReturn<ApPaymentHdSchemaType>
  isEdit: boolean
  moduleId: number
  transactionId: number
}

export default function AccountDetails({
  form,
  isEdit,
  moduleId,
  transactionId,
}: AccountDetailsProps) {
  const payment = form.getValues()

  // Mock data - replace with actual API call
  const accountDetails = [
    {
      glId: 1001,
      glCode: "CASH",
      glName: "Cash Account",
      debitAmt: 0,
      creditAmt: payment.totLocalAmt || 0,
      localDebitAmt: 0,
      localCreditAmt: payment.totLocalAmt || 0,
    },
    {
      glId: 2001,
      glCode: "AP",
      glName: "Accounts Payable",
      debitAmt: payment.totAmt || 0,
      creditAmt: 0,
      localDebitAmt: payment.totLocalAmt || 0,
      localCreditAmt: 0,
    },
  ]

  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium">Account Details</h4>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>GL ID</TableHead>
              <TableHead>GL Code</TableHead>
              <TableHead>GL Name</TableHead>
              <TableHead>Debit Amount</TableHead>
              <TableHead>Credit Amount</TableHead>
              <TableHead>Local Debit Amount</TableHead>
              <TableHead>Local Credit Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accountDetails.map((detail, index) => (
              <TableRow key={index}>
                <TableCell>{detail.glId}</TableCell>
                <TableCell>{detail.glCode}</TableCell>
                <TableCell>{detail.glName}</TableCell>
                <TableCell>{detail.debitAmt}</TableCell>
                <TableCell>{detail.creditAmt}</TableCell>
                <TableCell>{detail.localDebitAmt}</TableCell>
                <TableCell>{detail.localCreditAmt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
