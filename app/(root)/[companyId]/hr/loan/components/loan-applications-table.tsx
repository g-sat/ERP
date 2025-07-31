"use client"

import { useState } from "react"
import { ILoanApplication } from "@/interfaces/loan"
import {
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Eye,
  FileText,
  Plus,
  Search,
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
import { Input } from "@/components/ui/input"
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
import { CurrencyFormatter } from "@/components/currencyicons/currency-formatter"

interface LoanApplicationsTableProps {
  applications: ILoanApplication[]
  userRole: "employee" | "approver"
  onViewApplication: (application: ILoanApplication) => void
  onEditApplication: (application: ILoanApplication) => void
  onApproveApplication: (application: ILoanApplication) => void
  onRejectApplication: (application: ILoanApplication) => void
  onCreateApplication: () => void
}

export function LoanApplicationsTable({
  applications,
  userRole,
  onViewApplication,
  onEditApplication,
  onApproveApplication,
  onRejectApplication,
  onCreateApplication,
}: LoanApplicationsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loanTypeFilter, setLoanTypeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("applicationDate")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Approved":
        return "default"
      case "Active":
        return "secondary"
      case "Pending":
      case "Submitted":
      case "Under Review":
        return "outline"
      case "Rejected":
        return "destructive"
      case "Draft":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "Rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "Pending":
      case "Submitted":
      case "Under Review":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "Draft":
        return <FileText className="h-4 w-4 text-gray-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const canEdit = (application: ILoanApplication) => {
    if (userRole === "employee") {
      return (
        application.status === "Draft" || application.status === "Submitted"
      )
    }
    return false
  }

  const canApprove = (application: ILoanApplication) => {
    if (userRole === "approver") {
      return (
        application.status === "Submitted" ||
        application.status === "Under Review"
      )
    }
    return false
  }

  const canReject = (application: ILoanApplication) => {
    if (userRole === "approver") {
      return (
        application.status === "Submitted" ||
        application.status === "Under Review"
      )
    }
    return false
  }

  // Filter and sort applications
  const filteredApplications = applications
    .filter((application) => {
      const matchesSearch =
        application.employeeName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        application.employeeCode
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        application.loanType.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === "all" || application.status === statusFilter
      const matchesType =
        loanTypeFilter === "all" || application.loanType === loanTypeFilter

      return matchesSearch && matchesStatus && matchesType
    })
    .sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case "applicationDate":
          aValue = a.applicationDate
          bValue = b.applicationDate
          break
        case "requestedAmount":
          aValue = a.requestedAmount
          bValue = b.requestedAmount
          break
        case "employeeName":
          aValue = a.employeeName
          bValue = b.employeeName
          break
        case "status":
          aValue = a.status
          bValue = b.status
          break
        default:
          aValue = a.applicationDate
          bValue = b.applicationDate
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "Draft", label: "Draft" },
    { value: "Submitted", label: "Submitted" },
    { value: "Under Review", label: "Under Review" },
    { value: "Approved", label: "Approved" },
    { value: "Rejected", label: "Rejected" },
  ]

  const loanTypeOptions = [
    { value: "all", label: "All Types" },
    { value: "Personal", label: "Personal" },
    { value: "Housing", label: "Housing" },
    { value: "Vehicle", label: "Vehicle" },
    { value: "Education", label: "Education" },
    { value: "Emergency", label: "Emergency" },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Loan Applications
            </CardTitle>
            <CardDescription>
              {userRole === "employee"
                ? "View and manage your loan applications"
                : "Review and approve loan applications"}
            </CardDescription>
          </div>
          {userRole === "employee" && (
            <Button
              onClick={onCreateApplication}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Application
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="Search by employee name, code, or loan type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={loanTypeFilter} onValueChange={setLoanTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {loanTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleSort("employeeName")}
                >
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Employee
                  </div>
                </TableHead>
                <TableHead>Loan Type</TableHead>
                <TableHead
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleSort("requestedAmount")}
                >
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Amount
                  </div>
                </TableHead>
                <TableHead>Period</TableHead>
                <TableHead
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleSort("applicationDate")}
                >
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Application Date
                  </div>
                </TableHead>
                <TableHead
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  Status
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-muted-foreground py-8 text-center"
                  >
                    No loan applications found
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((application) => (
                  <TableRow key={application.applicationId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {application.employeeName}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {application.employeeCode} •{" "}
                          {application.departmentName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{application.loanType}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      <CurrencyFormatter
                        amount={application.requestedAmount}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell>{application.repaymentPeriod} months</TableCell>
                    <TableCell>
                      {application.applicationDate.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(application.status)}
                      >
                        {getStatusIcon(application.status)}
                        <span className="ml-1">{application.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewApplication(application)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>
                                Loan Application Details
                              </DialogTitle>
                              <DialogDescription>
                                Detailed view of the loan application
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-muted-foreground text-sm font-medium">
                                    Employee
                                  </label>
                                  <p className="font-medium">
                                    {application.employeeName}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-muted-foreground text-sm font-medium">
                                    Employee Code
                                  </label>
                                  <p className="font-medium">
                                    {application.employeeCode}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-muted-foreground text-sm font-medium">
                                    Department
                                  </label>
                                  <p className="font-medium">
                                    {application.departmentName}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-muted-foreground text-sm font-medium">
                                    Designation
                                  </label>
                                  <p className="font-medium">
                                    {application.designationName}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-muted-foreground text-sm font-medium">
                                    Loan Type
                                  </label>
                                  <p className="font-medium">
                                    {application.loanType}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-muted-foreground text-sm font-medium">
                                    Requested Amount
                                  </label>
                                  <p className="font-medium">
                                    <CurrencyFormatter
                                      amount={application.requestedAmount}
                                      size="sm"
                                    />
                                  </p>
                                </div>
                                <div>
                                  <label className="text-muted-foreground text-sm font-medium">
                                    Repayment Period
                                  </label>
                                  <p className="font-medium">
                                    {application.repaymentPeriod} months
                                  </p>
                                </div>
                                <div>
                                  <label className="text-muted-foreground text-sm font-medium">
                                    Monthly Income
                                  </label>
                                  <p className="font-medium">
                                    <CurrencyFormatter
                                      amount={application.monthlyIncome}
                                      size="sm"
                                    />
                                  </p>
                                </div>
                                <div>
                                  <label className="text-muted-foreground text-sm font-medium">
                                    Existing Loans
                                  </label>
                                  <p className="font-medium">
                                    <CurrencyFormatter
                                      amount={application.existingLoans}
                                      size="sm"
                                    />
                                  </p>
                                </div>
                                <div>
                                  <label className="text-muted-foreground text-sm font-medium">
                                    Application Date
                                  </label>
                                  <p className="font-medium">
                                    {application.applicationDate.toLocaleDateString()}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-muted-foreground text-sm font-medium">
                                    Status
                                  </label>
                                  <Badge
                                    variant={getStatusBadgeVariant(
                                      application.status
                                    )}
                                  >
                                    {application.status}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <label className="text-muted-foreground text-sm font-medium">
                                  Purpose
                                </label>
                                <p className="mt-1 text-sm">
                                  {application.purpose}
                                </p>
                              </div>
                              {application.remarks && (
                                <div>
                                  <label className="text-muted-foreground text-sm font-medium">
                                    Remarks
                                  </label>
                                  <p className="mt-1 text-sm">
                                    {application.remarks}
                                  </p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        {canEdit(application) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditApplication(application)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}

                        {canApprove(application) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onApproveApplication(application)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}

                        {canReject(application) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRejectApplication(application)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="text-muted-foreground mt-4 flex items-center justify-between text-sm">
          <div>
            Showing {filteredApplications.length} of {applications.length}{" "}
            applications
          </div>
          <div>
            {userRole === "approver" && (
              <span>
                {
                  applications.filter(
                    (app) =>
                      app.status === "Submitted" ||
                      app.status === "Under Review"
                  ).length
                }{" "}
                pending review
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
