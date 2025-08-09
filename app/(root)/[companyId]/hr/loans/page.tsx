"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ILoanRequest, ILoanType } from "@/interfaces/loans"
import {
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Plus,
  TrendingUp,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CurrencyFormatter } from "@/components/currencyicons/currency-formatter"

import { columns as activeLoansColumns } from "./components/active-loans-table"
import { columns as historyRequestsColumns } from "./components/history-requests-table"
import { LoanApprovalForm } from "./components/loan-approval-form"
import { LoanDisbursementForm } from "./components/loan-disbursement-form"
import { LoanRepaymentForm } from "./components/loan-repayment-form"
import { LoanRepaymentTable } from "./components/loan-repayment-table"
import { LoanRequestForm } from "./components/loan-request-form"
import { columns as loanRequestsColumns } from "./components/loan-requests-table"
import { LoanSkipRequestForm } from "./components/loan-skip-request-form"
import { LoanTable } from "./components/loan-table"

// Dummy data for demonstration
const dummyLoanRequests: ILoanRequest[] = [
  {
    loanRequestId: 1,
    employeeId: 1,
    loanTypeId: 1,
    requestedAmount: 5000,
    requestDate: "2024-01-15",
    emiStartDate: "2024-02-01",
    desiredEMIAmount: 500,
    calculatedTermMonths: 12,
    currentStatus: "Pending",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    loanRequestId: 2,
    employeeId: 2,
    loanTypeId: 2,
    requestedAmount: 8000,
    requestDate: "2024-01-20",
    emiStartDate: "2024-02-15",
    desiredEMIAmount: 800,
    calculatedTermMonths: 12,
    currentStatus: "Approved",
    createdAt: "2024-01-20T14:30:00Z",
  },
]

const dummyLoanTypes: ILoanType[] = [
  {
    loanTypeId: 1,
    loanTypeCode: "PERS",
    loanTypeName: "Personal Loans",
    interestRatePct: 8.5,
    maxTermMonths: 60,
    minTermMonths: 6,
    createById: 1,
    createDate: "2024-01-01T00:00:00Z",
  },
  {
    loanTypeId: 2,
    loanTypeCode: "HOME",
    loanTypeName: "Home Improvement Loan",
    interestRatePct: 7.5,
    maxTermMonths: 120,
    minTermMonths: 12,
    createById: 1,
    createDate: "2024-01-01T00:00:00Z",
  },
  {
    loanTypeId: 3,
    loanTypeCode: "CAR",
    loanTypeName: "Car Loan",
    interestRatePct: 9.0,
    maxTermMonths: 84,
    minTermMonths: 12,
    createById: 1,
    createDate: "2024-01-01T00:00:00Z",
  },
]

