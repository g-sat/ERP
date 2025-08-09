"use client"

import { useState } from "react"
import { IEmployeeSalaryComponent } from "@/interfaces/payroll"
import {
  Calendar,
  DollarSign,
  Edit3,
  RefreshCw,
  TrendingUp,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CurrencyFormatter } from "@/components/currencyicons/currency-formatter"

import { EmployeeSalaryComponentsForm } from "../forms/employee-salary-components"

export function EmployeeSalaryDetailsTable({
  employeeSalaryDetails,
}: {
  employeeSalaryDetails: IEmployeeSalaryComponent[]
}) {
  const [editSalaryDialogOpen, setEditSalaryDialogOpen] = useState(false)

  const handleEditSalary = () => {
    setEditSalaryDialogOpen(true)
  }

  const handleCancelEdit = () => {
    setEditSalaryDialogOpen(false)
  }

  // Calculate totals from the array data
  const totalMonthly = employeeSalaryDetails?.reduce(
    (sum, component) => sum + (component.amount || 0),
    0
  )
  const totalAnnual = totalMonthly * 12

  // Group components by type (Earning/Deduction)
  const earnings = employeeSalaryDetails?.filter(
    (component) => component.componentType === "Earning"
  )
  const deductions = employeeSalaryDetails?.filter(
    (component) => component.componentType === "Deduction"
  )

  return (
    <div className="space-y-6 p-6">
      {/* Salary Summary */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">
                  Salary Details
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Comprehensive salary breakdown and components
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleEditSalary}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Revise
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
                <h3 className="text-sm font-medium">Annual Income</h3>
              </div>
              <p className="text-2xl font-bold">
                <CurrencyFormatter amount={totalAnnual} />
              </p>
              <p className="text-sm text-gray-500">per year</p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-medium">Monthly Income</h3>
              </div>
              <p className="text-2xl font-bold">
                <CurrencyFormatter amount={totalMonthly} />
              </p>
              <p className="text-sm text-gray-500">per month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary Components - Earnings */}
      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">
                  Salary Components
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Breakdown of earnings and allowances
                </p>
              </div>
            </div>
            <Badge variant="secondary">{earnings.length} Components</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4 py-3 font-medium">
                    SALARY COMPONENTS
                  </TableHead>
                  <TableHead className="w-1/4 py-3 font-medium">
                    CALCULATION TYPE
                  </TableHead>
                  <TableHead className="w-1/4 py-3 font-medium">
                    MONTHLY AMOUNT
                  </TableHead>
                  <TableHead className="w-1/4 py-3 font-medium">
                    ANNUAL AMOUNT
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.map((component) => (
                  <TableRow key={component.payrollComponentId}>
                    <TableCell className="py-3 font-medium">
                      {component.componentName}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge variant="outline" className="text-xs">
                        {component.componentType}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-right font-medium">
                      <CurrencyFormatter amount={component.amount || 0} />
                    </TableCell>
                    <TableCell className="py-3 text-right font-medium">
                      <CurrencyFormatter
                        amount={(component.amount || 0) * 12}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2">
                  <TableCell colSpan={2} className="py-3 text-lg font-bold">
                    Total Gross Pay
                  </TableCell>
                  <TableCell className="py-3 text-right text-lg font-bold">
                    <CurrencyFormatter amount={totalMonthly} />
                  </TableCell>
                  <TableCell className="py-3 text-right text-lg font-bold">
                    <CurrencyFormatter amount={totalAnnual} />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Other Deductions */}
      {deductions.length > 0 && (
        <Card>
          <CardHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">
                    Other Deductions
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Deductions and contributions
                  </p>
                </div>
              </div>
              <Badge variant="secondary">{deductions.length} Deductions</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3 py-3 font-medium">
                    DEDUCTION NAME
                  </TableHead>
                  <TableHead className="w-1/3 py-3 font-medium">
                    CALCULATION TYPE
                  </TableHead>
                  <TableHead className="w-1/3 py-3 text-right font-medium">
                    ACTIONS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deductions.map((component) => (
                  <TableRow key={component.payrollComponentId}>
                    <TableCell className="py-3 font-medium">
                      {component.componentName}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          Amount:{" "}
                          <CurrencyFormatter amount={component.amount || 0} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <Button variant="outline" size="sm">
                        <Edit3 className="mr-2 h-3 w-3" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Salary Revision History */}
      {/* <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">
                  Salary Revision History
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Historical salary changes and revisions
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4 py-3 font-medium">
                  PREVIOUS PAY
                </TableHead>
                <TableHead className="w-1/4 py-3 font-medium">
                  REVISED PAY
                </TableHead>
                <TableHead className="w-1/4 py-3 font-medium">
                  EFFECTIVE FROM
                </TableHead>
                <TableHead className="w-1/4 py-3 text-right font-medium">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaryRevisionHistory.map((revision) => (
                <TableRow key={revision.id}>
                  <TableCell className="py-3 font-medium">
                    {revision.previousPay ? (
                      <CurrencyFormatter amount={revision.previousPay} />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        <CurrencyFormatter amount={revision.revisedPay} />
                      </span>
                      {revision.percentageChange && (
                        <div className="flex items-center space-x-1">
                          <span className="text-sm text-red-600">
                            {revision.percentageChange}%
                          </span>
                          <Minus className="h-3 w-3 text-red-600" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    {revision.effectiveFrom}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-sm text-blue-600 cursor-pointer">
                        View Details
                      </span>
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200">
                        <Minus className="h-3 w-3 text-gray-600" />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card> */}

      {/* Edit Salary Dialog */}
      <Dialog
        open={editSalaryDialogOpen}
        onOpenChange={setEditSalaryDialogOpen}
      >
        <DialogContent
          className="max-h-[90vh] w-[80vw] !max-w-none overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="border-b p-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Edit3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  Revise Salary Components
                </DialogTitle>
                <p className="text-sm text-gray-600">
                  Revise employee salary structure and components
                </p>
              </div>
            </div>
          </DialogHeader>
          <div className="p-6">
            <EmployeeSalaryComponentsForm
              onCancel={handleCancelEdit}
              employeeSalaryDetails={employeeSalaryDetails}
              onSaveSuccess={() => setEditSalaryDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
