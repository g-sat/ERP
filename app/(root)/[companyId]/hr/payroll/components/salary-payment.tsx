"use client"

import { useState } from "react"
import { IPayrollEmployee } from "@/interfaces/payroll"
import { Banknote, CreditCard, Download, Eye, Send, Wallet } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

interface SalaryPaymentProps {
  employees: IPayrollEmployee[]
}

export function SalaryPayment({ employees }: SalaryPaymentProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("2024-01")
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("bank_transfer")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedPayments, setProcessedPayments] = useState<string[]>([])
  const [completedPayments, setCompletedPayments] = useState<string[]>([])

  const periods = [
    { value: "2024-01", label: "January 2024" },
    { value: "2024-02", label: "February 2024" },
    { value: "2024-03", label: "March 2024" },
  ]

  const paymentMethods = [
    { value: "bank_transfer", label: "Bank Transfer", icon: Banknote },
    { value: "cash", label: "Cash", icon: Wallet },
    { value: "check", label: "Check", icon: CreditCard },
  ]

  const handleProcessPayments = () => {
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      const employeeIds = employees.map((emp) => emp.employeeId.toString())
      setProcessedPayments(employeeIds)
      setIsProcessing(false)
      toast.success("Salary payments processed successfully!")
    }, 4000)
  }

  const handleCompletePayments = () => {
    setCompletedPayments([...completedPayments, ...processedPayments])
    setProcessedPayments([])
    toast.success("Salary payments completed and sent!")
  }

  const handleDownloadPaymentReport = (period: string) => {
    toast.success(`Payment report for ${period} downloaded successfully!`)
  }

  const handleViewPaymentDetails = (employeeId: string) => {
    toast.success(`Viewing payment details for employee ${employeeId}`)
  }

  const formatCurrency = (amount: number) => {
    return <CurrencyFormatter amount={amount} size="md" />
  }

  const getStatusBadge = (employeeId: string) => {
    if (completedPayments.includes(employeeId.toString())) {
      return (
        <Badge variant="default" className="bg-green-600">
          Completed
        </Badge>
      )
    } else if (processedPayments.includes(employeeId.toString())) {
      return <Badge variant="secondary">Processed</Badge>
    }
    return <Badge variant="outline">Pending</Badge>
  }

  const getPaymentMethodIcon = (method: string) => {
    const methodData = paymentMethods.find((m) => m.value === method)
    return methodData ? <methodData.icon className="h-4 w-4" /> : null
  }

  return (
    <div className="space-y-6">
      {/* Payment Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Salary Payment Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium">Payroll Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Payment Method</label>
              <Select
                value={selectedPaymentMethod}
                onValueChange={setSelectedPaymentMethod}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex items-center gap-2">
                        <method.icon className="h-4 w-4" />
                        {method.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleProcessPayments}
                disabled={isProcessing || processedPayments.length > 0}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Banknote className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Banknote className="mr-2 h-4 w-4" />
                    Process Payments
                  </>
                )}
              </Button>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleCompletePayments}
                disabled={processedPayments.length === 0}
                variant="outline"
                className="w-full"
              >
                <Send className="mr-2 h-4 w-4" />
                Complete Payments
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {employees.length}
              </div>
              <div className="text-muted-foreground text-sm">
                Total Employees
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {processedPayments.length}
              </div>
              <div className="text-muted-foreground text-sm">
                Processed Payments
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {completedPayments.length}
              </div>
              <div className="text-muted-foreground text-sm">
                Completed Payments
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(
                  employees.reduce((sum, emp) => sum + emp.netSalary, 0)
                )}
              </div>
              <div className="text-muted-foreground text-sm">Total Amount</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Code</TableHead>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Bank Account</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.employeeId}>
                    <TableCell className="font-medium">
                      {employee.employeeCode}
                    </TableCell>
                    <TableCell>{employee.employeeName}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {employee.bankTransferRef || "N/A"}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(employee.netSalary)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(selectedPaymentMethod)}
                        <span className="text-sm">
                          {
                            paymentMethods.find(
                              (m) => m.value === selectedPaymentMethod
                            )?.label
                          }
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(employee.employeeId.toString())}
                    </TableCell>
                    <TableCell>
                      {completedPayments.includes(
                        employee.employeeId.toString()
                      )
                        ? new Date().toLocaleDateString()
                        : "Pending"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleViewPaymentDetails(
                              employee.employeeId.toString()
                            )
                          }
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDownloadPaymentReport(selectedPeriod)
                          }
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-semibold">Payment Methods</h4>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• Bank Transfer: Direct deposit to employee accounts</li>
                  <li>• Cash: Physical cash payment</li>
                  <li>• Check: Bank check payment</li>
                  <li>• All payments are processed securely</li>
                </ul>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">Processing Timeline</h4>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• Processing time: 1-2 business days</li>
                  <li>• Bank transfers: 2-3 business days</li>
                  <li>• Cash payments: Same day</li>
                  <li>• Check payments: 3-5 business days</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
