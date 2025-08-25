"use client"

import { useCallback } from "react"
import { IEmployeeAttendance } from "@/interfaces/attendance"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Hr_Attendance } from "@/lib/api-routes"
import { useGetByPath } from "@/hooks/use-common"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import MonthAutocomplete from "@/components/ui-custom/autocomplete-month"

import { AttendanceDashboard } from "./components/attendance-dashboard"
import { AttendanceTable } from "./components/attendance-table"

interface AttendancePageForm extends Record<string, unknown> {
  selectedMonth: string
}

export default function AttendancePage() {
  const form = useForm<AttendancePageForm>({
    defaultValues: {
      selectedMonth: new Date().toISOString().slice(0, 7), // Current month in YYYY-MM format
    },
  })

  const selectedMonth = form.watch("selectedMonth")

  // Fetch employees data with selected month
  const { data: employeesResponse, isLoading } =
    useGetByPath<IEmployeeAttendance>(
      Hr_Attendance.get,
      "employees",
      selectedMonth
    )

  const employees = employeesResponse?.data || []

  const handleMonthChange = useCallback(
    (selectedOption: { value: string; label: string } | null) => {
      if (selectedOption) {
        form.setValue("selectedMonth", selectedOption.value)
        toast.info(`Switched to ${selectedOption.label}`)
      }
    },
    [form]
  )

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="container mx-auto space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
              Attendance Management
            </h1>
            <p className="text-muted-foreground text-sm">
              Monitor and manage employee attendance records
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">
            Loading attendance data...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Attendance Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Monitor and manage employee attendance records
          </p>
        </div>
      </div>

      {/* Content */}
      <AttendanceDashboard employees={employees} />

      {/* Attendance Table Section */}
      <div className="space-y-4">
        {/* Table Header with Month Selector */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Attendance Records</h2>
          </div>
          <div className="flex items-center gap-4">
            <MonthAutocomplete
              form={form}
              name="selectedMonth"
              onChangeEvent={handleMonthChange}
              className="w-48"
            />
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                {employees.length} Employees
              </Badge>
            </div>
          </div>
        </div>

        {/* Attendance Table Card */}
        <Card>
          <CardContent className="p-0">
            <AttendanceTable
              employees={employees}
              selectedMonthYear={selectedMonth}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
