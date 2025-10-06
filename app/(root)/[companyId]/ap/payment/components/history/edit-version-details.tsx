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

interface EditVersionDetailsProps {
  form: UseFormReturn<ApPaymentHdSchemaType>
  isEdit: boolean
  moduleId: number
  transactionId: number
}

export default function EditVersionDetails({
  form,
  isEdit,
  moduleId,
  transactionId,
}: EditVersionDetailsProps) {
  const payment = form.getValues()

  // Mock data - replace with actual API call
  const editVersions = [
    {
      version: payment.editVersion || 0,
      editDate: payment.editDate
        ? format(new Date(payment.editDate), "dd/MM/yyyy HH:mm")
        : "-",
      editBy: payment.editById || "-",
      changes: "Initial creation",
    },
  ]

  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium">Edit Version Details</h4>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Version</TableHead>
              <TableHead>Edit Date</TableHead>
              <TableHead>Edit By</TableHead>
              <TableHead>Changes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {editVersions.map((version, index) => (
              <TableRow key={index}>
                <TableCell>{version.version}</TableCell>
                <TableCell>{version.editDate}</TableCell>
                <TableCell>{version.editBy}</TableCell>
                <TableCell>{version.changes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
