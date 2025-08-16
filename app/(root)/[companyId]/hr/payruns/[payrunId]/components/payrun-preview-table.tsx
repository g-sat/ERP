"use client"

import { useState } from "react"
import { ICompanyLookup, IDepartmentLookup } from "@/interfaces/lookup"
import { IPayrollEmployeeHd } from "@/interfaces/payrun"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CurrencyFormatter } from "@/components/currencyicons/currency-formatter"
import CompanyAutocomplete from "@/components/ui-custom/autocomplete-company"
import DepartmentAutocomplete from "@/components/ui-custom/autocomplete-department"

interface PayRunPreviewTableProps {
  employees: IPayrollEmployeeHd[]
  onEmployeeClick?: (employee: IPayrollEmployeeHd) => void
}

export function PayRunPreviewTable({
  employees,
  onEmployeeClick,
}: PayRunPreviewTableProps) {
  const [selectedCompany, setSelectedCompany] = useState<ICompanyLookup | null>(
    null
  )
  const [selectedDepartment, setSelectedDepartment] =
    useState<IDepartmentLookup | null>(null)

  console.log("employees in preview table", employees)

  const filteredEmployees = employees.filter((employee) => {
    // Company filter
    const matchesCompany =
      !selectedCompany || employee.companyId === selectedCompany.companyId

    // Department filter
    const matchesDepartment =
      !selectedDepartment ||
      employee.departmentId === selectedDepartment.departmentId

    return matchesCompany && matchesDepartment
  })

  return (
    <Card>
      <CardContent className="p-0">
        {/* Header */}
        <div className="border-b p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-semibold">Employee Preview</h3>
              <Badge variant="outline">
                {filteredEmployees.length} employees
              </Badge>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex items-center space-x-4">
            <div className="w-48">
              <CompanyAutocomplete
                form={{} as any}
                label=""
                onChangeEvent={(company) => setSelectedCompany(company)}
                className="w-full"
              />
            </div>

            <div className="w-48">
              <DepartmentAutocomplete
                form={{} as any}
                label=""
                onChangeEvent={(department) =>
                  setSelectedDepartment(department)
                }
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>COMPANY</TableHead>
                <TableHead>EMPLOYEE</TableHead>
                <TableHead>BASIC SALARY</TableHead>
                <TableHead>PRESENT DAYS</TableHead>
                <TableHead>GROSS SALARY</TableHead>
                <TableHead>DEDUCTIONS</TableHead>
                <TableHead>NET SALARY</TableHead>
                <TableHead>REMARKS</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow
                  key={employee.payrollEmployeeId}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => onEmployeeClick?.(employee)}
                >
                  <TableCell>{employee.companyName || "N/A"}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{employee.employeeName}</p>
                      <p className="text-muted-foreground text-sm">
                        [{employee.employeeCode}] |{" "}
                        {employee.departmentName || "N/A"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <CurrencyFormatter amount={employee.basicSalary} />
                  </TableCell>
                  <TableCell>{employee.presentDays}</TableCell>
                  <TableCell>
                    <CurrencyFormatter amount={employee.totalEarnings} />
                  </TableCell>
                  <TableCell>
                    <CurrencyFormatter amount={employee.totalDeductions} />
                  </TableCell>
                  <TableCell>
                    <CurrencyFormatter amount={employee.netSalary} />
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {employee.remarks || "No remarks"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800"
                    >
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEmployeeClick?.(employee)
                      }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