export default function LoansPage() {
  const params = useParams()
  const companyId = params.companyId as string
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("active-loans")

  // Data state
  const [loanRequests, setLoanRequests] =
    useState<ILoanRequest[]>(dummyLoanRequests)
  const [loanTypes] = useState<ILoanType[]>(dummyLoanTypes)

  // Dialog states
  const [showLoanRequestForm, setShowLoanRequestForm] = useState(false)
  const [showLoanApprovalForm, setShowLoanApprovalForm] = useState(false)
  const [showLoanDisbursementForm, setShowLoanDisbursementForm] =
    useState(false)
  const [showLoanRepaymentForm, setShowLoanRepaymentForm] = useState(false)
  const [showLoanSkipRequestForm, setShowLoanSkipRequestForm] = useState(false)
  const [showLoanRepaymentTable, setShowLoanRepaymentTable] = useState(false)

  // Selected items
  const [selectedLoanRequest, setSelectedLoanRequest] =
    useState<ILoanRequest | null>(null)
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null)

  // Dashboard statistics
  const dashboardStats = {
    activeLoans: 12,
    monthlyRepayments: 45000,
    monthlySkipInstallment: 3,
    totalLoanAmount: 250000,
    outstanding: 180000,
    closeLoan: 2,
  }

  const handleAddNewLoan = () => {
    setShowLoanRequestForm(true)
  }

  const handleLoanRequestSubmit = async (data: any) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newRequest: ILoanRequest = {
        loanRequestId: loanRequests.length + 1,
        employeeId: data.employeeId,
        loanTypeId: data.loanTypeId,
        requestedAmount: data.requestedAmount,
        requestDate: new Date().toISOString().split("T")[0],
        emiStartDate: data.emiStartDate,
        desiredEMIAmount: data.desiredEMIAmount,
        calculatedTermMonths: data.calculatedTermMonths,
        currentStatus: "Pending",
        createdAt: new Date().toISOString(),
      }

      setLoanRequests((prev) => [newRequest, ...prev])
      setShowLoanRequestForm(false)
      toast.success("Loan request submitted successfully")
    } catch (error) {
      toast.error("Failed to submit loan request")
    }
  }

  const handleViewLoanDetails = (loanId: number) => {
    router.push(`/${companyId}/hr/loans/${loanId}`)
  }

  const handleRecordRepayment = (loanId: number) => {
    setSelectedLoanId(loanId)
    setShowLoanRepaymentForm(true)
  }

  const handlePauseInstallment = (loanId: number) => {
    setSelectedLoanId(loanId)
    setShowLoanSkipRequestForm(true)
  }

  return (
    <div className="@container flex-1 space-y-4 p-4 pt-6 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loan Management</h1>
          <p className="text-muted-foreground">
            Manage employee loans, requests, and repayments
          </p>
        </div>
        <Button onClick={handleAddNewLoan}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Loan
        </Button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <CreditCard className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
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
            <div className="text-2xl font-bold">
              <CurrencyFormatter
                amount={dashboardStats.monthlyRepayments}
                size="lg"
              />
            </div>
            <p className="text-muted-foreground text-xs">
              This month's repayments
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
            <div className="text-2xl font-bold">
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
            <div className="text-2xl font-bold">
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
            <div className="text-2xl font-bold">
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
            <div className="text-2xl font-bold">{dashboardStats.closeLoan}</div>
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
        <TabsList>
          <TabsTrigger value="active-loans">Active Loans</TabsTrigger>
          <TabsTrigger value="loan-requests">Loan Requests</TabsTrigger>
          <TabsTrigger value="history-requests">History Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="active-loans" className="space-y-4">
          <LoanTable
            columns={activeLoansColumns}
            data={loanRequests.filter(
              (loan) => loan.currentStatus === "Approved"
            )}
            onRowClick={(loan) => handleViewLoanDetails(loan.loanRequestId)}
          />
        </TabsContent>

        <TabsContent value="loan-requests" className="space-y-4">
          <LoanTable
            columns={loanRequestsColumns}
            data={loanRequests.filter(
              (loan) => loan.currentStatus === "Pending"
            )}
            onRowClick={(loan) => handleViewLoanDetails(loan.loanRequestId)}
          />
        </TabsContent>

        <TabsContent value="history-requests" className="space-y-4">
          <LoanTable
            columns={historyRequestsColumns}
            data={loanRequests.filter((loan) =>
              ["Cancelled", "Rejected"].includes(loan.currentStatus)
            )}
            onRowClick={(loan) => handleViewLoanDetails(loan.loanRequestId)}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <LoanRequestForm
        open={showLoanRequestForm}
        onOpenChange={setShowLoanRequestForm}
        onSubmit={handleLoanRequestSubmit}
        loanTypes={loanTypes}
      />

      <LoanApprovalForm
        open={showLoanApprovalForm}
        onOpenChange={setShowLoanApprovalForm}
        loanRequest={selectedLoanRequest}
        onSubmit={async (data: any) => {
          // Handle approval submission
          setShowLoanApprovalForm(false)
          toast.success("Loan approved successfully")
        }}
      />

      <LoanDisbursementForm
        open={showLoanDisbursementForm}
        onOpenChange={setShowLoanDisbursementForm}
        loanRequest={selectedLoanRequest}
        onSubmit={async (data: any) => {
          // Handle disbursement submission
          setShowLoanDisbursementForm(false)
          toast.success("Loan disbursed successfully")
        }}
      />

      <LoanRepaymentForm
        open={showLoanRepaymentForm}
        onOpenChange={setShowLoanRepaymentForm}
        loanId={selectedLoanId}
        onSubmit={async (data: any) => {
          // Handle repayment submission
          setShowLoanRepaymentForm(false)
          toast.success("Repayment recorded successfully")
        }}
      />

      <LoanSkipRequestForm
        open={showLoanSkipRequestForm}
        onOpenChange={setShowLoanSkipRequestForm}
        loanId={selectedLoanId}
        onSubmit={async (data: any) => {
          // Handle skip request submission
          setShowLoanSkipRequestForm(false)
          toast.success("Skip request submitted successfully")
        }}
      />

      <LoanRepaymentTable
        open={showLoanRepaymentTable}
        onOpenChange={setShowLoanRepaymentTable}
        loanId={selectedLoanId}
      />
    </div>
  )
}
