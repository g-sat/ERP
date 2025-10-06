"use client"

import { useState } from "react"
import { IApPaymentFilter, IApPaymentHd } from "@/interfaces/ap-payment"
import { format } from "date-fns"
import { RefreshCw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface PaymentTableProps {
  data: IApPaymentHd[]
  isLoading: boolean
  onPaymentSelect: (payment: IApPaymentHd | undefined) => void
  onRefresh: () => void
  onFilterChange: (filters: IApPaymentFilter) => void
  initialFilters: IApPaymentFilter
}

export default function PaymentTable({
  data,
  isLoading,
  onPaymentSelect,
  onRefresh,
  onFilterChange,
  initialFilters,
}: PaymentTableProps) {
  const [filters, setFilters] = useState<IApPaymentFilter>(initialFilters)

  const handleFilterChange = (field: keyof IApPaymentFilter, value: any) => {
    const newFilters = { ...filters, [field]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleSearch = () => {
    onFilterChange(filters)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="bg-muted/50 flex flex-wrap gap-4 rounded-lg p-4">
        <div className="min-w-[200px] flex-1">
          <Input
            placeholder="Search payments..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
            className="w-[150px]"
          />
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
            className="w-[150px]"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSearch} size="sm">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment No</TableHead>
              <TableHead>Reference No</TableHead>
              <TableHead>Transaction Date</TableHead>
              <TableHead>Account Date</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Bank</TableHead>
              <TableHead>Payment Type</TableHead>
              <TableHead>Cheque No</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Total Local Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={12} className="py-8 text-center">
                  Loading payments...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={12}
                  className="text-muted-foreground py-8 text-center"
                >
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              data.map((payment) => (
                <TableRow key={payment.paymentId}>
                  <TableCell className="font-medium">
                    {payment.paymentNo}
                  </TableCell>
                  <TableCell>{payment.referenceNo}</TableCell>
                  <TableCell>
                    {payment.trnDate
                      ? format(new Date(payment.trnDate), "dd/MM/yyyy")
                      : ""}
                  </TableCell>
                  <TableCell>
                    {payment.accountDate
                      ? format(new Date(payment.accountDate), "dd/MM/yyyy")
                      : ""}
                  </TableCell>
                  <TableCell>{payment.supplierId}</TableCell>
                  <TableCell>{payment.bankId}</TableCell>
                  <TableCell>{payment.paymentTypeId}</TableCell>
                  <TableCell>{payment.chequeNo || "-"}</TableCell>
                  <TableCell>{payment.totAmt}</TableCell>
                  <TableCell>{payment.totLocalAmt}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        payment.isCancel
                          ? "bg-red-100 text-red-800"
                          : payment.isPost
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {payment.isCancel
                        ? "Cancelled"
                        : payment.isPost
                          ? "Posted"
                          : "Draft"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPaymentSelect(payment)}
                    >
                      Select
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
