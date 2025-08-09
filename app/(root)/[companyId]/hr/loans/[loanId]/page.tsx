"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AlertTriangle, Edit, MoreHorizontal, Play, X } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { CurrencyFormatter } from "@/components/currencyicons/currency-formatter"

import { LoanRepaymentForm } from "../components/loan-repayment-form"
import { LoanSkipRequestForm } from "../components/loan-skip-request-form"

// Dummy data for demonstration
const dummyEmployees = [
  {
    loanId: 1,
    name: "Harshad P Lunkad",
    employeeId: "324652145785321",
    loanAmount: 5000,
    loanType: "Personal Loans",
    loanNo: "LOAN-00002",
    status: "PAUSED",
    avatar: "/avatars/employee.jpg",
    instalmentAmount: 800,
  },
  {
    loanId: 2,
    name: "Ali Azger",
    employeeId: "324652145785322",
    loanAmount: 4000,
    loanType: "Car Loan",
    loanNo: "LOAN-00003",
    status: "ACTIVE",
    avatar: "/avatars/employee.jpg",
    instalmentAmount: 800,
  },
  {
    loanId: 3,
    name: "John Doe",
    employeeId: "324652145785323",
    loanAmount: 1500,
    loanType: "Home Improvement Loan",
    loanNo: "LOAN-00004",
    status: "ACTIVE",
    avatar: "/avatars/employee.jpg",
    instalmentAmount: 800,
  },
]

