"use client"

import { useEffect, useState } from "react"
import { AttendanceFormValue, attendanceFormSchema } from "@/schemas/attendance"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calendar, CheckSquare, Square, User } from "lucide-react"
import { useForm } from "react-hook-form"

import { Hr_Attendance } from "@/lib/api-routes"
import { usePersist } from "@/hooks/use-common"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormItem, FormMessage } from "@/components/ui/form"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import EmployeeAutocomplete from "@/components/ui-custom/autocomplete-employee"
import MonthAutocomplete from "@/components/ui-custom/autocomplete-month"
import { CustomDateNew } from "@/components/ui-custom/custom-date-new"

interface SingleAttendanceData {
  date: string // YYYY-MM-DD
  isPresent: boolean
}

interface AttendanceFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Utility to format date -> YYYY-MM-DD (no time)
const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Utility to format month -> YYYY-MM
const formatMonth = (date: Date) => {
  return formatDate(date).substring(0, 7)
}

// Generate dates between fromDate and toDate
const generateDateRange = (fromDate: string, toDate: string): string[] => {
  const dates: string[] = []
  const start = new Date(fromDate)
  const end = new Date(toDate)

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(formatDate(d))
  }

  return dates
}

export function AttendanceSingleForm({
  open,
  onOpenChange,
}: AttendanceFormProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null
  )
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(
    formatMonth(new Date())
  )
  const [fromDate, setFromDate] = useState<string>(formatDate(new Date()))
  const [toDate, setToDate] = useState<string>(formatDate(new Date()))
  const [attendanceData, setAttendanceData] = useState<SingleAttendanceData[]>(
    []
  )

  // Single attendance save hook
  const saveAttendance = usePersist<AttendanceFormValue[]>(
    Hr_Attendance.saveBulk
  )

  const form = useForm<{
    employeeId: number
    date: string
    isPresent: boolean
    fromDate: string
    toDate: string
  }>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      employeeId: 0,
      isPresent: false,
      date: formatDate(new Date()),
      fromDate: formatDate(new Date()),
      toDate: formatDate(new Date()),
    },
  })

  // Generate attendance data for date range
  useEffect(() => {
    if (fromDate && toDate) {
      const dates = generateDateRange(fromDate, toDate)
      const newAttendanceData = dates.map((date) => ({
        date,
        isPresent: false,
      }))
      setAttendanceData(newAttendanceData)
    }
  }, [fromDate, toDate])

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      const currentDate = formatDate(new Date())
      form.reset({
        employeeId: 0,
        isPresent: false,
        date: currentDate,
      })
      setSelectedEmployeeId(null)
      setSelectedMonthYear(formatMonth(new Date()))
      setFromDate(currentDate)
      setToDate(currentDate)
    }
  }, [open, form])

  // Handlers
  const handleAttendanceChange = (date: string, isPresent: boolean) => {
    setAttendanceData((prev) =>
      prev.map((item) => (item.date === date ? { ...item, isPresent } : item))
    )
  }

  const handleSelectAll = (isPresent: boolean) => {
    setAttendanceData((prev) => prev.map((item) => ({ ...item, isPresent })))
  }

  const handleSubmit = () => {
    if (!selectedEmployeeId) {
      return
    }

    const attendanceRecords: AttendanceFormValue[] = attendanceData.map(
      (item) => ({
        employeeId: selectedEmployeeId,
        date: item.date,
        isPresent: item.isPresent,
      })
    )

    console.log("📝 Single attendance records:", attendanceRecords)

    saveAttendance.mutate(attendanceRecords, {
      onSuccess: (response) => {
        if (response.result === 1) {
          onOpenChange(false)
        }
      },
    })
  }

  const getPresentCount = () => {
    return attendanceData.filter((item) => item.isPresent).length
  }

  const getAbsentCount = () => {
    return attendanceData.filter((item) => !item.isPresent).length
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] !max-w-none overflow-y-auto sm:w-[90vw]">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Single Employee Attendance Entry
          </DialogTitle>
          <DialogDescription className="text-sm">
            Select an employee and mark their attendance for specific dates
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <Form {...form}>
            {/* Employee and Date Selection */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FormItem>
                <FormControl>
                  <EmployeeAutocomplete
                    form={form}
                    label="Employee"
                    name="employeeId"
                    isRequired
                    onChangeEvent={(selectedOption) => {
                      setSelectedEmployeeId(
                        selectedOption ? selectedOption.employeeId : null
                      )
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormControl>
                  <MonthAutocomplete
                    form={form}
                    label="Month"
                    name="date"
                    onChangeEvent={(value) =>
                      setSelectedMonthYear(value?.value || "")
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormControl>
                  <CustomDateNew
                    form={form}
                    label="From Date"
                    name="fromDate"
                    onChangeEvent={(date) => {
                      if (date) {
                        setFromDate(formatDate(date))
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormControl>
                  <CustomDateNew
                    form={form}
                    label="To Date"
                    name="toDate"
                    onChangeEvent={(date) => {
                      if (date) {
                        setToDate(formatDate(date))
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>

            {/* Summary and Actions */}
            {selectedEmployeeId && attendanceData.length > 0 && (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{attendanceData.length} Days</Badge>
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800"
                  >
                    {getPresentCount()} Present
                  </Badge>
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    {getAbsentCount()} Absent
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectAll(true)}
                        >
                          <CheckSquare className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Mark All Present</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectAll(false)}
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Mark All Absent</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            )}

            {/* Attendance Grid */}
            {selectedEmployeeId && attendanceData.length > 0 && (
              <div className="rounded-lg border p-4">
                <h3 className="mb-4 text-lg font-semibold">
                  Attendance Details
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {attendanceData.map((item) => {
                    const date = new Date(item.date)
                    const dayName = date.toLocaleDateString("en-US", {
                      weekday: "short",
                    })
                    const dayNumber = date.getDate()

                    return (
                      <div
                        key={item.date}
                        className="hover:bg-muted/50 flex flex-col items-center rounded-lg border p-3"
                      >
                        <div className="mb-2 text-center">
                          <div className="text-sm font-medium">{dayName}</div>
                          <div className="text-muted-foreground text-xs">
                            {dayNumber.toString().padStart(2, "0")}
                          </div>
                        </div>
                        <Checkbox
                          checked={item.isPresent}
                          onCheckedChange={(isPresent) =>
                            handleAttendanceChange(
                              item.date,
                              isPresent as boolean
                            )
                          }
                          className="mx-auto"
                        />
                        <div className="mt-1 text-xs">
                          {item.isPresent ? (
                            <span className="text-green-600">Present</span>
                          ) : (
                            <span className="text-red-600">Absent</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={
                  !selectedEmployeeId ||
                  attendanceData.length === 0 ||
                  saveAttendance.isPending
                }
              >
                {saveAttendance.isPending ? "Saving..." : "Save"}
                {attendanceData.length > 0
                  ? ` (${attendanceData.length} records)`
                  : ""}
              </Button>
            </div>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
