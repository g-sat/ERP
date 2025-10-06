"use client"

import { useState } from "react"
import { ICBBatchPaymentHd } from "@/interfaces/cb-batchpayment"
import { format } from "date-fns"
import {
  CheckCircle,
  Clock,
  Edit,
  Eye,
  History,
  MoreHorizontal,
  Trash2,
  XCircle,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface CBBatchPaymentTableProps {
  data: ICBBatchPaymentHd[]
  isLoading: boolean
  onEdit: (paymentId: string) => void
  onViewHistory: (paymentId: string) => void
  onRefresh: () => void
}

export default function CBBatchPaymentTable({
  data,
  isLoading,
  onEdit,
  onViewHistory,
  onRefresh,
}: CBBatchPaymentTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  const getStatusBadge = (payment: ICBBatchPaymentHd) => {
    if (payment.isCancel) {
      return <Badge variant="destructive">Cancelled</Badge>
    }
    if (payment.editVersion > 0) {
      return <Badge variant="secondary">Modified</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  const getStatusIcon = (payment: ICBBatchPaymentHd) => {
    if (payment.isCancel) {
      return <XCircle className="text-destructive h-4 w-4" />
    }
    if (payment.editVersion > 0) {
      return <Clock className="h-4 w-4 text-yellow-500" />
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />
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
    return format(new Date(date), "MMM dd, yyyy")
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CB Batch Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[120px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>CB Batch Payments</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
              {data.length} payment{data.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No payments found</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <input
                      type="checkbox"
                      className="rounded"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(data.map((p) => p.paymentId))
                        } else {
                          setSelectedRows([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Payment No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((payment) => (
                  <TableRow key={payment.paymentId}>
                    <TableCell>
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selectedRows.includes(payment.paymentId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRows([
                              ...selectedRows,
                              payment.paymentId,
                            ])
                          } else {
                            setSelectedRows(
                              selectedRows.filter(
                                (id) => id !== payment.paymentId
                              )
                            )
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {payment.paymentNo}
                    </TableCell>
                    <TableCell>{formatDate(payment.trnDate)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {payment.supplierName}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {payment.supplierCode}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.bankName}</div>
                        <div className="text-muted-foreground text-sm">
                          {payment.bankCode}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <div className="font-medium">
                          {formatCurrency(payment.totAmt, payment.currencyCode)}
                        </div>
                        {payment.totLocalAmt &&
                          payment.totLocalAmt !== payment.totAmt && (
                            <div className="text-muted-foreground text-sm">
                              Local:{" "}
                              {formatCurrency(
                                payment.totLocalAmt,
                                payment.currencyCode
                              )}
                            </div>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment)}
                        {getStatusBadge(payment)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onEdit(payment.paymentId)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onViewHistory(payment.paymentId)}
                          >
                            <History className="mr-2 h-4 w-4" />
                            History
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {!payment.isCancel && (
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Cancel
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
