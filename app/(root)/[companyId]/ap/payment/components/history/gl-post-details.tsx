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

interface GLPostDetailsProps {
  form: UseFormReturn<ApPaymentHdSchemaType>
  isEdit: boolean
  moduleId: number
  transactionId: number
}

export default function GLPostDetails({
  form,
  isEdit,
  moduleId,
  transactionId,
}: GLPostDetailsProps) {
  const payment = form.getValues()

  // Mock data - replace with actual API call
  const glPostDetails = [
    {
      postDate: payment.postDate
        ? format(new Date(payment.postDate), "dd/MM/yyyy HH:mm")
        : "-",
      postBy: payment.postById || "-",
      status: payment.isPost ? "Posted" : "Not Posted",
      remarks: "Payment posted to GL",
    },
  ]

  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium">GL Post Details</h4>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Post Date</TableHead>
              <TableHead>Post By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {glPostDetails.map((detail, index) => (
              <TableRow key={index}>
                <TableCell>{detail.postDate}</TableCell>
                <TableCell>{detail.postBy}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      detail.status === "Posted"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {detail.status}
                  </span>
                </TableCell>
                <TableCell>{detail.remarks}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
