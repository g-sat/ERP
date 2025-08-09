"use client"

import { useState } from "react"
import {
  AlertCircle,
  CheckCircle,
  MinusCircle,
  Search,
  Upload,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CurrencyFormatter } from "@/components/currencyicons/currency-formatter"

import { EmployeeSidebar } from "./components/employee-sidebar"

interface Employee {
  id: number
  name: string
  employeeId: string
  paidDays: number
  grossPay: number
  benefits: number
  netPay: number
  earnings: {
    basic: number
    housingAllowance: number
    costOfLivingAllowance: number
    otherAllowance: number
  }
  deductions: {
    personalLoans: number
    actualLoanAmount: number
  }
}

// Dummy data for the pay run
const payRunData = {
  id: 1,
  payrollType: "Regular Payroll",
  period: "August 2025",
  baseDays: 30,
  payDay: 31,
  month: "AUG, 2025",
  employeeCount: 2,
  status: "DRAFT",
  payrollCost: 6000,
  totalNetPay: 5500,
  totalDeductions: 500,
  totalBenefits: 0,
  totalDonations: 0,
}

const employees = [
  {
    id: 1,
    name: "Ali Azger",
    employeeId: "2146587",
    paidDays: 30,
    grossPay: 3000,
    benefits: 0,
    netPay: 2500,
    earnings: {
      basic: 1500,
      housingAllowance: 600,
      costOfLivingAllowance: 600,
      otherAllowance: 300,
    },
    deductions: {
      personalLoans: 500,
      actualLoanAmount: 800,
    },
  },
  {
    id: 2,
    name: "Harshad P Lunkad",
    employeeId: "324652145785321",
    paidDays: 30,
    grossPay: 3000,
    benefits: 0,
    netPay: 3000,
    earnings: {
      basic: 1500,
      housingAllowance: 600,
      costOfLivingAllowance: 600,
      otherAllowance: 300,
    },
    deductions: {
      personalLoans: 0,
      actualLoanAmount: 0,
    },
  },
]

export default function PayRunDetailPage() {
  const [activeTab, setActiveTab] = useState("employee-summary")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  )
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [employeesList, setEmployeesList] = useState(employees)

  const handleSubmitAndApprove = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast.success("Pay run submitted and approved successfully")
    } catch {
      toast.error("Failed to submit and approve pay run")
    }
  }

  const handleImportExport = () => {
    toast.info("Import/Export functionality coming soon")
  }

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsSidebarOpen(true)
  }

  const handleEmployeeSave = (updatedEmployee: Employee) => {
    setEmployeesList((prev) =>
      prev.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp))
    )
    setSelectedEmployee(updatedEmployee)
  }

  const handleSidebarClose = () => {
    setIsSidebarOpen(false)
    setSelectedEmployee(null)
  }

  const filteredEmployees = employeesList.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.includes(searchTerm)
  )

  return (
    <div className="@container flex-1 space-y-4 p-4 pt-6 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {payRunData.payrollType}
            </h1>
            <div className="mt-1 flex items-center space-x-2">
              <Badge
                variant="outline"
                className="bg-yellow-100 text-yellow-800"
              >
                {payRunData.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleSubmitAndApprove}
            className="bg-green-600 hover:bg-green-700"
          >
            Submit and Approve
          </Button>
          <Button
            onClick={handleImportExport}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Import / Export</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Period Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Period</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{payRunData.period}</div>
            <div className="text-muted-foreground text-sm">
              {payRunData.baseDays} Base Days
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">PAYROLL COST</span>
                <span className="font-medium">
                  <CurrencyFormatter amount={payRunData.payrollCost} />
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">TOTAL NET PAY</span>
                <span className="font-medium">
                  <CurrencyFormatter amount={payRunData.totalNetPay} />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pay Day Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pay Day</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{payRunData.payDay}</div>
            <div className="text-muted-foreground text-sm">
              {payRunData.month}
            </div>
            <div className="text-muted-foreground text-sm">
              {payRunData.employeeCount} Employees
            </div>
          </CardContent>
        </Card>

        {/* Deductions Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Deductions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Total Benefit Contribution
                </span>
                <span className="font-medium">
                  <CurrencyFormatter amount={payRunData.totalBenefits} />
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Donations</span>
                <span className="font-medium">
                  <CurrencyFormatter amount={payRunData.totalDonations} />
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Total Deductions</span>
                <span>
                  <CurrencyFormatter amount={payRunData.totalDeductions} />
                </span>
              </div>
            </div>
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
          <TabsTrigger value="employee-summary">Employee Summary</TabsTrigger>
          <TabsTrigger value="deductions">Deductions</TabsTrigger>
          <TabsTrigger value="overall-insights">Overall Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="employee-summary" className="space-y-4">
          {/* Employee List Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold">All Employees</h3>
              <Badge variant="outline">
                {filteredEmployees.length} employees
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder="Search Employee"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10"
                />
              </div>
            </div>
          </div>

          {/* Employee Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="p-4 text-left font-medium">
                        EMPLOYEE NAME
                      </th>
                      <th className="p-4 text-left font-medium">PAID DAYS</th>
                      <th className="p-4 text-left font-medium">GROSS PAY</th>
                      <th className="p-4 text-left font-medium">DEDUCTIONS</th>
                      <th className="p-4 text-left font-medium">BENEFITS</th>
                      <th className="p-4 text-left font-medium">NET PAY</th>
                      <th className="p-4 text-left font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((employee) => (
                      <tr
                        key={employee.id}
                        className="hover:bg-muted/50 cursor-pointer border-b transition-colors"
                        onClick={() => handleEmployeeClick(employee)}
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-medium">
                              {employee.name} ({employee.employeeId})
                            </p>
                          </div>
                        </td>
                        <td className="p-4">{employee.paidDays}</td>
                        <td className="p-4">
                          <CurrencyFormatter amount={employee.grossPay} />
                        </td>
                        <td className="p-4">
                          <CurrencyFormatter
                            amount={employee.deductions.personalLoans}
                          />
                        </td>
                        <td className="p-4">
                          <CurrencyFormatter amount={employee.benefits} />
                        </td>
                        <td className="p-4">
                          <CurrencyFormatter amount={employee.netPay} />
                        </td>
                        <td className="p-4">
                          <Button variant="ghost" size="sm">
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deductions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deductions Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Tax Deductions</p>
                      <p className="text-muted-foreground text-sm">
                        Standard tax deductions applied
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      <CurrencyFormatter amount={500} />
                    </p>
                    <p className="text-muted-foreground text-sm">Ali Azger</p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">No Additional Deductions</p>
                      <p className="text-muted-foreground text-sm">
                        Harshad P Lunkad has no additional deductions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      <CurrencyFormatter amount={0} />
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Harshad P Lunkad
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overall-insights" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Total Gross Pay
                    </span>
                    <span className="font-medium">
                      <CurrencyFormatter amount={6000} />
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Total Deductions
                    </span>
                    <span className="font-medium">
                      <CurrencyFormatter amount={500} />
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Total Benefits
                    </span>
                    <span className="font-medium">
                      <CurrencyFormatter amount={0} />
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Net Pay</span>
                      <span>
                        <CurrencyFormatter amount={5500} />
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Employee Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">Ali Azger</span>
                    </div>
                    <span className="text-sm font-medium">45.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Harshad P Lunkad</span>
                    </div>
                    <span className="text-sm font-medium">54.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Employee Sidebar */}
      <EmployeeSidebar
        employee={selectedEmployee}
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
        onSave={handleEmployeeSave}
      />
    </div>
  )
}
