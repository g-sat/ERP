"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ILoanRequest } from "@/interfaces/loan"
import { LoanRequestFormData } from "@/schemas/loan"
import {
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Plus,
  TrendingUp,
} from "lucide-react"
import { toast } from "sonner"

import { HrLoan } from "@/lib/api-routes"
import { useGet } from "@/hooks/use-common"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CurrencyFormatter } from "@/components/currencyicons/currency-formatter"

import { columns as activeLoansColumns } from "./components/active-loans-table"
import { columns as historyRequestsColumns } from "./components/history-requests-table"
import { LoanRequestForm } from "./components/loan-request-form"
import { columns as loanRequestsColumns } from "./components/loan-requests-table"
import { LoanTable } from "./components/loan-table"

export default function LoanPage() {
  const params = useParams()
  const companyId = params.companyId as string
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("active-loans")

  // Extract data with fallbacks - handle API response structure
  const extractLoanRequests = (data: any): ILoanRequest[] => {
    if (!data) return []
    if (Array.isArray(data)) {
      if (data.length > 0 && Array.isArray(data[0])) {
        return data[0] as ILoanRequest[]
      }
      return data as ILoanRequest[]
    }
    return []
  }

  // Data hooks
  const { data: activeLoansData } = useGet<ILoanRequest[]>(
    `${HrLoan.getActive}`,
    "active-loans"
  )

  const activeLoans = extractLoanRequests(activeLoansData?.data || [])
  const { data: historyLoansData } = useGet<ILoanRequest[]>(
    `${HrLoan.getHistory}`,
    "history-loans"
  )
  const historyLoans = extractLoanRequests(historyLoansData?.data || [])
  const { data: pendingLoansData } = useGet<ILoanRequest[]>(
    `${HrLoan.getPending}`,
    "pending-loans"
  )
  const pendingLoans = extractLoanRequests(pendingLoansData?.data || [])

  // Calculate pending requests count
  const pendingRequestsCount = pendingLoans.filter(
    (loan) => loan.statusName === "Pending"
  ).length

  const { data: dashboardData } = useGet<{
    activeLoans: number
    monthlyRepayments: number
    monthlySkipInstallment: number
    totalLoanAmount: number
    outstanding: number
    closeLoan: number
  }>(`${HrLoan.getLoanDashboard}`, "loan-dashboard")

  const dashboardStats =
    dashboardData?.data && !Array.isArray(dashboardData.data)
      ? dashboardData.data
      : Array.isArray(dashboardData?.data) &&
          dashboardData.data[0] &&
          !Array.isArray(dashboardData.data[0])
        ? dashboardData.data[0]
        : {
            activeLoans: 0,
            monthlyRepayments: 0,
            monthlySkipInstallment: 0,
            totalLoanAmount: 0,
            outstanding: 0,
            closeLoan: 0,
          }

  // Dialog states
  const [showLoanRequestForm, setShowLoanRequestForm] = useState(false)

  const handleAddNewLoan = () => {
    setShowLoanRequestForm(true)
  }

  const handleViewLoanDetails = (loanId: number) => {
    router.push(`/${companyId}/hr/loan/${loanId}`)
  }

  return (
    <div className="container mx-auto space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Loan Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage employee loans, requests, and repayments
          </p>
        </div>
        <Button onClick={handleAddNewLoan} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Add New Loan</span>
          <span className="sm:hidden">Add Loan</span>
        </Button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <CreditCard className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">
              {dashboardStats.activeLoans}
            </div>
            <p className="text-muted-foreground text-xs">
              Currently active loans
            </p>
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
            <div className="text-xl font-bold sm:text-2xl">
              <CurrencyFormatter
                amount={dashboardStats.monthlyRepayments}
                size="lg"
              />
            </div>
            <p className="text-muted-foreground text-xs">
              This month&apos;s repayments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Skip Installments
            </CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">
              {dashboardStats.monthlySkipInstallment}
            </div>
            <p className="text-muted-foreground text-xs">Paused this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Loan Amount
            </CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">
              <CurrencyFormatter
                amount={dashboardStats.totalLoanAmount}
                size="lg"
              />
            </div>
            <p className="text-muted-foreground text-xs">
              Total disbursed amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">
              <CurrencyFormatter
                amount={dashboardStats.outstanding}
                size="lg"
              />
            </div>
            <p className="text-muted-foreground text-xs">
              Remaining to be paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed Loans</CardTitle>
            <CheckCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">
              {dashboardStats.closeLoan}
            </div>
            <p className="text-muted-foreground text-xs">
              Completed this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3 gap-2">
          <TabsTrigger value="active-loans" className="text-xs sm:text-sm">
            Active Loans
          </TabsTrigger>
          <TabsTrigger
            value="loan-requests"
            className="relative text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">New Loan Requests</span>
            <span className="sm:hidden">Requests</span>
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 animate-bounce items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {pendingRequestsCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history-requests" className="text-xs sm:text-sm">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active-loans" className="space-y-4">
          <LoanTable
            columns={activeLoansColumns}
            data={activeLoans.filter((loan) => loan.statusName === "Approved")}
            onRowClick={(loan) => handleViewLoanDetails(loan.loanRequestId)}
          />
        </TabsContent>

        <TabsContent value="loan-requests" className="space-y-4">
          <LoanTable
            columns={loanRequestsColumns}
            data={pendingLoans.filter((loan) => loan.statusName === "Pending")}
            //onRowClick={(loan) => handleViewLoanDetails(loan.loanRequestId)}
          />
        </TabsContent>

        <TabsContent value="history-requests" className="space-y-4">
          <LoanTable
            columns={historyRequestsColumns}
            data={historyLoans}
            //onRowClick={(loan) => handleViewLoanDetails(loan.loanRequestId)}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <LoanRequestForm
        open={showLoanRequestForm}
        onOpenChange={setShowLoanRequestForm}
        onSubmit={async (data: LoanRequestFormData) => {
          console.log(data)
          setShowLoanRequestForm(false)
          toast.success("Loan request submitted successfully")
        }}
      />
    </div>
  )
}
