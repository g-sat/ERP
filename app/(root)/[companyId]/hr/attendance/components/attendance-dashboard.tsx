"use client"

import { useState } from "react"
import {
  IActualAttendanceEmployee,
  IAttendance,
  IDailyRecord,
  IEmployeeAttendance,
} from "@/interfaces/attendance"
import { IEmployee } from "@/interfaces/employee"
import { ICompanyLookup } from "@/interfaces/lookup"
import { CheckCircle, Clock, Users, XCircle } from "lucide-react"
import { useForm } from "react-hook-form"

import { Employee, Hr_Attendance } from "@/lib/api-routes"
import { useGet, useGetByPath } from "@/hooks/use-common"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import CompanyAutocomplete from "@/components/ui-custom/autocomplete-company"

import { AttendanceGrid } from "./attendance-grid"

export function AttendanceDashboard() {
  const form = useForm<{ companyId: number; monthYear: string }>()
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>("")

  // Get current date in yyyy-MM-dd format
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, "0")

  // Generate month-year options for the last 12 months
  const monthYearOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    return {
      value: `${year}-${month}`,
      label: `${date.toLocaleDateString("en-US", { month: "long" })} ${year}`,
    }
  })

  // Set default month-year to current month if not set
  const currentMonthYear = selectedMonthYear || `${yyyy}-${mm}`

  // Use useGetByParams hook to fetch attendance data
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useGetByPath<IActualAttendanceEmployee>(
    Hr_Attendance.get,
    "attendance",
    `${currentMonthYear}-01`,
    ""
  )

  // Fetch all employees
  const { data: employeesResponse, isLoading: isLoadingEmployees } =
    useGet<IEmployee>(Employee.get, "employees", "")

  // Convert API response to the expected format
  const convertAttendanceData = (
    rawData: IActualAttendanceEmployee[]
  ): IAttendance[] => {
    const converted: IAttendance[] = []

    rawData.forEach((employee) => {
      // Check if dailyRecords exists and is an object
      if (employee.dailyRecords && typeof employee.dailyRecords === "object") {
        // Iterate through each day in dailyRecords
        Object.entries(employee.dailyRecords).forEach(
          ([day, record]: [string, IDailyRecord]) => {
            // Ensure day is properly formatted as 2-digit string
            // Handle both "1" and "01" formats from API
            const dayNum = parseInt(day, 10)
            const dayStr = dayNum.toString().padStart(2, "0")
            const date = `${currentMonthYear}-${dayStr}`

            converted.push({
              id: `${employee.employeeId}-${day}`,
              employeeId: employee.employeeId.toString(),
              employeeName: employee.employeeName,
              companyId: employee.companyId,
              companyName: employee.companyName,
              employeePhoto: employee.photo,
              date: date,
              status: record.status,
              clockIn: record.clockIn || undefined,
              clockOut: record.clockOut || undefined,
              totalWorkingHours: record.workingHours || undefined,
              earlyOutHours: record.earlyOutHours || undefined,
              lateInHours: record.lateInHours || undefined,
              isBiometric:
                record.biometric === "Yes" || record.biometric === true,
              isPhysical: record.physical === "Yes" || record.physical === true,
              createdDate: "2021-01-01T00:00:00Z",
              editDate: "2021-01-01T00:00:00Z",
            })
          }
        )
      }
    })

    return converted
  }

  // Extract attendance data and employees from API response
  const attendanceData = apiResponse?.data
    ? convertAttendanceData(apiResponse.data)
    : []

  // Get all employees from the employee API
  const allEmployees = employeesResponse?.data || []

  // Create employee attendance objects from all employees
  const employees: IEmployeeAttendance[] = allEmployees.map(
    (emp: IEmployee) => ({
      employeeId: emp.employeeId.toString(),
      employeeName: emp.employeeName?.trim() || "",
      companyId: emp.companyId,
      companyName: emp.companyName || "",
      employeePhoto: emp.photo,
      department: emp.departmentName,
      location: "",
    })
  )

  // Filter employees by selected company
  const filteredEmployees = selectedCompany
    ? employees.filter((emp) => emp.companyId.toString() === selectedCompany)
    : employees

  // Filter attendance data by selected company
  const filteredAttendance = selectedCompany
    ? attendanceData.filter(
        (att) => att.companyId.toString() === selectedCompany
      )
    : attendanceData

  // Handle company selection
  const handleCompanyChange = (company: ICompanyLookup | null) => {
    setSelectedCompany(company ? company.companyId.toString() : null)
  }

  // Handle month-year selection
  const handleMonthYearChange = (value: string) => {
    setSelectedMonthYear(value)
  }

  // Calculate summary statistics
  const summaryStats = {
    totalEmployees: filteredEmployees.length,
    presentToday: filteredAttendance.filter(
      (att: IAttendance) => att.status === "P"
    ).length,
    absentToday:
      filteredEmployees.length -
      filteredAttendance.filter((att: IAttendance) => att.status === "P")
        .length,
    biometricCount: attendanceData.filter((att: IAttendance) => att.isBiometric)
      .length,
    physicalCount: attendanceData.filter((att: IAttendance) => att.isPhysical)
      .length,
  }

  return (
    <div className="@container flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Employee Attendance
          </h1>
          <p className="text-muted-foreground">
            Manage and track employee attendance records
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <CompanyAutocomplete
                form={form}
                name="companyId"
                label="Filter by Company"
                onChangeEvent={handleCompanyChange}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Month & Year</label>
              <Select
                value={currentMonthYear}
                onValueChange={handleMonthYearChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select month and year" />
                </SelectTrigger>
                <SelectContent>
                  {monthYearOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-muted-foreground text-sm font-medium">
              Total Employees
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold">
            {summaryStats.totalEmployees}
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-muted-foreground text-sm font-medium">
              Present Today
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-green-600">
            {summaryStats.presentToday}
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="text-muted-foreground text-sm font-medium">
              Absent Today
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600">
            {summaryStats.absentToday}
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-purple-600" />
            <span className="text-muted-foreground text-sm font-medium">
              Physical Records
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-600">
            {summaryStats.physicalCount}
          </div>
        </div>
      </div>

      {/* Attendance Grid */}
      {isLoading || isLoadingEmployees ? (
        <div className="py-8 text-center">Loading attendance data...</div>
      ) : error ? (
        <div className="py-8 text-center text-red-600">
          {error instanceof Error
            ? error.message
            : "Failed to fetch attendance data"}
        </div>
      ) : (
        <AttendanceGrid
          employees={filteredEmployees}
          attendanceData={filteredAttendance}
          selectedMonthYear={currentMonthYear}
        />
      )}
    </div>
  )
}
