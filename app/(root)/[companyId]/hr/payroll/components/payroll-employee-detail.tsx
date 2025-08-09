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
              Employee ID
            </p>
            <p className="text-lg font-semibold">{employee.employeeId}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Payroll Period ID
            </p>
            <p className="text-lg font-semibold">{employee.payrollPeriodId}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Payroll Employee ID
            </p>
            <p className="text-lg">{employee.payrollEmployeeId}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">Status</p>
            <p className="text-lg">{getStatusBadge()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Salary Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Earnings</span>
              <span className="text-green-600">
                <CurrencyFormatter amount={employee.totalEarnings} size="md" />
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
            <Separator />
            <div className="flex justify-between text-xl font-bold">
              <span>Net Salary</span>
              <span className="text-blue-600">
                <CurrencyFormatter amount={employee.netSalary} size="lg" />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
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
