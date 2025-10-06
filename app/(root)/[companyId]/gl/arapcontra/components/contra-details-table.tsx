"use client"

import {
  GLContraDtSchemaType,
  GLContraHdSchemaType,
} from "@/schemas/gl-arapcontra"
import { format } from "date-fns"
import { Edit, Trash2 } from "lucide-react"
import { UseFormReturn } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ContraDetailsTableProps {
  form: UseFormReturn<GLContraHdSchemaType>
}

export default function ContraDetailsTable({ form }: ContraDetailsTableProps) {
  const { watch, setValue } = form
  const details = watch("data_details") || []

  const removeDetail = (index: number) => {
    const updatedDetails = details.filter((_, i) => i !== index)
    setValue("data_details", updatedDetails)
  }

  const editDetail = (index: number) => {
    // Implementation for editing detail
  }

  if (details.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-muted-foreground text-center">
            <p>No contra details added yet.</p>
            <p className="text-sm">Use the form above to add details.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Contra Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Document No</TableHead>
                <TableHead>Reference No</TableHead>
                <TableHead>Module ID</TableHead>
                <TableHead>Account Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right">Total Local Amount</TableHead>
                <TableHead className="text-right">Allocation Amount</TableHead>
                <TableHead className="text-right">
                  Allocation Local Amount
                </TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {details.map((detail: GLContraDtSchemaType, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {detail.itemNo || index + 1}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{detail.documentNo || "-"}</Badge>
                  </TableCell>
                  <TableCell>{detail.referenceNo || "-"}</TableCell>
                  <TableCell>{detail.moduleId || "-"}</TableCell>
                  <TableCell>
                    {detail.docAccountDate
                      ? format(
                          typeof detail.docAccountDate === "string"
                            ? new Date(detail.docAccountDate)
                            : detail.docAccountDate,
                          "dd/MM/yyyy"
                        )
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {detail.docDueDate
                      ? format(
                          typeof detail.docDueDate === "string"
                            ? new Date(detail.docDueDate)
                            : detail.docDueDate,
                          "dd/MM/yyyy"
                        )
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {detail.docTotAmt ? detail.docTotAmt.toFixed(2) : "0.00"}
                  </TableCell>
                  <TableCell className="text-right">
                    {detail.docTotLocalAmt
                      ? detail.docTotLocalAmt.toFixed(2)
                      : "0.00"}
                  </TableCell>
                  <TableCell className="text-right">
                    {detail.allocAmt ? detail.allocAmt.toFixed(2) : "0.00"}
                  </TableCell>
                  <TableCell className="text-right">
                    {detail.allocLocalAmt
                      ? detail.allocLocalAmt.toFixed(2)
                      : "0.00"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editDetail(index)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDetail(index)}
                        className="text-destructive hover:text-destructive h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary Row */}
        {details.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="text-center">
                <p className="text-muted-foreground text-sm font-medium">
                  Total Items
                </p>
                <p className="text-lg font-semibold">{details.length}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-sm font-medium">
                  Total Amount
                </p>
                <p className="text-lg font-semibold">
                  {details
                    .reduce((sum, detail) => sum + (detail.docTotAmt || 0), 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-sm font-medium">
                  Total Local Amount
                </p>
                <p className="text-lg font-semibold">
                  {details
                    .reduce(
                      (sum, detail) => sum + (detail.docTotLocalAmt || 0),
                      0
                    )
                    .toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-sm font-medium">
                  Total Allocation
                </p>
                <p className="text-lg font-semibold">
                  {details
                    .reduce((sum, detail) => sum + (detail.allocAmt || 0), 0)
                    .toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
