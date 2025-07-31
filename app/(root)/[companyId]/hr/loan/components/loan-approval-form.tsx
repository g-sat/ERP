"use client"

import { useState } from "react"
import { ILoanApplication } from "@/interfaces/loan"
import { LoanApprovalFormData, loanApprovalFormSchema } from "@/schemas/loan"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  AlertTriangle,
  Calculator,
  CheckCircle,
  Info,
  XCircle,
} from "lucide-react"
import { useForm } from "react-hook-form"

import { Alert, AlertDescription } from "@/components/ui/alert"
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface LoanApprovalFormProps {
  application: ILoanApplication
  onSubmit: (data: LoanApprovalFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function LoanApprovalForm({
  application,
  onSubmit,
  onCancel,
  isLoading = false,
}: LoanApprovalFormProps) {
  const [showCalculator, setShowCalculator] = useState(false)
  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [totalInterest, setTotalInterest] = useState(0)

  const form = useForm<LoanApprovalFormData>({
    resolver: zodResolver(loanApprovalFormSchema),
    defaultValues: {
      applicationId: application.applicationId,
      approvalStatus: "Approved",
      approvedAmount: application.requestedAmount,
      approvedInterestRate: getDefaultInterestRate(application.loanType),
      approvedRepaymentPeriod: application.repaymentPeriod,
      rejectionReason: "",
      remarks: "",
    },
  })

  const watchedStatus = form.watch("approvalStatus")
  const watchedAmount = form.watch("approvedAmount")
  const watchedPeriod = form.watch("approvedRepaymentPeriod")
  const watchedRate = form.watch("approvedInterestRate")

  function getDefaultInterestRate(loanType: string): number {
    switch (loanType) {
      case "Housing":
        return 8.5
      case "Vehicle":
        return 9.0
      case "Education":
        return 7.5
      case "Emergency":
        return 12.0
      case "Personal":
      default:
        return 10.0
    }
  }

  // Calculate loan details
  const calculateLoan = () => {
    const amount = watchedAmount || 0
    const period = watchedPeriod || 0
    const rate = watchedRate || 0

    if (amount > 0 && period > 0 && rate > 0) {
      const monthlyRate = rate / 12 / 100
      const monthlyPayment =
        (amount * monthlyRate * Math.pow(1 + monthlyRate, period)) /
        (Math.pow(1 + monthlyRate, period) - 1)
      const totalInterest = monthlyPayment * period - amount

      setMonthlyPayment(monthlyPayment)
      setTotalInterest(totalInterest)
    }
  }

  const handleSubmit = (data: LoanApprovalFormData) => {
    onSubmit(data)
  }

  const debtToIncomeRatio =
    application.monthlyIncome > 0
      ? (((watchedAmount || 0) + application.existingLoans) /
          application.monthlyIncome) *
        100
      : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "text-green-600"
      case "Rejected":
        return "text-red-600"
      case "Under Review":
        return "text-yellow-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "Rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "Under Review":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Loan Application Review
        </CardTitle>
        <CardDescription>
          Review and approve or reject the loan application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Application Details */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Employee:</span>
                <span className="font-medium">{application.employeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Employee Code:
                </span>
                <span className="font-medium">{application.employeeCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Department:
                </span>
                <span className="font-medium">
                  {application.departmentName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Designation:
                </span>
                <span className="font-medium">
                  {application.designationName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Application Date:
                </span>
                <span className="font-medium">
                  {application.applicationDate.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Status:</span>
                <Badge
                  variant="outline"
                  className={getStatusColor(application.status)}
                >
                  {getStatusIcon(application.status)}
                  <span className="ml-1">{application.status}</span>
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Loan Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Loan Type:
                </span>
                <span className="font-medium">{application.loanType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Requested Amount:
                </span>
                <span className="font-medium">
                  {application.requestedAmount.toLocaleString()} AED
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Repayment Period:
                </span>
                <span className="font-medium">
                  {application.repaymentPeriod} months
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Monthly Income:
                </span>
                <span className="font-medium">
                  {application.monthlyIncome.toLocaleString()} AED
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Existing Loans:
                </span>
                <span className="font-medium">
                  {application.existingLoans.toLocaleString()} AED
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Debt-to-Income Ratio:
                </span>
                <span
                  className={`font-medium ${debtToIncomeRatio > 40 ? "text-red-600" : "text-green-600"}`}
                >
                  {debtToIncomeRatio.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Purpose */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Purpose of Loan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{application.purpose}</p>
          </CardContent>
        </Card>

        {/* Approval Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Approval Status */}
            <FormField
              control={form.control}
              name="approvalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approval Decision</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select approval status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Approved">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Approve Application
                        </div>
                      </SelectItem>
                      <SelectItem value="Rejected">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          Reject Application
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conditional Fields based on Approval Status */}
            {watchedStatus === "Approved" && (
              <>
                {/* Approved Amount */}
                <FormField
                  control={form.control}
                  name="approvedAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Approved Amount (AED)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter approved amount"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Original requested amount:{" "}
                        {application.requestedAmount.toLocaleString()} AED
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Interest Rate */}
                <FormField
                  control={form.control}
                  name="approvedInterestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Enter interest rate"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Standard rate for {application.loanType} loans:{" "}
                        {getDefaultInterestRate(application.loanType)}%
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Repayment Period */}
                <FormField
                  control={form.control}
                  name="approvedRepaymentPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repayment Period (Months)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter repayment period"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Original requested period: {application.repaymentPeriod}{" "}
                        months
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Loan Calculator */}
                <div className="rounded-lg border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium">Loan Calculator</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowCalculator(!showCalculator)
                        if (!showCalculator) {
                          calculateLoan()
                        }
                      }}
                    >
                      <Calculator className="mr-2 h-4 w-4" />
                      {showCalculator ? "Hide" : "Show"} Calculator
                    </Button>
                  </div>

                  {showCalculator && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-blue-50 p-3 text-center">
                          <p className="text-muted-foreground text-sm">
                            Monthly Payment
                          </p>
                          <p className="text-lg font-bold text-blue-600">
                            {monthlyPayment > 0
                              ? `${monthlyPayment.toFixed(2)} AED`
                              : "N/A"}
                          </p>
                        </div>
                        <div className="rounded-lg bg-green-50 p-3 text-center">
                          <p className="text-muted-foreground text-sm">
                            Total Interest
                          </p>
                          <p className="text-lg font-bold text-green-600">
                            {totalInterest > 0
                              ? `${totalInterest.toFixed(2)} AED`
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3 text-center">
                        <p className="text-muted-foreground text-sm">
                          Total Payable
                        </p>
                        <p className="text-lg font-bold">
                          {watchedAmount && totalInterest > 0
                            ? `${(watchedAmount + totalInterest).toFixed(2)} AED`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {watchedStatus === "Rejected" && (
              <FormField
                control={form.control}
                name="rejectionReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rejection Reason</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please provide a detailed reason for rejection..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This reason will be communicated to the employee.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Remarks */}
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional comments or notes..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Warnings */}
            {watchedStatus === "Approved" && debtToIncomeRatio > 40 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700">
                  Warning: The debt-to-income ratio is{" "}
                  {debtToIncomeRatio.toFixed(1)}%, which is above the
                  recommended 40%. Please consider this carefully before
                  approval.
                </AlertDescription>
              </Alert>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                variant={
                  watchedStatus === "Rejected" ? "destructive" : "default"
                }
              >
                {isLoading
                  ? "Processing..."
                  : `${
                      watchedStatus === "Approved" ? "Approve" : "Reject"
                    } Application`}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
