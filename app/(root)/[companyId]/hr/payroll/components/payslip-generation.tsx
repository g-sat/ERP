"use client"

import { useState } from "react"
import { IPayrollEmployee } from "@/interfaces/payroll"
import { Download, Eye, FileText, Mail, Printer } from "lucide-react"
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

interface PayslipGenerationProps {
  employees: IPayrollEmployee[]
}

export function PayslipGeneration({ employees }: PayslipGenerationProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("2024-01")
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPayslips, setGeneratedPayslips] = useState<string[]>([])

  const periods = [
    { value: "2024-01", label: "January 2024" },
    { value: "2024-02", label: "February 2024" },
    { value: "2024-03", label: "March 2024" },
  ]

  const handleGeneratePayslips = () => {
    setIsGenerating(true)

    // Simulate payslip generation
    setTimeout(() => {
      const employeeIds =
        selectedEmployee === "all"
          ? employees.map((emp) => emp.employeeId.toString())
          : [selectedEmployee]

      setGeneratedPayslips(employeeIds)
      setIsGenerating(false)
      toast.success(`Generated ${employeeIds.length} payslip(s) successfully!`)
    }, 3000)
  }

  const handleDownloadPayslip = (employeeId: string) => {
    toast.success(`Payslip for employee ${employeeId} downloaded successfully!`)
  }

  const handlePrintPayslip = (employeeId: string) => {
    toast.success(`Payslip for employee ${employeeId} sent to printer!`)
  }

  const handleEmailPayslip = (employeeId: string) => {
    toast.success(`Payslip for employee ${employeeId} sent via email!`)
  }

  const handleDownloadAll = () => {
    toast.success("All payslips downloaded successfully!")
  }

  const formatCurrency = (amount: number) => {
    return <CurrencyFormatter amount={amount} size="md" />
  }

  const getStatusBadge = (employeeId: string) => {
    if (generatedPayslips.includes(employeeId.toString())) {
      return <Badge variant="default">Generated</Badge>
    }
    return <Badge variant="outline">Pending</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Payslip Generation Controls
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
              <label className="text-sm font-medium">Employee</label>
              <Select
                value={selectedEmployee}
                onValueChange={setSelectedEmployee}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem
                      key={employee.employeeId}
                      value={employee.employeeId.toString()}
                    >
                      {employee.employeeCode} - {employee.employeeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleGeneratePayslips}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <FileText className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Payslips
                  </>
                )}
              </Button>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={handleDownloadAll}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Download All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generation Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Generation Summary</CardTitle>
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
                {generatedPayslips.length}
              </div>
              <div className="text-muted-foreground text-sm">
                Generated Payslips
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {employees.length - generatedPayslips.length}
              </div>
              <div className="text-muted-foreground text-sm">
                Pending Generation
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(
                  employees.reduce((sum, emp) => sum + emp.netSalary, 0)
                )}
              </div>
              <div className="text-muted-foreground text-sm">
                Total Net Salary
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payslip Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payslip Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Code</TableHead>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.employeeId}>
                    <TableCell className="font-medium">
                      {employee.employeeCode}
                    </TableCell>
                    <TableCell>{employee.employeeName}</TableCell>
                    <TableCell>{selectedPeriod}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(employee.netSalary)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(employee.employeeId.toString())}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDownloadPayslip(
                              employee.employeeId.toString()
                            )
                          }
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handlePrintPayslip(employee.employeeId.toString())
                          }
                        >
                          <Printer className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleEmailPayslip(employee.employeeId.toString())
                          }
                        >
                          <Mail className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
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
    </div>
  )
}
