"use client"

import {
  IPayrollBankTransfer,
  IPayrollComponent,
  IPayrollEmployee,
  IPayrollPeriod,
  IPayrollTax,
} from "@/interfaces/payroll"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CurrencyFormatter } from "@/components/currencyicons/currency-formatter"

interface PayrollDashboardProps {
  payrollPeriodData: IPayrollPeriod[]
  payrollEmployeeData: IPayrollEmployee[]
  payrollComponentData: IPayrollComponent[]
  payrollTaxData: IPayrollTax[]
  payrollBankTransferData: IPayrollBankTransfer[]
}

export function PayrollDashboard({
  payrollPeriodData,
  payrollEmployeeData,
  payrollComponentData,
  payrollTaxData,
  payrollBankTransferData,
}: PayrollDashboardProps) {
  // Calculate metrics
  const totalPeriods = payrollPeriodData.length
  const activePeriods = payrollPeriodData.filter(
    (p) => p.isActive && !p.isClosed
  ).length
  const closedPeriods = payrollPeriodData.filter((p) => p.isClosed).length

  const totalEmployees = payrollEmployeeData.length
  const processedEmployees = payrollEmployeeData.filter(
    (e) => e.isProcessed
  ).length
  const paidEmployees = payrollEmployeeData.filter((e) => e.isPaid).length

  const totalEarnings = payrollEmployeeData.reduce(
    (sum, emp) => sum + emp.totalEarnings,
    0
  )
  const totalDeductions = payrollEmployeeData.reduce(
    (sum, emp) => sum + emp.totalDeductions,
    0
  )
  const totalNetSalary = payrollEmployeeData.reduce(
    (sum, emp) => sum + emp.netSalary,
    0
  )

  const totalComponents = payrollComponentData.length
  const earningComponents = payrollComponentData.filter(
    (c) => c.componentType === "EARNING"
  ).length
  const deductionComponents = payrollComponentData.filter(
    (c) => c.componentType === "DEDUCTION"
  ).length

  const totalTaxes = payrollTaxData.length
  const activeTaxes = payrollTaxData.filter((t) => t.isActive).length

  const totalBankTransfers = payrollBankTransferData.length
  const completedTransfers = payrollBankTransferData.filter(
    (t) => t.status === "COMPLETED"
  ).length
  const pendingTransfers = payrollBankTransferData.filter(
    (t) => t.status === "PENDING"
  ).length

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Payroll Periods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPeriods}</div>
          <p className="text-muted-foreground text-xs">
            {totalPeriods > 0
              ? `${activePeriods} active, ${closedPeriods} closed`
              : "No periods configured"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalEmployees}</div>
          <p className="text-muted-foreground text-xs">
            {totalEmployees > 0
              ? `${processedEmployees} processed, ${paidEmployees} paid`
              : "No employees assigned"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <CurrencyFormatter amount={totalEarnings} size="md" />
          </div>
          <p className="text-muted-foreground text-xs">
            <CurrencyFormatter amount={totalDeductions} size="sm" /> deductions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Salary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <CurrencyFormatter amount={totalNetSalary} size="md" />
          </div>
          <p className="text-muted-foreground text-xs">
            Total net salary for all employees
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Payroll Components
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalComponents}</div>
          <p className="text-muted-foreground text-xs">
            {totalComponents > 0
              ? `${earningComponents} earnings, ${deductionComponents} deductions`
              : "No components configured"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Tax Configurations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTaxes}</div>
          <p className="text-muted-foreground text-xs">
            {activeTaxes} active tax configurations
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bank Transfers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalBankTransfers}</div>
          <p className="text-muted-foreground text-xs">
            {completedTransfers} completed, {pendingTransfers} pending
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Processing Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalEmployees > 0
              ? Math.round((processedEmployees / totalEmployees) * 100)
              : 0}
            %
          </div>
          <p className="text-muted-foreground text-xs">
            {processedEmployees} of {totalEmployees} employees processed
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
