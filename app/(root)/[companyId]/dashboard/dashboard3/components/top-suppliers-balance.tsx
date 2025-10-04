"use client"

import {
  Calendar,
  Eye,
  FileText,
  MessageSquare,
  _DollarSign,
  _Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Dashboard3Filters {
  dateRange: { from: Date; to: Date } | undefined
  supplierCategory: string[]
  paymentTerms: string
  approvalStatus: string
  legalEntity: string[]
}

interface SupplierBalance {
  id: string
  name: string
  totalDue: number
  paymentTerms: string
  nextPaymentDate: string
  relationshipStatus: "good" | "watch" | "critical"
  invoiceCount: number
  avgPaymentDays: number
}

interface TopSuppliersBalanceProps {
  filters: Dashboard3Filters
}

export default function TopSuppliersBalance({
  filters: _filters,
}: TopSuppliersBalanceProps) {
  // Mock data - replace with actual API call
  const suppliersData: SupplierBalance[] = [
    {
      id: "1",
      name: "Acme Manufacturing Ltd.",
      totalDue: 485750,
      paymentTerms: "Net 30",
      nextPaymentDate: "2024-01-15",
      relationshipStatus: "good",
      invoiceCount: 12,
      avgPaymentDays: 28,
    },
    {
      id: "2",
      name: "Global Logistics Inc.",
      totalDue: 342900,
      paymentTerms: "Net 45",
      nextPaymentDate: "2024-01-18",
      relationshipStatus: "watch",
      invoiceCount: 8,
      avgPaymentDays: 35,
    },
    {
      id: "3",
      name: "Tech Solutions Corp.",
      totalDue: 298400,
      paymentTerms: "Net 30",
      nextPaymentDate: "2024-01-12",
      relationshipStatus: "good",
      invoiceCount: 15,
      avgPaymentDays: 26,
    },
    {
      id: "4",
      name: "Premier Office Supplies",
      totalDue: 187650,
      paymentTerms: "Net 15",
      nextPaymentDate: "2024-01-10",
      relationshipStatus: "critical",
      invoiceCount: 6,
      avgPaymentDays: 42,
    },
    {
      id: "5",
      name: "Industrial Equipment Co.",
      totalDue: 156300,
      paymentTerms: "Net 60",
      nextPaymentDate: "2024-01-25",
      relationshipStatus: "good",
      invoiceCount: 4,
      avgPaymentDays: 31,
    },
    {
      id: "6",
      name: "Marketing Partners LLC",
      totalDue: 134200,
      paymentTerms: "Net 30",
      nextPaymentDate: "2024-01-14",
      relationshipStatus: "watch",
      invoiceCount: 7,
      avgPaymentDays: 33,
    },
    {
      id: "7",
      name: "Utility Services Group",
      totalDue: 98750,
      paymentTerms: "Net 15",
      nextPaymentDate: "2024-01-08",
      relationshipStatus: "good",
      invoiceCount: 3,
      avgPaymentDays: 29,
    },
    {
      id: "8",
      name: "Professional Consulting",
      totalDue: 87600,
      paymentTerms: "Net 30",
      nextPaymentDate: "2024-01-20",
      relationshipStatus: "good",
      invoiceCount: 9,
      avgPaymentDays: 27,
    },
    {
      id: "9",
      name: "Construction Materials Ltd.",
      totalDue: 65400,
      paymentTerms: "Net 45",
      nextPaymentDate: "2024-01-22",
      relationshipStatus: "watch",
      invoiceCount: 5,
      avgPaymentDays: 38,
    },
    {
      id: "10",
      name: "IT Infrastructure Inc.",
      totalDue: 54300,
      paymentTerms: "Net 30",
      nextPaymentDate: "2024-01-16",
      relationshipStatus: "good",
      invoiceCount: 11,
      avgPaymentDays: 30,
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good":
        return <span className="text-green-500">🟢</span>
      case "watch":
        return <span className="text-yellow-500">🟡</span>
      case "critical":
        return <span className="text-red-500">🔴</span>
      default:
        return <span className="text-gray-500">⚪</span>
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "good":
        return "Good"
      case "watch":
        return "Watch"
      case "critical":
        return "Critical"
      default:
        return "Unknown"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleSupplierClick = (supplier: SupplierBalance) => {
    // This would open the supplier detail modal
    console.log(`Opening supplier detail for: ${supplier.name}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Top 10 Suppliers by Outstanding Balance</span>
          <Badge variant="outline" className="text-xs">
            {suppliersData.length} suppliers
          </Badge>
        </CardTitle>
        <CardDescription>
          Suppliers with largest payment obligations requiring attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier Name</TableHead>
                  <TableHead className="text-right">Total Due</TableHead>
                  <TableHead>Payment Terms</TableHead>
                  <TableHead>Next Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliersData.map((supplier) => (
                  <TableRow
                    key={supplier.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleSupplierClick(supplier)}
                  >
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{supplier.name}</div>
                        <div className="text-muted-foreground text-xs">
                          {supplier.invoiceCount} invoices
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(supplier.totalDue)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {supplier.paymentTerms}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="text-muted-foreground h-3 w-3" />
                        <span className="text-sm">
                          {formatDate(supplier.nextPaymentDate)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(supplier.relationshipStatus)}
                        <span className="text-sm">
                          {getStatusText(supplier.relationshipStatus)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{supplier.name} - Details</DialogTitle>
                            <DialogDescription>
                              Complete supplier information and payment history
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {/* Supplier Summary */}
                            <div className="bg-muted/50 grid grid-cols-2 gap-4 rounded-lg p-4">
                              <div>
                                <div className="text-muted-foreground text-sm">
                                  Total Outstanding
                                </div>
                                <div className="text-lg font-semibold">
                                  {formatCurrency(supplier.totalDue)}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground text-sm">
                                  Payment Terms
                                </div>
                                <div className="text-lg font-semibold">
                                  {supplier.paymentTerms}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground text-sm">
                                  Next Payment Date
                                </div>
                                <div className="text-lg font-semibold">
                                  {formatDate(supplier.nextPaymentDate)}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground text-sm">
                                  Avg. Payment Days
                                </div>
                                <div className="text-lg font-semibold">
                                  {supplier.avgPaymentDays} days
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-2">
                              <Button size="sm" className="flex-1">
                                <FileText className="mr-2 h-4 w-4" />
                                View All Invoices
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Contact Supplier
                              </Button>
                            </div>

                            {/* Recent Invoices (Mock) */}
                            <div>
                              <h4 className="mb-2 font-semibold">
                                Recent Invoices
                              </h4>
                              <div className="space-y-2">
                                {[
                                  {
                                    invoice: "INV-2024-001",
                                    amount: 45000,
                                    due: "2024-01-15",
                                    status: "Approved",
                                  },
                                  {
                                    invoice: "INV-2024-002",
                                    amount: 32000,
                                    due: "2024-01-20",
                                    status: "Pending",
                                  },
                                  {
                                    invoice: "INV-2024-003",
                                    amount: 28000,
                                    due: "2024-01-25",
                                    status: "Approved",
                                  },
                                ].map((invoice, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between rounded border p-2"
                                  >
                                    <div>
                                      <div className="font-medium">
                                        {invoice.invoice}
                                      </div>
                                      <div className="text-muted-foreground text-sm">
                                        Due: {formatDate(invoice.due)}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-semibold">
                                        {formatCurrency(invoice.amount)}
                                      </div>
                                      <Badge
                                        variant={
                                          invoice.status === "Approved"
                                            ? "default"
                                            : "secondary"
                                        }
                                        className="text-xs"
                                      >
                                        {invoice.status}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">
                  Total Outstanding:
                </span>
                <span className="ml-2 font-semibold">
                  {formatCurrency(
                    suppliersData.reduce((sum, s) => sum + s.totalDue, 0)
                  )}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Avg. Payment Terms:
                </span>
                <span className="ml-2 font-semibold">32 days</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
