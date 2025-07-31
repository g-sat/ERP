"use client"

import { IPayrollEmployee } from "@/interfaces/payroll"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CurrencyFormatter } from "@/components/currencyicons/currency-formatter"

interface PayrollEmployeeDetailProps {
  employee: IPayrollEmployee | undefined
}

export function PayrollEmployeeDetail({
  employee,
}: PayrollEmployeeDetailProps) {
  if (!employee) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No employee selected</p>
      </div>
    )
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusBadge = () => {
    if (employee.isPaid) {
      return <Badge variant="default">Paid</Badge>
    } else if (employee.isProcessed) {
      return <Badge variant="secondary">Processed</Badge>
    } else {
      return <Badge variant="outline">Pending</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Employee Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Employee Information
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Employee Code
            </p>
            <p className="text-lg font-semibold">{employee.employeeCode}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Employee Name
            </p>
            <p className="text-lg font-semibold">{employee.employeeName}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Department
            </p>
            <p className="text-lg">{employee.departmentName}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Payroll Period
            </p>
            <p className="text-lg">{employee.periodName}</p>
          </div>
        </CardContent>
      </Card>

      {/* Salary Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Earnings */}
          <div>
            <h4 className="mb-2 font-semibold text-green-600">Earnings</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Basic Salary</span>
                <span className="font-medium">
                  <CurrencyFormatter amount={employee.basicSalary} size="sm" />
                </span>
              </div>
              <div className="flex justify-between">
                <span>Housing Allowance</span>
                <span className="font-medium">
                  <CurrencyFormatter
                    amount={employee.housingAllowance}
                    size="sm"
                  />
                </span>
              </div>
              <div className="flex justify-between">
                <span>Transport Allowance</span>
                <span className="font-medium">
                  <CurrencyFormatter
                    amount={employee.transportAllowance}
                    size="sm"
                  />
                </span>
              </div>
              <div className="flex justify-between">
                <span>Other Allowances</span>
                <span className="font-medium">
                  <CurrencyFormatter
                    amount={employee.otherAllowances}
                    size="sm"
                  />
                </span>
              </div>
              <div className="flex justify-between">
                <span>Overtime Pay</span>
                <span className="font-medium">
                  <CurrencyFormatter
                    amount={employee.overtimeAmount || 0}
                    size="sm"
                  />
                </span>
              </div>
              <div className="flex justify-between">
                <span>Bonus Amount</span>
                <span className="font-medium">
                  <CurrencyFormatter
                    amount={employee.bonusAmount || 0}
                    size="sm"
                  />
                </span>
              </div>
              <div className="flex justify-between">
                <span>Commission</span>
                <span className="font-medium">
                  <CurrencyFormatter
                    amount={employee.commissionAmount || 0}
                    size="sm"
                  />
                </span>
              </div>
              <div className="flex justify-between">
                <span>Other Earnings</span>
                <span className="font-medium">
                  <CurrencyFormatter
                    amount={employee.otherEarnings || 0}
                    size="sm"
                  />
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Earnings</span>
                <span className="text-green-600">
                  <CurrencyFormatter
                    amount={employee.totalEarnings}
                    size="md"
                  />
                </span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h4 className="mb-2 font-semibold text-red-600">Deductions</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Social Insurance</span>
                <span className="font-medium">
                  <CurrencyFormatter
                    amount={employee.socialInsurance}
                    size="sm"
                  />
                </span>
              </div>
              <div className="flex justify-between">
                <span>Leave Deduction</span>
                <span className="font-medium">
                  <CurrencyFormatter
                    amount={employee.leaveDeduction || 0}
                    size="sm"
                  />
                </span>
              </div>
              <div className="flex justify-between">
                <span>Late Deduction</span>
                <span className="font-medium">
                  <CurrencyFormatter
                    amount={employee.lateDeduction || 0}
                    size="sm"
                  />
                </span>
              </div>
              <div className="flex justify-between">
                <span>Other Deductions</span>
                <span className="font-medium">
                  <CurrencyFormatter
                    amount={employee.otherDeductions || 0}
                    size="sm"
                  />
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Deductions</span>
                <span className="text-red-600">
                  <CurrencyFormatter
                    amount={employee.totalDeductions}
                    size="md"
                  />
                </span>
              </div>
            </div>
          </div>

          {/* Net Salary */}
          <div className="border-t-2 pt-4">
            <div className="flex justify-between text-xl font-bold">
              <span>Net Salary</span>
              <span className="text-blue-600">
                <CurrencyFormatter amount={employee.netSalary} size="lg" />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Overtime Hours
            </p>
            <p className="text-lg">{employee.overtimeHours || 0} hours</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Overtime Rate
            </p>
            <p className="text-lg">
              <CurrencyFormatter
                amount={employee.overtimeRate || 0}
                size="sm"
              />
              /hour
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Payment Method
            </p>
            <p className="text-lg">{employee.paymentMethod || "N/A"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Bank Transfer Ref
            </p>
            <p className="text-lg">{employee.bankTransferRef || "N/A"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Processing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Processed Date
            </p>
            <p className="text-lg">
              {employee.processedDate
                ? formatDate(employee.processedDate)
                : "Not processed"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Processed By
            </p>
            <p className="text-lg">{employee.processedBy || "N/A"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Paid Date
            </p>
            <p className="text-lg">
              {employee.paidDate ? formatDate(employee.paidDate) : "Not paid"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">Paid By</p>
            <p className="text-lg">{employee.paidBy || "N/A"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Remarks */}
      {employee.remarks && (
        <Card>
          <CardHeader>
            <CardTitle>Remarks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{employee.remarks}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
