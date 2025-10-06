"use client"

import { useState } from "react"
import { LoanRequestSchedule } from "@/interfaces/loan"
import { AlertTriangle, SkipForward } from "lucide-react"
import { toast } from "sonner"

import { HrLoan } from "@/lib/api-routes"
import { useGetById } from "@/hooks/use-common"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CurrencyFormatter } from "@/components/currency-icons/currency-formatter"

import { LoanSkipRequestForm } from "./loan-skip-request-form"

interface LoanDetailsTableProps {
  loanId?: number
}

export default function LoanDetailsTable({
  loanId = 0,
}: LoanDetailsTableProps) {
  const [showSkipRequestForm, setShowSkipRequestForm] = useState(false)

  // Fetch loan data using hooks
  const {
    data: loanDetailData,
    isLoading: loanDetailLoading,
    error: loanDetailError,
  } = useGetById<LoanRequestSchedule>(
    `${HrLoan.getLoanDetails}`,
    "loan-detail",
    loanId.toString()
  )

  // Helper functions to extract data safely
  const extractSingleLoan = (
    data: { result: number; message: string; data: unknown } | undefined
  ): LoanRequestSchedule | undefined => {
    if (!data?.data) return undefined

    // If data is an array, find the loan with matching loanRequestId
    if (Array.isArray(data.data)) {
      if (data.data.length > 0 && Array.isArray(data.data[0])) {
        const loans = data.data[0] as LoanRequestSchedule[]
        return loans.find((loan) => loan.loanRequestId === loanId)
      }
      const loans = data.data as LoanRequestSchedule[]
      return loans.find((loan) => loan.loanRequestId === loanId)
    }

    // If data is a single object
    if (typeof data.data === "object" && data.data !== null) {
      return data.data as LoanRequestSchedule
    }

    return undefined
  }

  const extractAllLoans = (
    data: { result: number; message: string; data: unknown } | undefined
  ): LoanRequestSchedule[] => {
    if (!data?.data) return []

    // Case 1: Nested array (e.g., [ [LoanRequestSchedule, ...] ])
    if (Array.isArray(data.data)) {
      if (data.data.length > 0 && Array.isArray(data.data[0])) {
        return data.data[0] as LoanRequestSchedule[]
      }
      return data.data as LoanRequestSchedule[]
    }

    // Case 2: Single object
    if (typeof data.data === "object" && data.data !== null) {
      return [data.data as LoanRequestSchedule]
    }

    // Case 3: Invalid format
    return []
  }

  // Extract data
  const loanDetail = extractSingleLoan(loanDetailData)
  const allLoans = extractAllLoans(loanDetailData)

  // Calculate statistics
  const totalInstallments = loanDetail?.calculatedTermMonths || 0
  const paidInstallments = loanDetail?.pendingInstallments
    ? totalInstallments - loanDetail.pendingInstallments
    : 0
  const progressPercentage =
    totalInstallments > 0 ? (paidInstallments / totalInstallments) * 100 : 0

  const totalAmount = loanDetail?.requestedAmount || 0
  const paidAmount = loanDetail?.totalRepaidAmount || 0
  const remainingAmount = totalAmount - paidAmount

  const handleSkipInstallment = () => {
    setShowSkipRequestForm(true)
  }

  // Show loading state
  if (loanDetailLoading) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
        <p className="text-muted-foreground mt-2">Loading loan details...</p>
      </div>
    )
  }

  // Show error state
  if (loanDetailError) {
    return (
      <div className="py-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Error Loading Loan Details
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Failed to load loan details. Please try again.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    )
  }

  if (!loanDetail) {
    return (
      <div className="py-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Loan not found
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          The requested loan details could not be found for loan ID: {loanId}
        </p>
        <div className="mt-4 text-xs text-gray-400">
          <p>Debug Info:</p>
          <p>Loan Detail Data: {JSON.stringify(loanDetailData, null, 2)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Loan Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyFormatter amount={totalAmount} size="lg" />
            </div>
            <p className="text-muted-foreground text-xs">
              Original loan amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              <CurrencyFormatter amount={paidAmount} size="lg" />
            </div>
            <p className="text-muted-foreground text-xs">
              {totalAmount > 0
                ? ((paidAmount / totalAmount) * 100).toFixed(1)
                : "0"}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              <CurrencyFormatter amount={remainingAmount} size="lg" />
            </div>
            <p className="text-muted-foreground text-xs">
              {totalAmount > 0
                ? ((remainingAmount / totalAmount) * 100).toFixed(1)
                : "0"}
              % remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progressPercentage.toFixed(1)}%
            </div>
            <Progress value={progressPercentage} className="mt-2" />
            <p className="text-muted-foreground text-xs">
              {paidInstallments}/{totalInstallments} installments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Installment Schedule */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Installment Schedule</CardTitle>
          {(loanDetail.requestStatus === "APPROVED" ||
            loanDetail.requestStatus === "OPEN") && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkipInstallment}
              className="flex items-center space-x-2"
            >
              <SkipForward className="h-4 w-4" />
              <span>Skip Installment</span>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-1 text-left">Installment</th>
                  <th className="py-1 text-left">Due Date</th>
                  <th className="py-1 text-left">Amount</th>
                  <th className="py-1 text-left">Paid</th>
                  <th className="py-1 text-left">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {allLoans && allLoans.length > 0 ? (
                  allLoans.map((loan: LoanRequestSchedule, index: number) => {
                    if (loan.loanRequestId === loanId) {
                      return (
                        <tr key={index} className="border-b">
                          <td className="py-1">#{index + 1}</td>
                          <td className="py-1">
                            {loan.paidDate
                              ? new Date(loan.paidDate).toLocaleDateString()
                              : new Date(loan.dueDate).toLocaleDateString()}
                          </td>
                          <td className="py-1">
                            <div className="text-xs text-gray-500">
                              <CurrencyFormatter amount={loan.emi} size="sm" />
                            </div>
                            {loan.requestedAmount > 0
                              ? `${((loan.emi / loan.requestedAmount) * 100).toFixed(1)}%`
                              : "0%"}
                            <Badge
                              variant={
                                loan.installmentStatus === "Auto Paid"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {loan.installmentStatus}
                            </Badge>
                          </td>
                          <td className="py-1 font-medium text-green-600">
                            <div className="text-xs text-gray-500">
                              <CurrencyFormatter
                                amount={loan.totalAmountRepaid}
                                size="sm"
                              />
                            </div>
                            {loan.requestedAmount > 0
                              ? `${((loan.totalAmountRepaid / loan.requestedAmount) * 100).toFixed(1)}%`
                              : "0%"}
                          </td>
                          <td className="py-1">
                            <div className="text-xs text-gray-500">
                              <CurrencyFormatter
                                amount={loan.remaining_Amount}
                                size="sm"
                              />
                            </div>
                            <span className="font-medium text-red-600">
                              {loan.requestedAmount > 0
                                ? `${((loan.remaining_Amount / loan.requestedAmount) * 100).toFixed(1)}%`
                                : "0%"}
                            </span>
                          </td>
                        </tr>
                      )
                    }
                    return null
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">
                      <div>
                        <div>No installment data available</div>
                        <div className="mt-1 text-xs">
                          Please check if the loan has been processed.
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <LoanSkipRequestForm
        open={showSkipRequestForm}
        onOpenChange={setShowSkipRequestForm}
        loanId={loanId}
        onSubmit={async () => {
          // Handle skip request submission
          setShowSkipRequestForm(false)
          toast.success("Skip request submitted successfully")
        }}
      />
    </div>
  )
}
