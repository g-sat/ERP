"use client"

import { useEffect, useState } from "react"
import {
  DollarSign,
  Download,
  FileText,
  Filter,
  Search,
  Users,
} from "lucide-react"

import { useGet } from "@/hooks/use-common"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CurrencyFormatter } from "@/components/currencyicons/currency-formatter"

interface EmployeeReportData {
  employeeName: string
  designationName: string
  employeeCode: string
  departmentName: string
  companyName: string
  joinDate: string
  noOfYear: number
  basicAllowance: number
  foodAllowance: number
  houseAllowance: number
  otherAllowances: number
  totalSalaryAmount: number
  workPermitNo: string
  personalNo: string
  bankName: string
  accountNo: string
  iban: string
}

export function EmployeeSalaryReport() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredData, setFilteredData] = useState<EmployeeReportData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch employee salary data from API
  const {
    data: salaryData,
    refetch,
    error,
  } = useGet<EmployeeReportData>(
    "hr/setting/employee-salary",
    "employee-salary",
    undefined
  )

  useEffect(() => {
    if (salaryData?.data) {
      setFilteredData(salaryData.data)
      setIsLoading(false)
    } else if (error) {
      // Handle API error - set empty data and stop loading
      setFilteredData([])
      setIsLoading(false)
    }
  }, [salaryData, error])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    if (!salaryData?.data) return

    const filtered = salaryData.data.filter(
      (employee: EmployeeReportData) =>
        employee.employeeName.toLowerCase().includes(value.toLowerCase()) ||
        employee.employeeCode.toLowerCase().includes(value.toLowerCase()) ||
        employee.departmentName.toLowerCase().includes(value.toLowerCase()) ||
        employee.designationName.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredData(filtered)
  }

  const handleExport = () => {
    // Create CSV content
    const headers = [
      "EmployeeName",
      "DesignationName",
      "EmployeeCode",
      "DepartmentName",
      "CompanyName",
      "JoinDate",
      "NoOfYear",
      "Basic Allowance",
      "Food Allowance",
      "House Allowance",
      "Other Allowances",
      "TotalSalaryAmount",
      "WorkPermitNo",
      "PersonalNo",
      "BankName",
      "AccountNo",
      "IBAN",
    ]

    const csvContent = [
      headers.join(","),
      ...filteredData.map((employee) =>
        [
          `"${employee.employeeName}"`,
          `"${employee.designationName}"`,
          `"${employee.employeeCode}"`,
          `"${employee.departmentName}"`,
          `"${employee.companyName}"`,
          `"${employee.joinDate}"`,
          employee.noOfYear,
          employee.basicAllowance,
          employee.foodAllowance,
          employee.houseAllowance,
          employee.otherAllowances,
          employee.totalSalaryAmount,
          `"${employee.workPermitNo}"`,
          `"${employee.personalNo}"`,
          `"${employee.bankName}"`,
          `"${employee.accountNo}"`,
          `"${employee.iban}"`,
        ].join(",")
      ),
    ].join("\n")

    // Download CSV file
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `employee-salary-report-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const totalEmployees = filteredData.length
  const totalSalary = filteredData.reduce(
    (sum, emp) => sum + emp.totalSalaryAmount,
    0
  )
  const avgSalary = totalEmployees > 0 ? totalSalary / totalEmployees : 0

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Employee Salary Report
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Comprehensive employee salary report with all components
            </p>
          </div>
        </div>
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="text-muted-foreground mt-2">Loading report data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header and Summary Stats in One Row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        {/* Header Section */}
        <div className="flex-1">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Employee Salary Report
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Comprehensive employee salary report with all components
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  refetch()
                  setSearchTerm("")
                }}
                className="w-full sm:w-auto"
              >
                <Filter className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={handleExport} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Summary Stats Section */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        <div className="bg-muted/30 flex items-center gap-3 rounded-lg border px-4 py-2">
          <Users className="text-muted-foreground h-4 w-4" />
          <div>
            <div className="text-sm font-medium">Total Employees</div>
            <div className="text-lg font-bold">{totalEmployees}</div>
          </div>
        </div>

        <div className="bg-muted/30 flex items-center gap-3 rounded-lg border px-4 py-2">
          <DollarSign className="text-muted-foreground h-4 w-4" />
          <div>
            <div className="text-sm font-medium">Total Salary</div>
            <div className="text-lg font-bold">
              <CurrencyFormatter amount={totalSalary} size="sm" />
            </div>
          </div>
        </div>

        <div className="bg-muted/30 flex items-center gap-3 rounded-lg border px-4 py-2">
          <FileText className="text-muted-foreground h-4 w-4" />
          <div>
            <div className="text-sm font-medium">Average Salary</div>
            <div className="text-lg font-bold">
              <CurrencyFormatter amount={avgSalary} size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="flex items-center space-x-2">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Report Table */}
      <div className="overflow-x-auto rounded-md border">
        <div className="min-w-[1200px] sm:min-w-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px] text-xs sm:text-sm">
                  Name
                </TableHead>
                <TableHead className="w-[140px] text-xs sm:text-sm">
                  Designation
                </TableHead>
                <TableHead className="w-[100px] text-xs sm:text-sm">
                  Code
                </TableHead>
                <TableHead className="w-[140px] text-xs sm:text-sm">
                  Department
                </TableHead>
                <TableHead className="hidden w-[120px] text-xs sm:text-sm md:table-cell">
                  Company
                </TableHead>
                <TableHead className="hidden w-[100px] text-xs sm:text-sm lg:table-cell">
                  Joining
                </TableHead>
                <TableHead className="hidden w-[80px] text-xs sm:text-sm lg:table-cell">
                  Years
                </TableHead>
                <TableHead className="w-[100px] text-xs sm:text-sm">
                  Basic
                </TableHead>
                <TableHead className="hidden w-[100px] text-xs sm:text-sm xl:table-cell">
                  Food
                </TableHead>
                <TableHead className="hidden w-[100px] text-xs sm:text-sm xl:table-cell">
                  House
                </TableHead>
                <TableHead className="hidden w-[100px] text-xs sm:text-sm xl:table-cell">
                  Other
                </TableHead>
                <TableHead className="w-[120px] text-xs font-semibold sm:text-sm">
                  Total
                </TableHead>
                <TableHead className="hidden w-[120px] text-xs sm:text-sm 2xl:table-cell">
                  Work Permit
                </TableHead>
                <TableHead className="hidden w-[120px] text-xs sm:text-sm 2xl:table-cell">
                  Personal No
                </TableHead>
                <TableHead className="hidden w-[120px] text-xs sm:text-sm 2xl:table-cell">
                  Bank
                </TableHead>
                <TableHead className="hidden w-[140px] text-xs sm:text-sm 2xl:table-cell">
                  Account
                </TableHead>
                <TableHead className="hidden w-[160px] text-xs sm:text-sm 2xl:table-cell">
                  IBAN
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={18} className="py-8 text-center">
                    <div className="text-center">
                      <p className="text-muted-foreground">
                        No employees found
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Try adjusting your search criteria
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((employee, index) => (
                  <TableRow key={`${employee.employeeCode}-${index}`}>
                    <TableCell className="text-xs font-medium sm:text-sm">
                      {employee.employeeName}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {employee.designationName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {employee.employeeCode}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {employee.departmentName}
                    </TableCell>
                    <TableCell className="hidden text-xs sm:text-sm md:table-cell">
                      {employee.companyName}
                    </TableCell>
                    <TableCell className="hidden text-xs sm:text-sm lg:table-cell">
                      {new Date(employee.joinDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="secondary" className="text-xs">
                        {employee.noOfYear} years
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <CurrencyFormatter
                        amount={employee.basicAllowance}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell className="hidden text-xs sm:text-sm xl:table-cell">
                      <CurrencyFormatter
                        amount={employee.foodAllowance}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell className="hidden text-xs sm:text-sm xl:table-cell">
                      <CurrencyFormatter
                        amount={employee.houseAllowance}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell className="hidden text-xs sm:text-sm xl:table-cell">
                      <CurrencyFormatter
                        amount={employee.otherAllowances}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell className="text-xs font-semibold sm:text-sm">
                      <CurrencyFormatter
                        amount={employee.totalSalaryAmount}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell className="hidden text-xs sm:text-sm 2xl:table-cell">
                      {employee.workPermitNo || "N/A"}
                    </TableCell>
                    <TableCell className="hidden text-xs sm:text-sm 2xl:table-cell">
                      {employee.personalNo || "N/A"}
                    </TableCell>
                    <TableCell className="hidden text-xs sm:text-sm 2xl:table-cell">
                      {employee.bankName || "N/A"}
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs 2xl:table-cell">
                      {employee.accountNo || "N/A"}
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs 2xl:table-cell">
                      {employee.iban || "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