export default function LoanDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const loanId = Number(params.loanId)
  const companyId = params.companyId as string
  const [selectedEmployee, setSelectedEmployee] = useState(dummyEmployees[0])
  const [showRepaymentForm, setShowRepaymentForm] = useState(false)
  const [showSkipRequestForm, setShowSkipRequestForm] = useState(false)

  // Find the selected employee based on loanNo
  useEffect(() => {
    // Convert loanNo to the format used in dummyEmployees (e.g., "2" -> "LOAN-00002")
    const employee = dummyEmployees.find((emp) => emp.loanId === loanId)
    if (employee) {
      setSelectedEmployee(employee)
    }
  }, [loanId])

  const handleEmployeeSelect = (employee: (typeof dummyEmployees)[0]) => {
    setSelectedEmployee(employee)
    router.push(`/${companyId}/hr/loans/${employee.loanId}`)
  }

  const handleRecordRepayment = () => {
    setShowRepaymentForm(true)
  }

  const handlePauseInstallment = () => {
    setShowSkipRequestForm(true)
  }

  const handleResumeNow = () => {
    toast.success("Loan instalment deduction resumed successfully")
  }

  const handleViewReason = () => {
    toast.info("Viewing pause reason details")
  }

  const handleEditReason = () => {
    toast.info("Editing pause reason")
  }

  return (
    <div className="@container flex h-screen">
      {/* Left Sidebar */}
      <div className="flex w-80 flex-col border-r border-gray-200">
        {/* Employee List */}
        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {dummyEmployees.map((employee) => (
            <div
              key={employee.loanId}
              className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                selectedEmployee.loanId === employee.loanId
                  ? "border-blue-200 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => handleEmployeeSelect(employee)}
            >
              <div className="mb-1 flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-500">
                    {employee.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    ({employee.employeeId})
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  OPEN
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                <CurrencyFormatter amount={employee.loanAmount} size="sm" />
              </div>
              <div className="text-sm text-gray-500">
                {employee.loanType} | {employee.loanNo}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/${companyId}/hr/loans`)}
                className="mr-2"
              >
                ← Back to List
              </Button>
              <h1 className="text-xl font-bold">{selectedEmployee.loanNo}</h1>
              <Badge
                variant={
                  selectedEmployee.status === "PAUSED" ? "secondary" : "default"
                }
              >
                {selectedEmployee.status}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handleRecordRepayment}>Record Repayment</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Loan
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handlePauseInstallment}>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Pause Installment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        {/* Alert Banner */}
        {selectedEmployee.status === "PAUSED" && (
          <div className="border-l-4 border-yellow-400 bg-yellow-50 p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-yellow-400" />
                <p className="text-yellow-800">
                  Loan instalment deduction will be paused from Aug 2025 and
                  will be resumed in Sep 2025.
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <button
                  onClick={handleViewReason}
                  className="text-yellow-600 underline hover:text-yellow-800"
                >
                  View Reason
                </button>
                <span className="text-yellow-600">|</span>
                <button
                  onClick={handleEditReason}
                  className="text-yellow-600 underline hover:text-yellow-800"
                >
                  (Edit)
                </button>
                <span className="text-yellow-600">|</span>
                <button
                  onClick={handleResumeNow}
                  className="flex items-center text-yellow-600 underline hover:text-yellow-800"
                >
                  <Play className="mr-1 h-3 w-3" />
                  Resume Now
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Main Content */}
        <div className="flex-1 space-y-4 p-4">
          {/* Loan Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedEmployee.loanType}</span>
                <span className="text-2xl font-bold">
                  <CurrencyFormatter
                    amount={selectedEmployee.loanAmount}
                    size="lg"
                  />
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedEmployee.avatar} />
                    <AvatarFallback>
                      {selectedEmployee.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedEmployee.name}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Instalment Amount</div>
                  <div className="font-medium">
                    <CurrencyFormatter
                      amount={selectedEmployee.instalmentAmount}
                      size="md"
                    />
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {selectedEmployee.status}
                    </span>
                    <Progress value={50} className="flex-1" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-sm text-gray-500">
                    Next Instalment Date: 30 Sep 2025
                  </div>
                </div>

                <div className="text-right">
                  <a
                    href="#"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    1 more Loan(s) in progress
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Other Details */}
          <Card>
            <CardHeader>
              <CardTitle>Other Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Disbursement Date:</span>
                <span className="ml-2">15 May 2025</span>
              </div>
              <div>
                <span className="text-gray-500">Loan closing Date:</span>
                <span className="ml-2">30 Jan 2026</span>
              </div>
              <div>
                <span className="text-gray-500">Reason:</span>
                <span className="ml-2">Medical Purpose</span>
              </div>
            </CardContent>
          </Card>

          {/* Loan Repayment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Loan Repayment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 grid grid-cols-3 gap-3 rounded-lg bg-gray-50 p-3">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">
                    <CurrencyFormatter amount={2500} size="md" />
                  </div>
                  <div className="text-sm text-gray-600">Amount Repaid</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-red-600">
                    <CurrencyFormatter amount={2500} size="md" />
                  </div>
                  <div className="text-sm text-gray-600">Remaining Amount</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">4</div>
                  <div className="text-sm text-gray-600">
                    Instalment(s) Remaining
                  </div>
                </div>
              </div>

              {/* Repayment Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">INSTALMENT DATE</th>
                      <th className="py-2 text-left">EMI</th>
                      <th className="py-2 text-left">TOTAL AMOUNT REPAID</th>
                      <th className="py-2 text-left">REMAINING AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">05 Aug 2025</td>
                      <td className="py-2">
                        <div>
                          <CurrencyFormatter amount={400} size="sm" />
                        </div>
                        <div className="text-xs font-medium text-orange-600">
                          PART PAYMENT
                        </div>
                      </td>
                      <td className="py-2 font-medium text-green-600">
                        <CurrencyFormatter amount={2500} size="sm" />
                      </td>
                      <td className="py-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-red-600">
                            <CurrencyFormatter amount={2500} size="sm" />
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">31 Jul 2025</td>
                      <td className="py-2">
                        <CurrencyFormatter amount={800} size="sm" />
                      </td>
                      <td className="py-2 font-medium text-green-600">
                        <CurrencyFormatter amount={2100} size="sm" />
                      </td>
                      <td className="py-2 font-medium text-red-600">
                        <CurrencyFormatter amount={2900} size="sm" />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">30 Jun 2025</td>
                      <td className="py-2">
                        <CurrencyFormatter amount={800} size="sm" />
                      </td>
                      <td className="py-2 font-medium text-green-600">
                        <CurrencyFormatter amount={1300} size="sm" />
                      </td>
                      <td className="py-2 font-medium text-red-600">
                        <CurrencyFormatter amount={3700} size="sm" />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">10 Jun 2025</td>
                      <td className="py-2">
                        <div>
                          <CurrencyFormatter amount={500} size="sm" />
                        </div>
                        <div className="text-xs font-medium text-orange-600">
                          PART PAYMENT
                        </div>
                      </td>
                      <td className="py-2 font-medium text-green-600">
                        <CurrencyFormatter amount={500} size="sm" />
                      </td>
                      <td className="py-2 font-medium text-red-600">
                        <CurrencyFormatter amount={4500} size="sm" />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2">31 May 2025</td>
                      <td className="py-2">
                        <CurrencyFormatter amount={0} size="sm" />
                      </td>
                      <td className="py-2 font-medium text-green-600">
                        <CurrencyFormatter amount={0} size="sm" />
                      </td>
                      <td className="py-2 font-medium text-red-600">
                        <CurrencyFormatter amount={5000} size="sm" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Dialogs */}
      <LoanRepaymentForm
        open={showRepaymentForm}
        onOpenChange={setShowRepaymentForm}
        loanId={loanId}
        onSubmit={async () => {
          // Handle repayment submission
          setShowRepaymentForm(false)
          toast.success("Repayment recorded successfully")
        }}
      />

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
