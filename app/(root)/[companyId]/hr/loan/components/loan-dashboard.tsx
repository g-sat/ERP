"use client"

import { ILoanDashboard } from "@/interfaces/loan"
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CurrencyFormatter } from "@/components/currencyicons/currency-formatter"

interface LoanDashboardProps {
  dashboard: ILoanDashboard
  userRole: "employee" | "approver"
}

export function LoanDashboard({ dashboard, userRole }: LoanDashboardProps) {
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
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
      case "Active":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "Rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "Pending":
      case "Submitted":
      case "Under Review":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.totalLoans}</div>
            <p className="text-muted-foreground text-xs">
              {dashboard.activeLoans} active loans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyFormatter amount={dashboard.totalLoanAmount} size="lg" />
            </div>
            <p className="text-muted-foreground text-xs">
              <CurrencyFormatter
                amount={dashboard.totalOutstandingAmount}
                size="sm"
              />{" "}
              outstanding
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Applications
            </CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard.pendingApplications}
            </div>
            <p className="text-muted-foreground text-xs">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Repayments
            </CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyFormatter
                amount={dashboard.monthlyRepayments}
                size="lg"
              />
            </div>
            <p className="text-muted-foreground text-xs">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Applications
            </CardTitle>
            <CardDescription>
              Latest loan applications and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.recentApplications.map((application) => (
                <div
                  key={application.applicationId}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(application.status)}
                    <div>
                      <p className="text-sm font-medium">
                        {application.employeeName}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {application.loanType} •{" "}
                        <CurrencyFormatter
                          amount={application.requestedAmount}
                          size="sm"
                          showIcon={false}
                        />
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={getStatusBadgeVariant(application.status)}>
                      {application.status}
                    </Badge>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {application.applicationDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Repayments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Recent Repayments
            </CardTitle>
            <CardDescription>
              Latest loan repayments and payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.recentRepayments.map((repayment) => (
                <div
                  key={repayment.repaymentId}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">
                        {repayment.employeeName}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {repayment.loanType} • {repayment.paymentMethod}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      <CurrencyFormatter
                        amount={repayment.paymentAmount}
                        size="sm"
                      />
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {repayment.paymentDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {dashboard.overdueLoans > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Overdue Loans Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              There are {dashboard.overdueLoans} overdue loans that require
              immediate attention.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Role-specific Information */}
      {userRole === "approver" && (
        <Card>
          <CardHeader>
            <CardTitle>Approver Actions</CardTitle>
            <CardDescription>
              Quick actions for loan approval workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-3">
              <div className="rounded-lg border p-3 text-center">
                <p className="font-medium">Pending Reviews</p>
                <p className="text-2xl font-bold text-blue-600">
                  {
                    dashboard.recentApplications.filter(
                      (app) =>
                        app.status === "Submitted" ||
                        app.status === "Under Review"
                    ).length
                  }
                </p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="font-medium">Approved This Month</p>
                <p className="text-2xl font-bold text-green-600">
                  {
                    dashboard.recentApplications.filter(
                      (app) =>
                        app.status === "Approved" &&
                        app.approvedDate &&
                        app.approvedDate.getMonth() === new Date().getMonth()
                    ).length
                  }
                </p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="font-medium">Rejected This Month</p>
                <p className="text-2xl font-bold text-red-600">
                  {
                    dashboard.recentApplications.filter(
                      (app) =>
                        app.status === "Rejected" &&
                        app.approvedDate &&
                        app.approvedDate.getMonth() === new Date().getMonth()
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {userRole === "employee" && (
        <Card>
          <CardHeader>
            <CardTitle>My Loan Summary</CardTitle>
            <CardDescription>
              Overview of your loan applications and active loans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-3">
              <div className="rounded-lg border p-3 text-center">
                <p className="font-medium">My Applications</p>
                <p className="text-2xl font-bold text-blue-600">
                  {dashboard.recentApplications.length}
                </p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="font-medium">Active Loans</p>
                <p className="text-2xl font-bold text-green-600">
                  {dashboard.activeLoans}
                </p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="font-medium">Monthly Payment</p>
                <p className="text-2xl font-bold text-orange-600">
                  <CurrencyFormatter
                    amount={dashboard.monthlyRepayments}
                    size="lg"
                  />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
