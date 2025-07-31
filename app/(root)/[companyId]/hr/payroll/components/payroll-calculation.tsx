"use client"

import { useState } from "react"
import { IPayrollEmployee } from "@/interfaces/payroll"
import { Calculator, Download, Play, RefreshCw } from "lucide-react"
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

interface PayrollCalculationProps {
  employees: IPayrollEmployee[]
}

export function PayrollCalculation({ employees }: PayrollCalculationProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("2024-01")
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculatedEmployees, setCalculatedEmployees] = useState<
    IPayrollEmployee[]
  >([])

  const periods = [
    { value: "2024-01", label: "January 2024" },
    { value: "2024-02", label: "February 2024" },
    { value: "2024-03", label: "March 2024" },
  ]

  const handleCalculatePayroll = () => {
    setIsCalculating(true)

    // Simulate calculation process
    setTimeout(() => {
      const calculated = employees.map((emp) => ({
        ...emp,
        totalEarnings:
          emp.basicSalary +
          emp.housingAllowance +
          emp.transportAllowance +
          emp.otherAllowances +
          (emp.overtimeAmount || 0) +
          (emp.bonusAmount || 0),
        totalDeductions:
          emp.socialInsurance +
          (emp.leaveDeduction || 0) +
          (emp.lateDeduction || 0),
        netSalary:
          emp.basicSalary +
          emp.housingAllowance +
          emp.transportAllowance +
          emp.otherAllowances +
          (emp.overtimeAmount || 0) +
          (emp.bonusAmount || 0) -
          (emp.socialInsurance +
            (emp.leaveDeduction || 0) +
            (emp.lateDeduction || 0)),
      }))

      setCalculatedEmployees(calculated)
      setIsCalculating(false)
      toast.success("Payroll calculation completed successfully!")
    }, 2000)
  }

  const handleExportCalculation = () => {
    toast.success("Calculation report exported successfully!")
  }

  const formatCurrency = (amount: number) => {
    return <CurrencyFormatter amount={amount} size="md" />
  }

  const getStatusBadge = (employee: IPayrollEmployee) => {
    if (
      calculatedEmployees.find(
        (calc) => calc.employeeId === employee.employeeId
      )
    ) {
      return <Badge variant="default">Calculated</Badge>
    }
    return <Badge variant="outline">Pending</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Calculation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Payroll Calculation Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
            <div className="flex items-end">
              <Button
                onClick={handleCalculatePayroll}
                disabled={isCalculating}
                className="w-full"
              >
                {isCalculating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Calculate Payroll
                  </>
                )}
              </Button>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={handleExportCalculation}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculation Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Calculation Summary</CardTitle>
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
                {formatCurrency(
                  employees.reduce((sum, emp) => sum + emp.basicSalary, 0)
                )}
              </div>
              <div className="text-muted-foreground text-sm">
                Total Basic Salary
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(
                  employees.reduce(
                    (sum, emp) => sum + (emp.overtimeAmount || 0),
                    0
                  )
                )}
              </div>
              <div className="text-muted-foreground text-sm">
                Total Overtime
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(
                  employees.reduce(
                    (sum, emp) => sum + (emp.bonusAmount || 0),
                    0
                  )
                )}
              </div>
              <div className="text-muted-foreground text-sm">Total Bonus</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Calculation Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Calculation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Code</TableHead>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Allowances</TableHead>
                  <TableHead>Overtime</TableHead>
                  <TableHead>Bonus</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => {
                  const calculated = calculatedEmployees.find(
                    (calc) => calc.employeeId === employee.employeeId
                  )
                  const allowances =
                    employee.housingAllowance +
                    employee.transportAllowance +
                    employee.otherAllowances
                  const deductions =
                    employee.socialInsurance +
                    (employee.leaveDeduction || 0) +
                    (employee.lateDeduction || 0)

                  return (
                    <TableRow key={employee.employeeId}>
                      <TableCell className="font-medium">
                        {employee.employeeCode}
                      </TableCell>
                      <TableCell>{employee.employeeName}</TableCell>
                      <TableCell>
                        {formatCurrency(employee.basicSalary)}
                      </TableCell>
                      <TableCell>{formatCurrency(allowances)}</TableCell>
                      <TableCell>
                        {formatCurrency(employee.overtimeAmount || 0)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(employee.bonusAmount || 0)}
                      </TableCell>
                      <TableCell>{formatCurrency(deductions)}</TableCell>
                      <TableCell className="font-semibold">
                        {calculated
                          ? formatCurrency(calculated.netSalary)
                          : formatCurrency(employee.netSalary)}
                      </TableCell>
                      <TableCell>{getStatusBadge(employee)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
