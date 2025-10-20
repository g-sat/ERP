"use client"

import { useEffect, useState } from "react"
import { ICompanyLookup, IDepartmentLookup } from "@/interfaces/lookup"
import { IPayrollEmployeeHd } from "@/interfaces/payrun"
import { Edit } from "lucide-react"
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
import {
  CompanyAutocomplete,
  DepartmentAutocomplete,
} from "@/components/autocomplete"

interface PayRunPreviewTableProps {
  employees: IPayrollEmployeeHd[]
  onEmployeeClick?: (employee: IPayrollEmployeeHd) => void
}

export function PayRunPreviewTable({
  employees,
  onEmployeeClick,
}: PayRunPreviewTableProps) {
  console.log(
    "🔄 PayRunPreviewTable: Component rendered with employees:",
    employees
  )

  // Helper function for number formatting without currency symbol
  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0)
  }

  const [selectedCompany, setSelectedCompany] = useState<ICompanyLookup | null>(
    null
  )
  const [selectedDepartment, setSelectedDepartment] =
    useState<IDepartmentLookup | null>(null)
  const [filteredEmployees, setFilteredEmployees] = useState<
    IPayrollEmployeeHd[]
  >([])

  // Mock form object for autocomplete components
  const mockForm = {} as UseFormReturn<Record<string, unknown>>

  useEffect(() => {
    console.log(
      "🔄 PayRunPreviewTable: useEffect triggered - filtering employees"
    )
    if (employees && employees.length > 0) {
      const filtered = employees.filter((employee) => {
        // Company filter
        const matchesCompany =
          !selectedCompany || employee.companyId === selectedCompany.companyId

        // Department filter
        const matchesDepartment =
          !selectedDepartment ||
          employee.departmentId === selectedDepartment.departmentId

        return matchesCompany && matchesDepartment
      })
      console.log("🔍 PayRunPreviewTable: Filtered employees:", filtered)
      setFilteredEmployees(filtered)
    }
  }, [employees, selectedCompany, selectedDepartment])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="bg-background border-b p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-semibold">Employee Preview</h3>
            <Badge variant="outline">
              {filteredEmployees.length} employees
            </Badge>
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
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        <TooltipProvider>
          <div className="h-full overflow-x-auto rounded-lg border">
            {/* Header table */}
            <Table className="w-full table-fixed border-collapse">
              <colgroup>
                <col className="w-[140px] min-w-[120px]" />
                <col className="w-[220px] min-w-[180px]" />
                <col className="w-[130px] min-w-[110px]" />
                <col className="w-[110px] min-w-[90px]" />
                <col className="w-[130px] min-w-[110px]" />
                <col className="w-[130px] min-w-[110px]" />
                <col className="w-[130px] min-w-[110px]" />
                <col className="w-[160px] min-w-[130px]" />
                <col className="w-[110px] min-w-[90px]" />
                <col className="w-[60px] min-w-[50px]" />
              </colgroup>
              <TableHeader className="bg-background sticky top-0 z-20">
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[140px] min-w-[120px]">
                    COMPANY
                  </TableHead>
                  <TableHead className="w-[220px] min-w-[180px]">
                    EMPLOYEE
                  </TableHead>
                  <TableHead className="w-[130px] min-w-[110px] text-right">
                    BASIC SALARY
                  </TableHead>
                  <TableHead className="w-[110px] min-w-[90px]">
                    PRESENT DAYS
                  </TableHead>
                  <TableHead className="w-[130px] min-w-[110px] text-right">
                    GROSS SALARY
                  </TableHead>
                  <TableHead className="w-[130px] min-w-[110px] text-right">
                    DEDUCTIONS
                  </TableHead>
                  <TableHead className="w-[130px] min-w-[110px] text-right">
                    NET SALARY
                  </TableHead>
                  <TableHead className="w-[160px] min-w-[130px]">
                    REMARKS
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
                  <col className="w-[220px] min-w-[180px]" />
                  <col className="w-[130px] min-w-[110px]" />
                  <col className="w-[110px] min-w-[90px]" />
                  <col className="w-[130px] min-w-[110px]" />
                  <col className="w-[130px] min-w-[110px]" />
                  <col className="w-[130px] min-w-[110px]" />
                  <col className="w-[160px] min-w-[130px]" />
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
                              <p className="text-xs font-medium">
                                {employee.employeeName}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                [{employee.employeeCode}] |{" "}
                                {employee.departmentName || "N/A"}
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{employee.employeeName}</p>
                            <p>
                              [{employee.employeeCode}] |{" "}
                              {employee.departmentName || "N/A"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="py-1">
                        <div className="text-right text-xs">
                          {formatNumber(employee.basicSalary || 0)}
                        </div>
                      </TableCell>
                      <TableCell className="py-1">
                        <div className="text-center text-xs">
                          {employee.presentDays}
                        </div>
                      </TableCell>
                      <TableCell className="py-1">
                        <div className="text-right text-xs">
                          {formatNumber(employee.totalEarnings || 0)}
                        </div>
                      </TableCell>
                      <TableCell className="py-1">
                        <div className="text-right text-xs">
                          {formatNumber(employee.totalDeductions || 0)}
                        </div>
                      </TableCell>
                      <TableCell className="py-1">
                        <div className="text-right text-xs">
                          {formatNumber(employee.netSalary || 0)}
                        </div>
                      </TableCell>
                      <TableCell className="py-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-muted-foreground truncate text-xs">
                              {employee.remarks || "No remarks"}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{employee.remarks || "No remarks"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="py-1">
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-xs text-yellow-800"
                        >
                          {employee.status}
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
                          <Edit className="h-4 w-4" />
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
