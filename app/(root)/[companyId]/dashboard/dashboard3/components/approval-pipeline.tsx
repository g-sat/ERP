"use client"

import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  User,
  XCircle,
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
import { Textarea } from "@/components/ui/textarea"

interface Dashboard3Filters {
  dateRange: { from: Date; to: Date } | undefined
  supplierCategory: string[]
  paymentTerms: string
  approvalStatus: string
  legalEntity: string[]
}

interface InvoiceCard {
  id: string
  invoiceNumber: string
  supplierName: string
  amount: number
  daysInStage: number
  currentApprover: string
  receivedDate: string
  priority: "low" | "medium" | "high"
  category: string
  status: "pending" | "approved" | "rejected"
}

interface ApprovalColumn {
  id: string
  title: string
  status: string
  invoices: InvoiceCard[]
  count: number
  totalAmount: number
}

interface ApprovalPipelineProps {
  filters: Dashboard3Filters
}

export default function ApprovalPipeline({
  filters: _filters,
}: ApprovalPipelineProps) {
  // Mock data - replace with actual API call
  const approvalColumns: ApprovalColumn[] = [
    {
      id: "received",
      title: "Received (Draft)",
      status: "received",
      count: 15,
      totalAmount: 342500,
      invoices: [
        {
          id: "1",
          invoiceNumber: "INV-2024-012",
          supplierName: "Office Depot Inc.",
          amount: 2500,
          daysInStage: 1,
          currentApprover: "AP Clerk",
          receivedDate: "2024-01-07",
          priority: "low",
          category: "Office Supplies",
          status: "pending",
        },
        {
          id: "2",
          invoiceNumber: "INV-2024-013",
          supplierName: "Cloud Services Ltd.",
          amount: 15000,
          daysInStage: 2,
          currentApprover: "AP Clerk",
          receivedDate: "2024-01-06",
          priority: "medium",
          category: "IT Services",
          status: "pending",
        },
        {
          id: "3",
          invoiceNumber: "INV-2024-014",
          supplierName: "Maintenance Co.",
          amount: 8500,
          daysInStage: 1,
          currentApprover: "AP Clerk",
          receivedDate: "2024-01-07",
          priority: "medium",
          category: "Services",
          status: "pending",
        },
      ],
    },
    {
      id: "review",
      title: "In Review",
      status: "review",
      count: 12,
      totalAmount: 287600,
      invoices: [
        {
          id: "4",
          invoiceNumber: "INV-2024-015",
          supplierName: "Marketing Agency",
          amount: 18500,
          daysInStage: 3,
          currentApprover: "Department Manager",
          receivedDate: "2024-01-04",
          priority: "high",
          category: "Marketing",
          status: "pending",
        },
        {
          id: "5",
          invoiceNumber: "INV-2024-016",
          supplierName: "Legal Services",
          amount: 12500,
          daysInStage: 2,
          currentApprover: "Legal Team",
          receivedDate: "2024-01-05",
          priority: "medium",
          category: "Professional Services",
          status: "pending",
        },
      ],
    },
    {
      id: "pending",
      title: "Pending Approval",
      status: "pending",
      count: 18,
      totalAmount: 456300,
      invoices: [
        {
          id: "6",
          invoiceNumber: "INV-2024-017",
          supplierName: "Equipment Rental",
          amount: 35000,
          daysInStage: 5,
          currentApprover: "CFO",
          receivedDate: "2024-01-02",
          priority: "high",
          category: "Equipment",
          status: "pending",
        },
        {
          id: "7",
          invoiceNumber: "INV-2024-018",
          supplierName: "Consulting Firm",
          amount: 22500,
          daysInStage: 4,
          currentApprover: "Department Head",
          receivedDate: "2024-01-03",
          priority: "medium",
          category: "Professional Services",
          status: "pending",
        },
        {
          id: "8",
          invoiceNumber: "INV-2024-019",
          supplierName: "Software License",
          amount: 18000,
          daysInStage: 6,
          currentApprover: "IT Director",
          receivedDate: "2024-01-01",
          priority: "high",
          category: "IT Services",
          status: "pending",
        },
      ],
    },
    {
      id: "approved",
      title: "Approved",
      status: "approved",
      count: 25,
      totalAmount: 678900,
      invoices: [
        {
          id: "9",
          invoiceNumber: "INV-2024-020",
          supplierName: "Raw Materials Co.",
          amount: 45000,
          daysInStage: 1,
          currentApprover: "Completed",
          receivedDate: "2023-12-28",
          priority: "high",
          category: "Raw Materials",
          status: "approved",
        },
        {
          id: "10",
          invoiceNumber: "INV-2024-021",
          supplierName: "Utilities Provider",
          amount: 12500,
          daysInStage: 0,
          currentApprover: "Completed",
          receivedDate: "2023-12-29",
          priority: "medium",
          category: "Utilities",
          status: "approved",
        },
      ],
    },
    {
      id: "rejected",
      title: "Rejected",
      status: "rejected",
      count: 3,
      totalAmount: 15600,
      invoices: [
        {
          id: "11",
          invoiceNumber: "INV-2024-022",
          supplierName: "Travel Agency",
          amount: 8500,
          daysInStage: 2,
          currentApprover: "Finance Manager",
          receivedDate: "2023-12-30",
          priority: "low",
          category: "Travel",
          status: "rejected",
        },
      ],
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 border-red-300 text-red-800"
      case "medium":
        return "bg-yellow-100 border-yellow-300 text-yellow-800"
      case "low":
        return "bg-green-100 border-green-300 text-green-800"
      default:
        return "bg-gray-100 border-gray-300 text-gray-800"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-3 w-3" />
      case "medium":
        return <Clock className="h-3 w-3" />
      case "low":
        return <CheckCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "received":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "review":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
        return "bg-blue-50 border-blue-200"
      case "review":
        return "bg-yellow-50 border-yellow-200"
      case "pending":
        return "bg-orange-50 border-orange-200"
      case "approved":
        return "bg-green-50 border-green-200"
      case "rejected":
        return "bg-red-50 border-red-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const avgApprovalTime = 4.2 // Mock calculation
  const invoicesStuckOver7Days = approvalColumns
    .flatMap((col) => col.invoices)
    .filter((invoice) => invoice.daysInStage > 7).length

  const handleInvoiceAction = (invoiceId: string, action: string) => {}

  const InvoiceCard = ({ invoice }: { invoice: InvoiceCard }) => (
    <div className="border-border mb-3 rounded-lg border bg-white p-3 transition-shadow hover:shadow-md">
      <div className="mb-2 flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm font-semibold">{invoice.invoiceNumber}</div>
          <div className="text-muted-foreground text-xs">
            {invoice.supplierName}
          </div>
        </div>
        <Badge className={`text-xs ${getPriorityColor(invoice.priority)}`}>
          {getPriorityIcon(invoice.priority)}
          <span className="ml-1 capitalize">{invoice.priority}</span>
        </Badge>
      </div>

      <div className="mb-2 text-lg font-bold">
        {formatCurrency(invoice.amount)}
      </div>

      <div className="text-muted-foreground space-y-1 text-xs">
        <div className="flex items-center space-x-1">
          <User className="h-3 w-3" />
          <span>{invoice.currentApprover}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Calendar className="h-3 w-3" />
          <span>{invoice.daysInStage} days in stage</span>
        </div>
        <div className="flex items-center space-x-1">
          <FileText className="h-3 w-3" />
          <span>{invoice.category}</span>
        </div>
      </div>

      {invoice.status !== "approved" && invoice.status !== "rejected" && (
        <div className="border-border mt-3 border-t pt-2">
          <div className="flex space-x-1">
            {invoice.status === "pending" && (
              <>
                <Button
                  size="sm"
                  variant="default"
                  className="flex-1 text-xs"
                  onClick={() => handleInvoiceAction(invoice.id, "approve")}
                >
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1 text-xs"
                  onClick={() => handleInvoiceAction(invoice.id, "reject")}
                >
                  <XCircle className="mr-1 h-3 w-3" />
                  Reject
                </Button>
              </>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-xs">
                  <MessageSquare className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Invoice Details - {invoice.invoiceNumber}
                  </DialogTitle>
                  <DialogDescription>
                    Review invoice details and take action
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-muted/50 grid grid-cols-2 gap-4 rounded-lg p-4">
                    <div>
                      <div className="text-muted-foreground text-sm">
                        Amount
                      </div>
                      <div className="font-semibold">
                        {formatCurrency(invoice.amount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-sm">
                        Supplier
                      </div>
                      <div className="font-semibold">
                        {invoice.supplierName}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-sm">
                        Received Date
                      </div>
                      <div className="font-semibold">
                        {formatDate(invoice.receivedDate)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-sm">
                        Days in Process
                      </div>
                      <div className="font-semibold">
                        {invoice.daysInStage} days
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Comments</label>
                    <Textarea
                      placeholder="Add comments or notes..."
                      className="mt-1"
                    />
                  </div>

                  <div className="flex space-x-2">
                    {invoice.status === "pending" && (
                      <>
                        <Button className="flex-1">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button variant="destructive" className="flex-1">
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </>
                    )}
                    <Button variant="outline" className="flex-1">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Request Information
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Invoice Approval Pipeline</span>
          <div className="flex space-x-2 text-sm">
            <Badge variant="outline">
              Avg. Approval Time: {avgApprovalTime} Days
            </Badge>
            <Badge variant="destructive">
              Stuck &gt;7 Days: {invoicesStuckOver7Days}
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>
          Real-time visibility into invoice approval workflow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {approvalColumns.map((column) => (
            <div key={column.id} className="w-80 flex-shrink-0">
              <div
                className={`rounded-lg border-2 ${getStatusColor(column.status)} p-4`}
              >
                {/* Column Header */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(column.status)}
                    <h3 className="font-semibold">{column.title}</h3>
                  </div>
                  <Badge variant="secondary">{column.count}</Badge>
                </div>

                {/* Column Summary */}
                <div className="text-muted-foreground mb-4 text-sm">
                  Total: {formatCurrency(column.totalAmount)}
                </div>

                {/* Invoice Cards */}
                <div className="max-h-96 space-y-3 overflow-y-auto">
                  {column.invoices.map((invoice) => (
                    <InvoiceCard key={invoice.id} invoice={invoice} />
                  ))}

                  {/* Show more indicator if there are more invoices */}
                  {column.count > column.invoices.length && (
                    <div className="text-muted-foreground py-2 text-center text-sm">
                      +{column.count - column.invoices.length} more invoices
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-4 border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-5">
            {approvalColumns.map((column) => (
              <div key={column.id} className="text-center">
                <div className="font-semibold">{column.count}</div>
                <div className="text-muted-foreground text-xs capitalize">
                  {column.title}
                </div>
                <div className="text-muted-foreground text-xs">
                  {formatCurrency(column.totalAmount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
