"use client"

import { ICBBatchPaymentDt } from "@/interfaces/cb-batchpayment"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

interface CBBatchPaymentDetailsTableProps {
  details: ICBBatchPaymentDt[]
  onRemoveDetail: (index: number) => void
  onUpdateDetail: (
    index: number,
    field: keyof ICBBatchPaymentDt,
    value: unknown
  ) => void
}

export default function CBBatchPaymentDetailsTable({
  details,
  onRemoveDetail,
  onUpdateDetail,
}: CBBatchPaymentDetailsTableProps) {
  if (details.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        No payment details added yet
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Invoice No</TableHead>
            <TableHead>Invoice Date</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>GL Account</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Local Amount</TableHead>
            <TableHead className="text-right">GST Amount</TableHead>
            <TableHead>Remarks</TableHead>
            <TableHead className="w-[50px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {details.map((detail, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{detail.itemNo}</TableCell>

              <TableCell>
                <Input
                  value={detail.invoiceNo || ""}
                  onChange={(e) =>
                    onUpdateDetail(index, "invoiceNo", e.target.value)
                  }
                  placeholder="Enter invoice number"
                  className="w-full"
                />
              </TableCell>

              <TableCell>
                <Input
                  type="date"
                  value={
                    detail.invoiceDate
                      ? new Date(detail.invoiceDate).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    onUpdateDetail(index, "invoiceDate", e.target.value)
                  }
                  className="w-full"
                />
              </TableCell>

              <TableCell>
                <Input
                  value={detail.supplierName || ""}
                  onChange={(e) =>
                    onUpdateDetail(index, "supplierName", e.target.value)
                  }
                  placeholder="Enter supplier name"
                  className="w-full"
                />
              </TableCell>

              <TableCell>
                <Select
                  value={detail.glId?.toString() || ""}
                  onValueChange={(value) =>
                    onUpdateDetail(index, "glId", Number(value))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select GL account" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* This would be populated with actual GL accounts */}
                    <SelectItem value="1">Cash Account</SelectItem>
                    <SelectItem value="2">Bank Account</SelectItem>
                    <SelectItem value="3">Accounts Payable</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>

              <TableCell>
                <Input
                  type="number"
                  step="0.01"
                  value={detail.totAmt || ""}
                  onChange={(e) =>
                    onUpdateDetail(index, "totAmt", Number(e.target.value))
                  }
                  placeholder="0.00"
                  className="w-full text-right"
                />
              </TableCell>

              <TableCell>
                <Input
                  type="number"
                  step="0.01"
                  value={detail.totLocalAmt || ""}
                  onChange={(e) =>
                    onUpdateDetail(index, "totLocalAmt", Number(e.target.value))
                  }
                  placeholder="0.00"
                  className="w-full text-right"
                />
              </TableCell>

              <TableCell>
                <Input
                  type="number"
                  step="0.01"
                  value={detail.gstAmt || ""}
                  onChange={(e) =>
                    onUpdateDetail(index, "gstAmt", Number(e.target.value))
                  }
                  placeholder="0.00"
                  className="w-full text-right"
                />
              </TableCell>

              <TableCell>
                <Textarea
                  value={detail.remarks || ""}
                  onChange={(e) =>
                    onUpdateDetail(index, "remarks", e.target.value)
                  }
                  placeholder="Enter remarks"
                  className="min-h-[40px] w-full"
                />
              </TableCell>

              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveDetail(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
