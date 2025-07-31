"use client"

import { useState } from "react"
import {
  LoanApplicationFormData,
  loanApplicationFormSchema,
} from "@/schemas/loan"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Calculator, Info } from "lucide-react"
import { useForm } from "react-hook-form"

import { Alert, AlertDescription } from "@/components/ui/alert"
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

import { dummyEmployees } from "../../payroll/dummy-employee-data"

interface LoanApplicationFormProps {
  onSubmit: (data: LoanApplicationFormData) => void
  onCancel: () => void
  isLoading?: boolean
  initialData?: Partial<LoanApplicationFormData>
}

export function LoanApplicationForm({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData,
}: LoanApplicationFormProps) {
  const [showCalculator, setShowCalculator] = useState(false)
  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [totalInterest, setTotalInterest] = useState(0)

  const form = useForm<LoanApplicationFormData>({
    resolver: zodResolver(loanApplicationFormSchema),
    defaultValues: {
      employeeId: initialData?.employeeId || 0,
      loanType: initialData?.loanType || "Personal",
      requestedAmount: initialData?.requestedAmount || 0,
      purpose: initialData?.purpose || "",
      repaymentPeriod: initialData?.repaymentPeriod || 12,
      monthlyIncome: initialData?.monthlyIncome || 0,
      existingLoans: initialData?.existingLoans || 0,
      remarks: initialData?.remarks || "",
    },
  })

  const watchedAmount = form.watch("requestedAmount")
  const watchedPeriod = form.watch("repaymentPeriod")
  const watchedIncome = form.watch("monthlyIncome")

  // Calculate loan details
  const calculateLoan = () => {
    const amount = watchedAmount
    const period = watchedPeriod
    const interestRate = getInterestRate(form.getValues("loanType"))

    if (amount > 0 && period > 0) {
      const monthlyRate = interestRate / 12 / 100
      const monthlyPayment =
        (amount * monthlyRate * Math.pow(1 + monthlyRate, period)) /
        (Math.pow(1 + monthlyRate, period) - 1)
      const totalInterest = monthlyPayment * period - amount

      setMonthlyPayment(monthlyPayment)
      setTotalInterest(totalInterest)
    }
  }

  const getInterestRate = (loanType: string) => {
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

  const getMaxLoanAmount = (monthlyIncome: number, existingLoans: number) => {
    const maxMultiple = 12 // Maximum 12 months of salary
    const maxAmount = monthlyIncome * maxMultiple
    const availableAmount = maxAmount - existingLoans
    return Math.max(0, availableAmount)
  }

  const handleSubmit = (data: LoanApplicationFormData) => {
    onSubmit(data)
  }

  const loanTypes = [
    {
      value: "Personal",
      label: "Personal Loan",
      description: "For personal expenses",
    },
    {
      value: "Housing",
      label: "Housing Loan",
      description: "For property purchase or renovation",
    },
    {
      value: "Vehicle",
      label: "Vehicle Loan",
      description: "For car or vehicle purchase",
    },
    {
      value: "Education",
      label: "Education Loan",
      description: "For educational purposes",
    },
    {
      value: "Emergency",
      label: "Emergency Loan",
      description: "For urgent medical or emergency expenses",
    },
  ]

  const maxLoanAmount = getMaxLoanAmount(
    watchedIncome,
    form.watch("existingLoans")
  )
  const debtToIncomeRatio =
    watchedIncome > 0
      ? ((watchedAmount + form.watch("existingLoans")) / watchedIncome) * 100
      : 0

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Loan Application Form
        </CardTitle>
        <CardDescription>
          Please fill in all required information to apply for a loan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Employee Selection */}
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dummyEmployees.map((employee) => (
                        <SelectItem
                          key={employee.employeeId}
                          value={employee.employeeId.toString()}
                        >
                          {employee.employeeName} - {employee.departmentName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Loan Type */}
            <FormField
              control={form.control}
              name="loanType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select loan type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loanTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-muted-foreground text-xs">
                              {type.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Requested Amount */}
            <FormField
              control={form.control}
              name="requestedAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requested Amount (AED)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter loan amount"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum available amount: {maxLoanAmount.toLocaleString()}{" "}
                    AED
                  </FormDescription>
                  {watchedAmount > maxLoanAmount && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700">
                        Requested amount exceeds maximum available amount based
                        on your income and existing loans.
                      </AlertDescription>
                    </Alert>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Purpose */}
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose of Loan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe the purpose of this loan in detail..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed explanation of how you plan to use the
                    loan funds.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Repayment Period */}
            <FormField
              control={form.control}
              name="repaymentPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repayment Period (Months)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter repayment period in months"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Minimum: 6 months, Maximum: 120 months (10 years)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Monthly Income */}
            <FormField
              control={form.control}
              name="monthlyIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Income (AED)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter your monthly income"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Existing Loans */}
            <FormField
              control={form.control}
              name="existingLoans"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Existing Loan Balance (AED)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter existing loan balance"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Debt to Income Ratio Warning */}
            {debtToIncomeRatio > 40 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700">
                  Your debt-to-income ratio is {debtToIncomeRatio.toFixed(1)}%,
                  which is above the recommended 40%. This may affect your loan
                  approval.
                </AlertDescription>
              </Alert>
            )}

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
                      Interest Rate
                    </p>
                    <p className="text-lg font-bold">
                      {getInterestRate(form.getValues("loanType"))}% per annum
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Remarks */}
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information or special circumstances..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
