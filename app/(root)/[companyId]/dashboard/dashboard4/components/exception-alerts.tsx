"use client"

import { useState } from "react"
import {
  AlertTriangleIcon,
  ClockIcon,
  EyeIcon,
  XCircleIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ExceptionAlertsProps {
  period: string
  businessUnits: string[]
  productLines: string[]
  geography: string[]
}

interface AlertData {
  id: string
  type: string
  category:
    | "Control Failures"
    | "Transaction Anomalies"
    | "Vendor/Customer Risks"
    | "Process Exceptions"
  priority: "Critical" | "Warning" | "Informational"
  title: string
  description: string
  detectedDate: string
  assignedTo?: string
  status: "Open" | "Investigating" | "Resolved" | "Dismissed"
  impact: string
  confidence: number
  relatedTransactions?: string[]
  relatedDocuments?: string[]
}

export function ExceptionAlerts({
  period: _period,
  businessUnits: _businessUnits,
  productLines: _productLines,
  geography: _geography,
}: ExceptionAlertsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null)

  // Mock data - in real implementation, this would come from API
  const alertData: AlertData[] = [
    {
      id: "1",
      type: "Duplicate Payment Risk",
      category: "Control Failures",
      priority: "Critical",
      title: "Potential Duplicate Invoice Payment",
      description:
        "Invoice #INV-2024-001 for $125,000 from Premium Materials Ltd appears to match a previous payment within 7 days.",
      detectedDate: "2024-01-15T10:30:00Z",
      assignedTo: "Finance Team",
      status: "Investigating",
      impact: "High - Potential $125,000 duplicate payment",
      confidence: 95,
      relatedTransactions: ["PAY-2024-045", "INV-2024-001"],
      relatedDocuments: [
        "invoice_inv_2024_001.pdf",
        "payment_pay_2024_045.pdf",
      ],
    },
    {
      id: "2",
      type: "Unusual Journal Entry",
      category: "Transaction Anomalies",
      priority: "Warning",
      title: "Large Journal Entry Detected",
      description:
        "Journal entry JE-2024-156 for $2,500,000 posted outside normal business hours (2:30 AM) with Z-score of 4.2.",
      detectedDate: "2024-01-14T02:30:00Z",
      assignedTo: "Accounting Team",
      status: "Open",
      impact: "Medium - Requires verification of authorization",
      confidence: 78,
      relatedTransactions: ["JE-2024-156"],
      relatedDocuments: ["journal_entry_je_2024_156.pdf"],
    },
    {
      id: "3",
      type: "New High-Risk Vendor",
      category: "Vendor/Customer Risks",
      priority: "Warning",
      title: "New Vendor with High Risk Score",
      description:
        "New vendor 'Quick Solutions Inc' added with risk score of 8.2/10. No prior business history found.",
      detectedDate: "2024-01-13T14:20:00Z",
      assignedTo: "Procurement Team",
      status: "Investigating",
      impact: "Medium - Requires additional due diligence",
      confidence: 82,
      relatedTransactions: ["PO-2024-089"],
      relatedDocuments: ["vendor_application_quick_solutions.pdf"],
    },
    {
      id: "4",
      type: "Payment Pattern Change",
      category: "Vendor/Customer Risks",
      priority: "Informational",
      title: "Customer Payment Pattern Deviation",
      description:
        "Acme Corporation payment pattern changed from 30-day average to 45-day average over last 3 invoices.",
      detectedDate: "2024-01-12T09:15:00Z",
      assignedTo: "AR Team",
      status: "Open",
      impact: "Low - Monitor for trend continuation",
      confidence: 65,
      relatedTransactions: ["INV-2024-023", "INV-2024-024", "INV-2024-025"],
      relatedDocuments: [],
    },
    {
      id: "5",
      type: "PO Without Competitive Bid",
      category: "Process Exceptions",
      priority: "Warning",
      title: "High-Value PO Without Competitive Bidding",
      description:
        "Purchase Order PO-2024-092 for $850,000 awarded without competitive bidding process. Exceeds threshold of $500,000.",
      detectedDate: "2024-01-11T16:45:00Z",
      assignedTo: "Procurement Team",
      status: "Investigating",
      impact: "Medium - Compliance review required",
      confidence: 88,
      relatedTransactions: ["PO-2024-092"],
      relatedDocuments: ["po_2024_092.pdf", "justification_memo.pdf"],
    },
    {
      id: "6",
      type: "Contract Expiration Alert",
      category: "Process Exceptions",
      priority: "Informational",
      title: "Critical Contract Expiring Soon",
      description:
        "Master Service Agreement with Global Logistics Inc expires in 45 days. Auto-renewal clause requires 60-day notice.",
      detectedDate: "2024-01-10T11:30:00Z",
      assignedTo: "Legal Team",
      status: "Open",
      impact: "High - Service disruption risk",
      confidence: 100,
      relatedTransactions: [],
      relatedDocuments: ["msa_global_logistics_2022.pdf"],
    },
    {
      id: "7",
      type: "Segregation of Duties Violation",
      category: "Control Failures",
      priority: "Critical",
      title: "SoD Violation in Invoice Processing",
      description:
        "Same user (john.doe@company.com) created and approved invoice INV-2024-031. Violates segregation of duties policy.",
      detectedDate: "2024-01-09T13:20:00Z",
      assignedTo: "Internal Audit",
      status: "Resolved",
      impact: "High - Control weakness identified",
      confidence: 100,
      relatedTransactions: ["INV-2024-031"],
      relatedDocuments: ["sod_violation_report.pdf"],
    },
    {
      id: "8",
      type: "Unusual Invoice Amount",
      category: "Transaction Anomalies",
      priority: "Warning",
      title: "Invoice Amount Outside Normal Range",
      description:
        "Invoice INV-2024-032 for $15,000 is 300% higher than vendor's typical invoice amounts ($5,000 average).",
      detectedDate: "2024-01-08T08:15:00Z",
      assignedTo: "AP Team",
      status: "Dismissed",
      impact: "Low - Verified as legitimate service expansion",
      confidence: 72,
      relatedTransactions: ["INV-2024-032"],
      relatedDocuments: [
        "invoice_inv_2024_032.pdf",
        "service_agreement_amendment.pdf",
      ],
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "Warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Informational":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "Critical":
        return <XCircleIcon className="h-4 w-4 text-red-600" />
      case "Warning":
        return <AlertTriangleIcon className="h-4 w-4 text-yellow-600" />
      case "Informational":
        return <ClockIcon className="h-4 w-4 text-blue-600" />
      default:
        return <ClockIcon className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-red-100 text-red-800"
      case "Investigating":
        return "bg-yellow-100 text-yellow-800"
      case "Resolved":
        return "bg-green-100 text-green-800"
      case "Dismissed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600"
    if (confidence >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const filteredAlerts = alertData.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority =
      filterPriority === "all" || alert.priority === filterPriority
    const matchesCategory =
      filterCategory === "all" || alert.category === filterCategory
    const matchesStatus =
      filterStatus === "all" || alert.status === filterStatus

    return matchesSearch && matchesPriority && matchesCategory && matchesStatus
  })

  const alertStats = {
    total: alertData.length,
    critical: alertData.filter((a) => a.priority === "Critical").length,
    warning: alertData.filter((a) => a.priority === "Warning").length,
    open: alertData.filter((a) => a.status === "Open").length,
    investigating: alertData.filter((a) => a.status === "Investigating").length,
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangleIcon className="h-5 w-5" />
          Exception & Anomaly Alerts
          <Badge variant="outline" className="text-xs">
            Proactive Risk Management
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alert Statistics */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div className="text-center">
            <div className="text-2xl font-bold">{alertStats.total}</div>
            <div className="text-muted-foreground text-xs">Total Alerts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {alertStats.critical}
            </div>
            <div className="text-muted-foreground text-xs">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {alertStats.warning}
            </div>
            <div className="text-muted-foreground text-xs">Warning</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {alertStats.open}
            </div>
            <div className="text-muted-foreground text-xs">Open</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {alertStats.investigating}
            </div>
            <div className="text-muted-foreground text-xs">Investigating</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <Input
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="Warning">Warning</SelectItem>
                <SelectItem value="Informational">Informational</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Control Failures">
                  Control Failures
                </SelectItem>
                <SelectItem value="Transaction Anomalies">
                  Transaction Anomalies
                </SelectItem>
                <SelectItem value="Vendor/Customer Risks">
                  Vendor/Customer Risks
                </SelectItem>
                <SelectItem value="Process Exceptions">
                  Process Exceptions
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Investigating">Investigating</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <Card
              key={alert.id}
              className={`cursor-pointer transition-colors ${
                selectedAlert === alert.id ? "ring-primary ring-2" : ""
              }`}
              onClick={() =>
                setSelectedAlert(selectedAlert === alert.id ? null : alert.id)
              }
            >
              <CardContent className="pt-4">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getPriorityIcon(alert.priority)}
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h5 className="font-medium">{alert.title}</h5>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getPriorityColor(alert.priority)}`}
                        >
                          {alert.priority}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getStatusColor(alert.status)}`}
                        >
                          {alert.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2 text-sm">
                        {alert.description}
                      </p>
                      <div className="text-muted-foreground flex items-center gap-4 text-xs">
                        <span>{alert.category}</span>
                        <span>•</span>
                        <span>
                          {new Date(alert.detectedDate).toLocaleDateString()}
                        </span>
                        {alert.assignedTo && (
                          <>
                            <span>•</span>
                            <span>Assigned: {alert.assignedTo}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-medium ${getConfidenceColor(alert.confidence)}`}
                    >
                      {alert.confidence}% confidence
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {alert.impact}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedAlert === alert.id && (
                  <div className="mt-4 space-y-4 border-t pt-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <h6 className="mb-2 text-sm font-medium">
                          Related Transactions
                        </h6>
                        <div className="space-y-1">
                          {alert.relatedTransactions?.map((transaction) => (
                            <Badge
                              key={transaction}
                              variant="outline"
                              className="mr-1 text-xs"
                            >
                              {transaction}
                            </Badge>
                          )) || (
                            <span className="text-muted-foreground text-sm">
                              None
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <h6 className="mb-2 text-sm font-medium">
                          Related Documents
                        </h6>
                        <div className="space-y-1">
                          {alert.relatedDocuments?.map((document) => (
                            <div
                              key={document}
                              className="cursor-pointer text-xs text-blue-600 hover:underline"
                            >
                              {document}
                            </div>
                          )) || (
                            <span className="text-muted-foreground text-sm">
                              None
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs">
                        <EyeIcon className="mr-1 h-3 w-3" />
                        View Details
                      </Button>
                      {alert.status === "Open" && (
                        <Button size="sm" variant="default" className="text-xs">
                          Start Investigation
                        </Button>
                      )}
                      {alert.status === "Investigating" && (
                        <Button size="sm" variant="default" className="text-xs">
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alert Categories Summary */}
        <Tabs defaultValue="control" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="control">Control Failures</TabsTrigger>
            <TabsTrigger value="anomalies">Transaction Anomalies</TabsTrigger>
            <TabsTrigger value="risks">Vendor/Customer Risks</TabsTrigger>
            <TabsTrigger value="process">Process Exceptions</TabsTrigger>
          </TabsList>

          <TabsContent value="control">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {alertData
                .filter((a) => a.category === "Control Failures")
                .map((alert) => (
                  <Card key={alert.id} className="border-red-200">
                    <CardContent className="pt-4">
                      <div className="mb-2 flex items-center gap-2">
                        <XCircleIcon className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">
                          {alert.title}
                        </span>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {alert.description.substring(0, 100)}...
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="anomalies">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {alertData
                .filter((a) => a.category === "Transaction Anomalies")
                .map((alert) => (
                  <Card key={alert.id} className="border-yellow-200">
                    <CardContent className="pt-4">
                      <div className="mb-2 flex items-center gap-2">
                        <AlertTriangleIcon className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium">
                          {alert.title}
                        </span>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {alert.description.substring(0, 100)}...
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="risks">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {alertData
                .filter((a) => a.category === "Vendor/Customer Risks")
                .map((alert) => (
                  <Card key={alert.id} className="border-orange-200">
                    <CardContent className="pt-4">
                      <div className="mb-2 flex items-center gap-2">
                        <AlertTriangleIcon className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium">
                          {alert.title}
                        </span>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {alert.description.substring(0, 100)}...
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="process">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {alertData
                .filter((a) => a.category === "Process Exceptions")
                .map((alert) => (
                  <Card key={alert.id} className="border-blue-200">
                    <CardContent className="pt-4">
                      <div className="mb-2 flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">
                          {alert.title}
                        </span>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {alert.description.substring(0, 100)}...
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
