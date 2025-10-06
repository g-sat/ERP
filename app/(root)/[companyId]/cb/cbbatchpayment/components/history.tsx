"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  User,
  XCircle,
} from "lucide-react"

import { useGetCBBatchPaymentById } from "@/hooks/use-cb-batchpayment"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface CBBatchPaymentHistoryProps {
  companyId: number
  paymentId: string
  onClose: () => void
}

export default function CBBatchPaymentHistory({
  companyId,
  paymentId,
  onClose,
}: CBBatchPaymentHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)

  const { data: paymentData, isLoading } = useGetCBBatchPaymentById(
    companyId,
    paymentId
  )

  const getStatusIcon = (isCancel: boolean, editVersion: number) => {
    if (isCancel) {
      return <XCircle className="text-destructive h-4 w-4" />
    }
    if (editVersion > 0) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getStatusBadge = (isCancel: boolean, editVersion: number) => {
    if (isCancel) {
      return <Badge variant="destructive">Cancelled</Badge>
    }
    if (editVersion > 0) {
      return <Badge variant="secondary">Modified</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  const formatCurrency = (amount: number, currencyCode?: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode || "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (date: Date | string) => {
    if (!date) return "-"
    return format(new Date(date), "MMM dd, yyyy HH:mm")
  }

  if (isLoading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const payment = paymentData?.data

  if (!payment) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment History</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Payment not found</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment History - {payment.paymentNo}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Current Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Payment No:</span>
                    <span>{payment.paymentNo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Transaction Date:</span>
                    <span>{formatDate(payment.trnDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Supplier:</span>
                    <span>{payment.supplierName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Bank:</span>
                    <span>{payment.bankName}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Total Amount:</span>
                    <span className="font-bold">
                      {formatCurrency(payment.totAmt, payment.currencyCode)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Currency:</span>
                    <span>
                      {payment.currencyName} ({payment.currencyCode})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Exchange Rate:</span>
                    <span>{payment.exhRate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(payment.isCancel, payment.editVersion)}
                      {getStatusBadge(payment.isCancel, payment.editVersion)}
                    </div>
                  </div>
                </div>
              </div>

              {payment.remarks && (
                <div className="mt-4">
                  <span className="font-medium">Remarks:</span>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {payment.remarks}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit Trail */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Creation */}
                <div className="flex items-start gap-3 rounded-lg border p-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-medium">Payment Created</span>
                      <Badge variant="default">Created</Badge>
                    </div>
                    <div className="text-muted-foreground text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Created by: {payment.createBy}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(payment.createDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit History */}
                {payment.editDate && (
                  <div className="flex items-start gap-3 rounded-lg border p-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-500" />
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-medium">Payment Modified</span>
                        <Badge variant="secondary">Modified</Badge>
                      </div>
                      <div className="text-muted-foreground text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Modified by: {payment.editBy}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(payment.editDate)}</span>
                        </div>
                        <div className="mt-1">
                          <span className="text-xs">
                            Version: {payment.editVersion}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cancellation */}
                {payment.isCancel && payment.cancelDate && (
                  <div className="flex items-start gap-3 rounded-lg border p-3">
                    <XCircle className="text-destructive mt-0.5 h-5 w-5" />
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-medium">Payment Cancelled</span>
                        <Badge variant="destructive">Cancelled</Badge>
                      </div>
                      <div className="text-muted-foreground text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Cancelled by: {payment.cancelBy}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(payment.cancelDate)}</span>
                        </div>
                        {payment.cancelRemarks && (
                          <div className="mt-2">
                            <span className="font-medium">
                              Cancellation Reason:
                            </span>
                            <p className="text-sm">{payment.cancelRemarks}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          {payment.data_details && payment.data_details.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Invoice No</TableHead>
                        <TableHead>Invoice Date</TableHead>
                        <TableHead>GL Account</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">GST Amount</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payment.data_details.map((detail, index) => (
                        <TableRow key={index}>
                          <TableCell>{detail.itemNo}</TableCell>
                          <TableCell>{detail.invoiceNo || "-"}</TableCell>
                          <TableCell>
                            {detail.invoiceDate
                              ? formatDate(detail.invoiceDate)
                              : "-"}
                          </TableCell>
                          <TableCell>{detail.glId || "-"}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(
                              detail.totAmt,
                              payment.currencyCode
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(
                              detail.gstAmt,
                              payment.currencyCode
                            )}
                          </TableCell>
                          <TableCell>{detail.remarks || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
