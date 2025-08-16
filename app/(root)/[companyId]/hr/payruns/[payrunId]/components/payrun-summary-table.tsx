"use client"

import { useState } from "react"
import { ICompanyLookup, IDepartmentLookup } from "@/interfaces/lookup"
import { IPayrollEmployeeHd } from "@/interfaces/payrun"
import { UseFormReturn } from "react-hook-form"

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

interface PayRunSummaryTableProps {
  employees: IPayrollEmployeeHd[]
  onEmployeeClick?: (employee: IPayrollEmployeeHd) => void
}

export function PayRunSummaryTable({
  employees,
  onEmployeeClick,
}: PayRunSummaryTableProps) {
  const [selectedCompany, setSelectedCompany] = useState<ICompanyLookup | null>(
    null
  )
  const [selectedDepartment, setSelectedDepartment] =
    useState<IDepartmentLookup | null>(null)

  // Mock form object for autocomplete components
  const mockForm = {} as UseFormReturn<Record<string, unknown>>

  console.log("employees in summary table", employees)

  // Ensure employees is always an array
  const employeesArray = employees || []

  const filteredEmployees = employeesArray.filter((employee) => {
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
              <h3 className="text-base font-semibold">Employee Summary</h3>
              <Badge variant="outline">
                {filteredEmployees.length} employees
              </Badge>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex items-center space-x-4">
            <div className="w-48">
              <CompanyAutocomplete
                form={mockForm}
                label=""
                onChangeEvent={(company) => setSelectedCompany(company)}
                className="w-full"
              />
            </div>

            <div className="w-48">
              <DepartmentAutocomplete
                form={mockForm}
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
                <TableHead>NET SALARY</TableHead>
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
                    <span className="font-medium">
                      {employee.employeeName} [{employee.employeeCode}] |{" "}
                      {employee.departmentName || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <CurrencyFormatter amount={employee.netSalary} />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="default"
                      className={
                        employee.isRejected
                          ? "border-red-200 bg-red-100 text-red-800"
                          : employee.isSubmitted && employee.isPaid
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                      }
                    >
                      {employee.isRejected
                        ? "REJECTED"
                        : employee.isSubmitted && employee.isPaid
                          ? "PAID"
                          : "APPROVED"}
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
                      View
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
