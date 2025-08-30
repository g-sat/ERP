"use client"

import { useState } from "react"
import { ICompanyLookup, IDepartmentLookup } from "@/interfaces/lookup"
import { IPayrollEmployeeHd } from "@/interfaces/payrun"
import { Eye } from "lucide-react"
import { UseFormReturn } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="bg-background border-b p-4">
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
              onChangeEvent={(department) => setSelectedDepartment(department)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        <TooltipProvider>
          <div className="h-full overflow-x-auto rounded-lg border">
            {/* Header table */}
            <Table className="w-full table-fixed border-collapse">
              <colgroup>
                <col className="w-[140px] min-w-[120px]" />
                <col className="w-[280px] min-w-[240px]" />
                <col className="w-[130px] min-w-[110px]" />
                <col className="w-[130px] min-w-[110px]" />
                <col className="w-[110px] min-w-[90px]" />
                <col className="w-[60px] min-w-[50px]" />
              </colgroup>
              <TableHeader className="bg-background sticky top-0 z-20">
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[140px] min-w-[120px]">
                    COMPANY
                  </TableHead>
                  <TableHead className="w-[280px] min-w-[240px]">
                    EMPLOYEE
                  </TableHead>
                  <TableHead className="w-[130px] min-w-[110px]">
                    BASIC
                  </TableHead>
                  <TableHead className="w-[130px] min-w-[110px]">
                    NET SALARY
                  </TableHead>
                  <TableHead className="w-[110px] min-w-[90px]">
                    STATUS
                  </TableHead>
                  <TableHead className="w-[60px] min-w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
            </Table>

            {/* Scrollable body table */}
            <div
              className="overflow-y-auto"
              style={{ height: "calc(100vh - 200px)" }}
            >
              <Table className="w-full table-fixed border-collapse">
                <colgroup>
                  <col className="w-[140px] min-w-[120px]" />
                  <col className="w-[280px] min-w-[240px]" />
                  <col className="w-[130px] min-w-[110px]" />
                  <col className="w-[130px] min-w-[110px]" />
                  <col className="w-[110px] min-w-[90px]" />
                  <col className="w-[60px] min-w-[50px]" />
                </colgroup>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow
                      key={employee.payrollEmployeeId}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => onEmployeeClick?.(employee)}
                    >
                      <TableCell className="bg-background sticky left-0 z-10 py-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate text-xs">
                              {employee.companyName || "N/A"}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{employee.companyName || "N/A"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="py-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate">
                              <span className="text-xs font-medium">
                                {employee.employeeName} [{employee.employeeCode}
                                ] | {employee.departmentName || "N/A"}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {employee.employeeName} [{employee.employeeCode}]
                              | {employee.departmentName || "N/A"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="py-1">
                        <div className="text-xs">
                          <CurrencyFormatter
                            amount={employee.basicSalary}
                            className="text-xs"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="py-1">
                        <div className="text-xs">
                          <CurrencyFormatter
                            amount={employee.netSalary}
                            className="text-xs"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="py-1">
                        <Badge
                          variant="default"
                          className={
                            employee.isRejected
                              ? "border-red-200 bg-red-100 text-xs text-red-800"
                              : employee.isSubmitted && employee.isPaid
                                ? "bg-green-100 text-xs text-green-800"
                                : "bg-blue-100 text-xs text-blue-800"
                          }
                        >
                          {employee.isRejected
                            ? "REJECTED"
                            : employee.isSubmitted && employee.isPaid
                              ? "PAID"
                              : "APPROVED"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEmployeeClick?.(employee)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TooltipProvider>
      </div>
    </div>
  )
}
