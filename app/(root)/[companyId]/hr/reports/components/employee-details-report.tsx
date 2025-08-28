"use client"

import { useEffect, useState } from "react"
import { Download, Filter, Search, Users } from "lucide-react"

import { useGet } from "@/hooks/use-common"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface EmployeeDetailsData {
  employeeName: string
  employeeCode: string
  designationName: string
  departmentName: string
  companyName: string
  joinDate: string
  email: string
  phone: string
  address: string
  status: string
}

export function EmployeeDetailsReport() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredData, setFilteredData] = useState<EmployeeDetailsData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch employee details data from API
  const { data: detailsData, refetch } = useGet<EmployeeDetailsData>(
    "hr/employee-details",
    "employee-details",
    undefined
  )

  useEffect(() => {
    if (detailsData?.data) {
      setFilteredData(detailsData.data)
      setIsLoading(false)
    }
  }, [detailsData])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    if (!detailsData?.data) return

    const filtered = detailsData.data.filter(
      (employee: EmployeeDetailsData) =>
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
      "EmployeeCode",
      "DesignationName",
      "DepartmentName",
      "CompanyName",
      "JoinDate",
      "Email",
      "Phone",
      "Address",
      "Status",
    ]

    const csvContent = [
      headers.join(","),
      ...filteredData.map((employee) =>
        [
          `"${employee.employeeName}"`,
          `"${employee.employeeCode}"`,
          `"${employee.designationName}"`,
          `"${employee.departmentName}"`,
          `"${employee.companyName}"`,
          `"${employee.joinDate}"`,
          `"${employee.email}"`,
          `"${employee.phone}"`,
          `"${employee.address}"`,
          `"${employee.status}"`,
        ].join(",")
      ),
    ].join("\n")

    // Download CSV file
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `employee-details-report-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const totalEmployees = filteredData.length

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Employee Details Report
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Comprehensive employee details report
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
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Employee Details Report
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Comprehensive employee details report
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

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">
              {totalEmployees}
            </div>
            <p className="text-muted-foreground text-xs">
              Active employees in report
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input
                placeholder="Search by name, code, department, or designation..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8 text-sm sm:text-base"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Employee Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <div className="min-w-[1000px] sm:min-w-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px] text-xs sm:text-sm">
                      Name
                    </TableHead>
                    <TableHead className="w-[100px] text-xs sm:text-sm">
                      Code
                    </TableHead>
                    <TableHead className="w-[140px] text-xs sm:text-sm">
                      Designation
                    </TableHead>
                    <TableHead className="hidden w-[140px] text-xs sm:text-sm md:table-cell">
                      Department
                    </TableHead>
                    <TableHead className="hidden w-[120px] text-xs sm:text-sm lg:table-cell">
                      Company
                    </TableHead>
                    <TableHead className="hidden w-[100px] text-xs sm:text-sm lg:table-cell">
                      Join Date
                    </TableHead>
                    <TableHead className="hidden w-[180px] text-xs sm:text-sm xl:table-cell">
                      Email
                    </TableHead>
                    <TableHead className="hidden w-[120px] text-xs sm:text-sm xl:table-cell">
                      Phone
                    </TableHead>
                    <TableHead className="w-[100px] text-xs sm:text-sm">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-8 text-center">
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
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {employee.employeeCode}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {employee.designationName}
                        </TableCell>
                        <TableCell className="hidden text-xs sm:text-sm md:table-cell">
                          {employee.departmentName}
                        </TableCell>
                        <TableCell className="hidden text-xs sm:text-sm lg:table-cell">
                          {employee.companyName}
                        </TableCell>
                        <TableCell className="hidden text-xs sm:text-sm lg:table-cell">
                          {employee.joinDate}
                        </TableCell>
                        <TableCell className="hidden text-xs sm:text-sm xl:table-cell">
                          {employee.email || "N/A"}
                        </TableCell>
                        <TableCell className="hidden text-xs sm:text-sm xl:table-cell">
                          {employee.phone || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              employee.status === "Active"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {employee.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
