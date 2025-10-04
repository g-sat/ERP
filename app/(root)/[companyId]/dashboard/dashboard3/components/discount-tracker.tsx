"use client"

import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Eye,
  TrendingUp,
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

interface DiscountOpportunity {
  id: string
  supplierName: string
  invoiceNumber: string
  dueDate: string
  discountTerms: string
  discountExpiryDate: string
  potentialSavings: number
  discountStatus: "active" | "expiring_soon" | "expired"
  invoiceAmount: number
  discountPercent: number
  discountDays: number
  daysUntilExpiry: number
}

interface DiscountTrackerProps {
  filters: Dashboard3Filters
}

export default function DiscountTracker({
  filters: _filters,
}: DiscountTrackerProps) {
  // Mock data - replace with actual API call
  const discountData: DiscountOpportunity[] = [
    {
      id: "1",
      supplierName: "Acme Manufacturing Ltd.",
      invoiceNumber: "INV-2024-001",
      dueDate: "2024-01-30",
      discountTerms: "2/10 Net 30",
      discountExpiryDate: "2024-01-10",
      potentialSavings: 1000,
      discountStatus: "active",
      invoiceAmount: 50000,
      discountPercent: 2,
      discountDays: 10,
      daysUntilExpiry: 3,
    },
    {
      id: "2",
      supplierName: "Tech Solutions Corp.",
      invoiceNumber: "INV-2024-003",
      dueDate: "2024-02-12",
      discountTerms: "1.5/15 Net 30",
      discountExpiryDate: "2024-01-12",
      potentialSavings: 447,
      discountStatus: "active",
      invoiceAmount: 29800,
      discountPercent: 1.5,
      discountDays: 15,
      daysUntilExpiry: 5,
    },
    {
      id: "3",
      supplierName: "Industrial Equipment Co.",
      invoiceNumber: "INV-2024-005",
      dueDate: "2024-03-18",
      discountTerms: "3/10 Net 60",
      discountExpiryDate: "2024-01-28",
      potentialSavings: 4689,
      discountStatus: "active",
      invoiceAmount: 156300,
      discountPercent: 3,
      discountDays: 10,
      daysUntilExpiry: 15,
    },
    {
      id: "4",
      supplierName: "Global Logistics Inc.",
      invoiceNumber: "INV-2024-009",
      dueDate: "2024-02-25",
      discountTerms: "2.5/20 Net 45",
      discountExpiryDate: "2024-01-25",
      potentialSavings: 1250,
      discountStatus: "expiring_soon",
      invoiceAmount: 50000,
      discountPercent: 2.5,
      discountDays: 20,
      daysUntilExpiry: 1,
    },
    {
      id: "5",
      supplierName: "Marketing Partners LLC",
      invoiceNumber: "INV-2024-010",
      dueDate: "2024-02-20",
      discountTerms: "1/5 Net 30",
      discountExpiryDate: "2024-01-05",
      potentialSavings: 134,
      discountStatus: "expired",
      invoiceAmount: 13420,
      discountPercent: 1,
      discountDays: 5,
      daysUntilExpiry: -3,
    },
    {
      id: "6",
      supplierName: "Professional Consulting",
      invoiceNumber: "INV-2024-011",
      dueDate: "2024-02-25",
      discountTerms: "2/10 Net 30",
      discountExpiryDate: "2024-01-15",
      potentialSavings: 175,
      discountStatus: "active",
      invoiceAmount: 8760,
      discountPercent: 2,
      discountDays: 10,
      daysUntilExpiry: 8,
    },
  ]

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

  const getDiscountStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "expiring_soon":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getDiscountStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-500 text-xs">
            Active
          </Badge>
        )
      case "expiring_soon":
        return (
          <Badge variant="default" className="bg-yellow-500 text-xs">
            Expiring Soon
          </Badge>
        )
      case "expired":
        return (
          <Badge variant="destructive" className="text-xs">
            Expired
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-xs">
            Unknown
          </Badge>
        )
    }
  }

  const getDaysUntilExpiryText = (days: number) => {
    if (days < 0) {
      return `${Math.abs(days)} days ago`
    } else if (days === 0) {
      return "Expires today"
    } else if (days === 1) {
      return "Expires tomorrow"
    } else {
      return `${days} days remaining`
    }
  }

  const totalPotentialSavings = discountData
    .filter((item) => item.discountStatus === "active")
    .reduce((sum, item) => sum + item.potentialSavings, 0)

  const expiringSoonCount = discountData.filter(
    (item) => item.discountStatus === "expiring_soon"
  ).length

  const handleScheduleEarlyPayment = (discount: DiscountOpportunity) => {
    console.log(
      `Scheduling early payment for invoice: ${discount.invoiceNumber}`
    )
  }

  const _handleViewInvoice = (discount: DiscountOpportunity) => {
    console.log(`Viewing invoice: ${discount.invoiceNumber}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Early Payment Discount Tracker</span>
          <Badge variant="outline" className="text-xs">
            ${totalPotentialSavings.toLocaleString()} potential savings
          </Badge>
        </CardTitle>
        <CardDescription>
          Identify and capture early payment discount opportunities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="mb-2 flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">
                  Active Opportunities
                </span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalPotentialSavings)}
              </div>
              <div className="text-sm text-green-700">
                {
                  discountData.filter(
                    (item) => item.discountStatus === "active"
                  ).length
                }{" "}
                opportunities
              </div>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="mb-2 flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800">
                  Expiring Soon
                </span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {expiringSoonCount}
              </div>
              <div className="text-sm text-yellow-700">
                Need immediate attention
              </div>
            </div>
          </div>

          {/* Discount Opportunities Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Discount Terms</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead className="text-right">
                    Potential Savings
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discountData.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell className="font-medium">
                      {discount.supplierName}
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm">
                        {discount.invoiceNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {discount.discountTerms}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="text-muted-foreground h-4 w-4" />
                        <div>
                          <div className="font-medium">
                            {formatDate(discount.discountExpiryDate)}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {getDaysUntilExpiryText(discount.daysUntilExpiry)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-semibold text-green-600">
                        {formatCurrency(discount.potentialSavings)}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {discount.discountPercent}% of{" "}
                        {formatCurrency(discount.invoiceAmount)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getDiscountStatusIcon(discount.discountStatus)}
                        {getDiscountStatusBadge(discount.discountStatus)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center space-x-1">
                        {discount.discountStatus === "active" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleScheduleEarlyPayment(discount)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CreditCard className="mr-1 h-4 w-4" />
                            Schedule Early Payment
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>
                                Discount Opportunity - {discount.invoiceNumber}
                              </DialogTitle>
                              <DialogDescription>
                                Detailed discount terms and payment scheduling
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {/* Discount Summary */}
                              <div className="bg-muted/50 grid grid-cols-2 gap-4 rounded-lg p-4">
                                <div>
                                  <div className="text-muted-foreground text-sm">
                                    Invoice Amount
                                  </div>
                                  <div className="text-lg font-semibold">
                                    {formatCurrency(discount.invoiceAmount)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground text-sm">
                                    Discount Percent
                                  </div>
                                  <div className="text-lg font-semibold">
                                    {discount.discountPercent}%
                                  </div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground text-sm">
                                    Potential Savings
                                  </div>
                                  <div className="text-lg font-semibold text-green-600">
                                    {formatCurrency(discount.potentialSavings)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground text-sm">
                                    Discount Terms
                                  </div>
                                  <div className="text-lg font-semibold">
                                    {discount.discountTerms}
                                  </div>
                                </div>
                              </div>

                              {/* Payment Schedule */}
                              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                <div className="mb-2 flex items-center space-x-2">
                                  <TrendingUp className="h-4 w-4 text-green-600" />
                                  <span className="font-semibold text-green-800">
                                    Payment Schedule
                                  </span>
                                </div>
                                <div className="text-sm text-green-700">
                                  <div>
                                    Pay by:{" "}
                                    {formatDate(discount.discountExpiryDate)}
                                  </div>
                                  <div>
                                    Amount to pay:{" "}
                                    {formatCurrency(
                                      discount.invoiceAmount -
                                        discount.potentialSavings
                                    )}
                                  </div>
                                  <div>
                                    Savings:{" "}
                                    {formatCurrency(discount.potentialSavings)}
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex space-x-2">
                                {discount.discountStatus === "active" && (
                                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Schedule Early Payment
                                  </Button>
                                )}
                                <Button variant="outline" className="flex-1">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Invoice
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Summary Stats */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">
                  Total Opportunities:
                </span>
                <span className="ml-2 font-semibold">
                  {discountData.length}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Active Opportunities:
                </span>
                <span className="ml-2 font-semibold">
                  {
                    discountData.filter(
                      (item) => item.discountStatus === "active"
                    ).length
                  }
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Total Potential Savings:
                </span>
                <span className="ml-2 font-semibold text-green-600">
                  {formatCurrency(
                    discountData.reduce(
                      (sum, item) => sum + item.potentialSavings,
                      0
                    )
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
