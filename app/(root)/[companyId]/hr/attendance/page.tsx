"use client"

import { useCallback, useState } from "react"
import { IEmployeeAttendance } from "@/interfaces/attendance"
import { Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Hr_Attendance } from "@/lib/api-routes"
import { useGetByPath } from "@/hooks/use-common"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import MonthAutocomplete from "@/components/ui-custom/autocomplete-month"

import { AttendanceBulkForm } from "./components/attendance-form-bulk"
import { AttendanceSingleForm } from "./components/attendance-form-single"
import { AttendanceTable } from "./components/attendance-table"

interface AttendancePageForm extends Record<string, unknown> {
  selectedMonth: string
}

export default function AttendancePage() {
  const [isBulkFormOpen, setIsBulkFormOpen] = useState(false)
  const [isSingleFormOpen, setIsSingleFormOpen] = useState(false)

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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {employees.length} Employees
            </Badge>
            <MonthAutocomplete
              form={form}
              name="selectedMonth"
              onChangeEvent={handleMonthChange}
              className="w-48"
            />
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSingleFormOpen(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Attendance
            </Button>
            <Button
              size="sm"
              onClick={() => setIsBulkFormOpen(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Bulk Attendance
            </Button>
          </div>
        </div>
      </div>

      {/* Attendance Table Section */}
      <div className="space-y-4">
        <AttendanceTable
          employees={employees}
          selectedMonthYear={selectedMonth}
        />
      </div>

      {/* Bulk Attendance Form Dialog */}
      <AttendanceBulkForm
        open={isBulkFormOpen}
        onOpenChange={setIsBulkFormOpen}
      />

      {/* Single Attendance Form Dialog */}
      <AttendanceSingleForm
        open={isSingleFormOpen}
        onOpenChange={setIsSingleFormOpen}
      />
    </div>
  )
}
