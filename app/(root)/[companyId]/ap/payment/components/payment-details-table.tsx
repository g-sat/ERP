"use client"

import { useEffect, useRef } from "react"
import { IVisibleFields } from "@/interfaces/setting"
import { ApPaymentHdSchemaType } from "@/schemas/ap-payment"
import { Trash2 } from "lucide-react"
import { UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface PaymentDetailsTableProps {
  form: UseFormReturn<ApPaymentHdSchemaType>
  visible: IVisibleFields
  onAddRowRef: React.MutableRefObject<((rowData: any) => void) | null>
}

export default function PaymentDetailsTable({
  form,
  visible,
  onAddRowRef,
}: PaymentDetailsTableProps) {
  const { watch, setValue } = form
  const dataDetails = watch("data_details") || []

  // Set the ref for adding rows
  useEffect(() => {
    onAddRowRef.current = (rowData: any) => {
      const currentDetails = form.getValues("data_details") || []
      const newItemNo = currentDetails.length + 1

      const newRow = {
        ...rowData,
        itemNo: newItemNo,
        companyId: 0,
        paymentId: 0,
        paymentNo: "",
        transactionId: 1,
        documentId: 0,
        editVersion: 0,
      }

      setValue("data_details", [...currentDetails, newRow])
    }
  }, [form, setValue, onAddRowRef])

  const handleDeleteRow = (index: number) => {
    const currentDetails = form.getValues("data_details") || []
    const updatedDetails = currentDetails.filter((_, i) => i !== index)
    setValue("data_details", updatedDetails)
  }

  return (
    <div className="space-y-4 p-6">
      <h3 className="text-lg font-semibold">Payment Details</h3>

      {dataDetails.length === 0 ? (
        <div className="text-muted-foreground py-8 text-center">
          No payment details added yet. Use the form above to add details.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item No</TableHead>
                <TableHead>Document No</TableHead>
                <TableHead>Reference No</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Exchange Rate</TableHead>
                <TableHead>Account Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Total Local Amount</TableHead>
                <TableHead>Balance Amount</TableHead>
                <TableHead>Balance Local Amount</TableHead>
                <TableHead>Allocation Amount</TableHead>
                <TableHead>Allocation Local Amount</TableHead>
                <TableHead>Doc Allocation Amount</TableHead>
                <TableHead>Doc Allocation Local Amount</TableHead>
                <TableHead>Cent Difference</TableHead>
                <TableHead>Exchange Gain/Loss</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataDetails.map((detail, index) => (
                <TableRow key={index}>
                  <TableCell>{detail.itemNo}</TableCell>
                  <TableCell>{detail.documentNo}</TableCell>
                  <TableCell>{detail.referenceNo}</TableCell>
                  <TableCell>{detail.docCurrencyId}</TableCell>
                  <TableCell>{detail.docExhRate}</TableCell>
                  <TableCell>
                    {detail.docAccountDate
                      ? new Date(detail.docAccountDate).toLocaleDateString()
                      : ""}
                  </TableCell>
                  <TableCell>
                    {detail.docDueDate
                      ? new Date(detail.docDueDate).toLocaleDateString()
                      : ""}
                  </TableCell>
                  <TableCell>{detail.docTotAmt}</TableCell>
                  <TableCell>{detail.docTotLocalAmt}</TableCell>
                  <TableCell>{detail.docBalAmt}</TableCell>
                  <TableCell>{detail.docBalLocalAmt}</TableCell>
                  <TableCell>{detail.allocAmt}</TableCell>
                  <TableCell>{detail.allocLocalAmt}</TableCell>
                  <TableCell>{detail.docAllocAmt}</TableCell>
                  <TableCell>{detail.docAllocLocalAmt}</TableCell>
                  <TableCell>{detail.centDiff}</TableCell>
                  <TableCell>{detail.exhGainLoss}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteRow(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
