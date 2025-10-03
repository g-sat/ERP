"use client"

import {
  AlertTriangle,
  Calendar,
  CalendarDays,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Eye,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Dashboard3Filters {
  dateRange: { from: Date; to: Date } | undefined
  supplierCategory: string[]
  paymentTerms: string
  approvalStatus: string
  legalEntity: string[]
}

interface PaymentDue {
  id: string
  invoiceNumber: string
  supplierName: string
  dueDate: string
  amount: number
  paymentTerms: string
  approvalStatus: "pending" | "approved" | "rejected"
  paymentPriority: "past_due" | "urgent" | "scheduled"
  daysUntilDue: number
  originalAmount: number
  discountAvailable: boolean
  discountAmount?: number
}

interface PaymentsCalendarProps {
  filters: Dashboard3Filters
}

export default function PaymentsCalendar({ filters }: PaymentsCalendarProps) {
  // Mock data - replace with actual API call
  const paymentsData: PaymentDue[] = [
    {
      id: "1",
      invoiceNumber: "INV-2024-001",
      supplierName: "Acme Manufacturing Ltd.",
      dueDate: "2024-01-08",
      amount: 48500,
      paymentTerms: "Net 30",
      approvalStatus: "approved",
      paymentPriority: "past_due",
      daysUntilDue: -2,
      originalAmount: 50000,
      discountAvailable: true,
      discountAmount: 1500,
    },
    {
      id: "2",
      invoiceNumber: "INV-2024-002",
      supplierName: "Global Logistics Inc.",
      dueDate: "2024-01-10",
      amount: 34200,
      paymentTerms: "Net 45",
      approvalStatus: "approved",
      paymentPriority: "urgent",
      daysUntilDue: 0,
      originalAmount: 34200,
      discountAvailable: false,
    },
    {
      id: "3",
      invoiceNumber: "INV-2024-003",
      supplierName: "Tech Solutions Corp.",
      dueDate: "2024-01-12",
      amount: 29800,
      paymentTerms: "Net 30",
      approvalStatus: "pending",
      paymentPriority: "urgent",
      daysUntilDue: 2,
      originalAmount: 29800,
      discountAvailable: true,
      discountAmount: 596,
    },
    {
      id: "4",
      invoiceNumber: "INV-2024-004",
      supplierName: "Premier Office Supplies",
      dueDate: "2024-01-15",
      amount: 18750,
      paymentTerms: "Net 15",
      approvalStatus: "approved",
      paymentPriority: "scheduled",
      daysUntilDue: 5,
      originalAmount: 18750,
      discountAvailable: false,
    },
    {
      id: "5",
      invoiceNumber: "INV-2024-005",
      supplierName: "Industrial Equipment Co.",
      dueDate: "2024-01-18",
      amount: 156300,
      paymentTerms: "Net 60",
      approvalStatus: "approved",
      paymentPriority: "scheduled",
      daysUntilDue: 8,
      originalAmount: 156300,
      discountAvailable: true,
      discountAmount: 3126,
    },
    {
      id: "6",
      invoiceNumber: "INV-2024-006",
      supplierName: "Marketing Partners LLC",
      dueDate: "2024-01-20",
      amount: 13420,
      paymentTerms: "Net 30",
      approvalStatus: "approved",
      paymentPriority: "scheduled",
      daysUntilDue: 10,
      originalAmount: 13420,
      discountAvailable: false,
    },
    {
      id: "7",
      invoiceNumber: "INV-2024-007",
      supplierName: "Utility Services Group",
      dueDate: "2024-01-22",
      amount: 9875,
      paymentTerms: "Net 15",
      approvalStatus: "pending",
      paymentPriority: "scheduled",
      daysUntilDue: 12,
      originalAmount: 9875,
      discountAvailable: false,
    },
    {
      id: "8",
      invoiceNumber: "INV-2024-008",
      supplierName: "Professional Consulting",
      dueDate: "2024-01-25",
      amount: 8760,
      paymentTerms: "Net 30",
      approvalStatus: "approved",
      paymentPriority: "scheduled",
      daysUntilDue: 15,
      originalAmount: 8760,
      discountAvailable: false,
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "past_due":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "urgent":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "scheduled":
        return <Calendar className="h-4 w-4 text-green-500" />
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "past_due":
        return (
          <Badge variant="destructive" className="text-xs">
            Past Due
          </Badge>
        )
      case "urgent":
        return (
          <Badge variant="default" className="bg-yellow-500 text-xs">
            Urgent
          </Badge>
        )
      case "scheduled":
        return (
          <Badge variant="secondary" className="text-xs">
            Scheduled
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

  const getApprovalStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "rejected":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="text-xs">
            Approved
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="text-xs">
            Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive" className="text-xs">
            Rejected
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

  const getDaysUntilDueText = (days: number) => {
    if (days < 0) {
      return `${Math.abs(days)} days overdue`
    } else if (days === 0) {
      return "Due today"
    } else {
      return `${days} days remaining`
    }
  }

  const filterByDays = (days: number) => {
    const today = new Date()
    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() + days)

    return paymentsData.filter((payment) => {
      const paymentDate = new Date(payment.dueDate)
      return paymentDate <= targetDate
    })
  }

  const next7Days = filterByDays(7)
  const next30Days = filterByDays(30)
  const next60Days = filterByDays(60)

  const handleSchedulePayment = (payment: PaymentDue) => {
    console.log(`Scheduling payment for invoice: ${payment.invoiceNumber}`)
  }

  const handleViewInvoice = (payment: PaymentDue) => {
    console.log(`Viewing invoice: ${payment.invoiceNumber}`)
  }

  const handleRequestExtension = (payment: PaymentDue) => {
    console.log(`Requesting extension for invoice: ${payment.invoiceNumber}`)
  }

  const renderPaymentTable = (payments: PaymentDue[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Due Date</TableHead>
          <TableHead>Supplier</TableHead>
          <TableHead>Invoice #</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Payment Terms</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>
              <div className="flex items-center space-x-2">
                <CalendarDays className="text-muted-foreground h-4 w-4" />
                <div>
                  <div className="font-medium">
                    {formatDate(payment.dueDate)}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {getDaysUntilDueText(payment.daysUntilDue)}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell className="font-medium">
              {payment.supplierName}
            </TableCell>
            <TableCell>
              <div className="font-mono text-sm">{payment.invoiceNumber}</div>
            </TableCell>
            <TableCell className="text-right">
              <div className="font-semibold">
                {formatCurrency(payment.amount)}
              </div>
              {payment.discountAvailable && (
                <div className="text-xs text-green-600">
                  Save {formatCurrency(payment.discountAmount || 0)}
                </div>
              )}
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="text-xs">
                {payment.paymentTerms}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                {getApprovalStatusIcon(payment.approvalStatus)}
                {getApprovalStatusBadge(payment.approvalStatus)}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                {getPriorityIcon(payment.paymentPriority)}
                {getPriorityBadge(payment.paymentPriority)}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center space-x-1">
                {payment.approvalStatus === "approved" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSchedulePayment(payment)}
                  >
                    <CreditCard className="mr-1 h-4 w-4" />
                    Schedule
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
                        Invoice Details - {payment.invoiceNumber}
                      </DialogTitle>
                      <DialogDescription>
                        Complete payment information and actions
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Invoice Summary */}
                      <div className="bg-muted/50 grid grid-cols-2 gap-4 rounded-lg p-4">
                        <div>
                          <div className="text-muted-foreground text-sm">
                            Invoice Amount
                          </div>
                          <div className="text-lg font-semibold">
                            {formatCurrency(payment.originalAmount)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-sm">
                            Amount Due
                          </div>
                          <div className="text-lg font-semibold">
                            {formatCurrency(payment.amount)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-sm">
                            Due Date
                          </div>
                          <div className="text-lg font-semibold">
                            {formatDate(payment.dueDate)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-sm">
                            Payment Terms
                          </div>
                          <div className="text-lg font-semibold">
                            {payment.paymentTerms}
                          </div>
                        </div>
                      </div>

                      {/* Discount Information */}
                      {payment.discountAvailable && (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                          <div className="mb-2 flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-800">
                              Early Payment Discount Available
                            </span>
                          </div>
                          <div className="text-sm text-green-700">
                            Save {formatCurrency(payment.discountAmount || 0)}{" "}
                            by paying early
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        {payment.approvalStatus === "approved" && (
                          <Button className="flex-1">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Schedule Payment
                          </Button>
                        )}
                        <Button variant="outline" className="flex-1">
                          <Eye className="mr-2 h-4 w-4" />
                          View Invoice
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Calendar className="mr-2 h-4 w-4" />
                          Request Extension
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
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Upcoming Payments Calendar</span>
          <Badge variant="outline" className="text-xs">
            {paymentsData.length} payments
          </Badge>
        </CardTitle>
        <CardDescription>
          Time-phased view of payment obligations for cash flow management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="7days" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="7days">
              Next 7 Days ({next7Days.length})
            </TabsTrigger>
            <TabsTrigger value="30days">
              Next 30 Days ({next30Days.length})
            </TabsTrigger>
            <TabsTrigger value="60days">
              Next 60 Days ({next60Days.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="7days" className="space-y-4">
            <div className="rounded-md border">
              {renderPaymentTable(next7Days)}
            </div>
          </TabsContent>

          <TabsContent value="30days" className="space-y-4">
            <div className="rounded-md border">
              {renderPaymentTable(next30Days)}
            </div>
          </TabsContent>

          <TabsContent value="60days" className="space-y-4">
            <div className="rounded-md border">
              {renderPaymentTable(next60Days)}
            </div>
          </TabsContent>
        </Tabs>

        {/* Summary Stats */}
        <div className="mt-4 border-t pt-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Next 7 Days:</span>
              <span className="ml-2 font-semibold">
                {formatCurrency(
                  next7Days.reduce((sum, p) => sum + p.amount, 0)
                )}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Next 30 Days:</span>
              <span className="ml-2 font-semibold">
                {formatCurrency(
                  next30Days.reduce((sum, p) => sum + p.amount, 0)
                )}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Next 60 Days:</span>
              <span className="ml-2 font-semibold">
                {formatCurrency(
                  next60Days.reduce((sum, p) => sum + p.amount, 0)
                )}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
