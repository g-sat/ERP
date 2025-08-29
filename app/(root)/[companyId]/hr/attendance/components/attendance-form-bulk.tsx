"use client"

import { useEffect, useMemo, useState } from "react"
import { AttendanceFormValue, attendanceFormSchema } from "@/schemas/attendance"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckSquare, Square } from "lucide-react"
import { useForm } from "react-hook-form"

import { Hr_Attendance } from "@/lib/api-routes"
import { usePersist } from "@/hooks/use-common"
import { useGetEmployees } from "@/hooks/use-employee"
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
import MonthAutocomplete from "@/components/ui-custom/autocomplete-month"

interface BulkAttendanceData {
  employeeId: string
  employeeName: string
  companyId: number
  days: {
    date: string // always YYYY-MM-DD
    isPresent: boolean
  }[]
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

export function AttendanceBulkForm({
  open,
  onOpenChange,
}: AttendanceFormProps) {
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(
    formatMonth(new Date())
  )
  const [bulkData, setBulkData] = useState<BulkAttendanceData[]>([])

  // Fetch employees
  const { data: employeesResponse, isLoading } = useGetEmployees()
  const employees = employeesResponse?.data || []

  // Bulk attendance save hook
  const bulkSaveAttendance = usePersist<AttendanceFormValue[]>(
    Hr_Attendance.saveBulk
  )

  const form = useForm<AttendanceFormValue>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      employeeId: 0,
      isPresent: false,
      date: formatDate(new Date()),
    },
  })

  // Generate days for selected month
  const days = useMemo(() => {
    try {
      const [year, month] = selectedMonthYear.split("-").map(Number)
      const daysCount = new Date(year, month, 0).getDate()
      const daysArray = []

      for (let day = 1; day <= daysCount; day++) {
        const date = new Date(year, month - 1, day)
        daysArray.push({
          day,
          dayName: date.toLocaleDateString("en-US", { weekday: "narrow" }),
          fullDate: formatDate(date),
        })
      }

      return daysArray
    } catch {
      return []
    }
  }, [selectedMonthYear])

  // Populate bulk data
  useEffect(() => {
    if (employees && employees.length > 0 && days.length > 0) {
      const employeeList = Array.isArray(employees[0])
        ? employees[0]
        : employees

      const newBulkData = employeeList.map(
        (employee: {
          employeeId?: number
          employeeName?: string
          companyId?: number
        }) => ({
          employeeId: employee.employeeId?.toString() || "",
          employeeName: employee.employeeName || "",
          companyId: employee.companyId || 0,
          days: days.map((day) => ({
            date: day.fullDate,
            isPresent: false,
          })),
        })
      )

      setBulkData(newBulkData)
    } else {
      setBulkData([])
    }
  }, [employees, days, selectedMonthYear, isLoading])

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      const currentMonth = formatMonth(new Date())
      form.reset({
        employeeId: 0,
        isPresent: false,
        date: currentMonth,
      })
      setSelectedMonthYear(currentMonth)
    }
  }, [open, form])

  // Handlers
  const handleDayCheckboxChange = (
    employeeId: string,
    date: string,
    isPresent: boolean
  ) => {
    setBulkData((prev) =>
      prev.map((employee) =>
        employee.employeeId === employeeId
          ? {
              ...employee,
              days: employee.days.map((day) =>
                day.date === date ? { ...day, isPresent } : day
              ),
            }
          : employee
      )
    )
  }

  const handleSelectAllEmployees = (date: string, isPresent: boolean) => {
    setBulkData((prev) =>
      prev.map((employee) => ({
        ...employee,
        days: employee.days.map((day) =>
          day.date === date ? { ...day, isPresent } : day
        ),
      }))
    )
  }

  const handleSelectAllDays = (employeeId: string, isPresent: boolean) => {
    setBulkData((prev) =>
      prev.map((employee) =>
        employee.employeeId === employeeId
          ? {
              ...employee,
              days: employee.days.map((day) => ({ ...day, isPresent })),
            }
          : employee
      )
    )
  }

  const handleSubmit = () => {
    const attendanceRecords: AttendanceFormValue[] = []

    bulkData.forEach((employee) => {
      employee.days.forEach((day) => {
        attendanceRecords.push({
          employeeId: Number(employee.employeeId),
          date: day.date, // already YYYY-MM-DD
          isPresent: day.isPresent, // send both true and false
        })
      })
    })

    console.log("📝 Attendance records:", attendanceRecords)

    bulkSaveAttendance.mutate(attendanceRecords, {
      onSuccess: (response) => {
        if (response.result === 1) {
          onOpenChange(false)
        }
      },
    })
  }

  const getSelectedCount = () => {
    return bulkData.reduce(
      (total, employee) => total + employee.days.length, // count all days (both present and absent)
      0
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] !max-w-none overflow-y-auto sm:w-[90vw]">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Bulk Attendance Entry
          </DialogTitle>
          <DialogDescription className="text-sm">
            Select employees and mark their attendance for multiple days
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-6">
          <Form {...form}>
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <FormItem>
                  <FormControl>
                    <MonthAutocomplete
                      form={form}
                      name="date"
                      onChangeEvent={(value) =>
                        setSelectedMonthYear(value?.value || "")
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                {/* Select All Button */}
                {bulkData.length > 0 && (
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setBulkData((prev) =>
                                prev.map((employee) => ({
                                  ...employee,
                                  days: employee.days.map((day) => ({
                                    ...day,
                                    isPresent: true,
                                  })),
                                }))
                              )
                            }}
                          >
                            <CheckSquare className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Select All</p>
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
                            onClick={() => {
                              setBulkData((prev) =>
                                prev.map((employee) => ({
                                  ...employee,
                                  days: employee.days.map((day) => ({
                                    ...day,
                                    isPresent: false,
                                  })),
                                }))
                              )
                            }}
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Unselect All</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>

              {/* Summary Badges */}
              {bulkData.length > 0 && (
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{employees.length} Employees</Badge>
                  <Badge variant="outline">{days.length} Days</Badge>
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800"
                  >
                    {getSelectedCount()} Selected
                  </Badge>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={
                    bulkData.length === 0 || bulkSaveAttendance.isPending
                  }
                >
                  {bulkSaveAttendance.isPending ? "Saving..." : "Save"}{" "}
                  {bulkData.length > 0 ? `(${getSelectedCount()} records)` : ""}
                </Button>
              </div>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    Loading employees...
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Please wait while we fetch the employee data
                  </div>
                </div>
              </div>
            )}

            {/* Table */}
            {!isLoading && bulkData.length > 0 && (
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  {/* Header table */}
                  <Table className="w-full table-fixed border-collapse">
                    <colgroup>
                      <col className="w-[200px] min-w-[180px]" />
                      {days.map((day) => (
                        <col key={day.day} className="w-[35px] min-w-[30px]" />
                      ))}
                    </colgroup>
                    <TableHeader className="bg-background sticky top-0 z-20">
                      <TableRow>
                        <TableHead className="bg-muted/50 sticky left-0 z-30">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">Employee</span>
                          </div>
                        </TableHead>
                        {days.map((day) => (
                          <TableHead
                            key={day.day}
                            className="p-0.5 text-center"
                          >
                            <div className="flex flex-col items-center">
                              <span className="text-xs font-semibold">
                                {day.day.toString().padStart(2, "0")}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {day.dayName}
                              </span>
                              <Checkbox
                                checked={bulkData.every(
                                  (emp) =>
                                    emp.days.find(
                                      (d) => d.date === day.fullDate
                                    )?.isPresent
                                )}
                                onCheckedChange={(isPresent) =>
                                  handleSelectAllEmployees(
                                    day.fullDate,
                                    isPresent as boolean
                                  )
                                }
                                className="mt-1"
                              />
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                  </Table>

                  {/* Scrollable body table */}
                  <div className="max-h-[400px] overflow-y-auto">
                    <Table className="w-full table-fixed border-collapse">
                      <colgroup>
                        <col className="w-[200px] min-w-[180px]" />
                        {days.map((day) => (
                          <col
                            key={day.day}
                            className="w-[35px] min-w-[30px]"
                          />
                        ))}
                      </colgroup>
                      <TableBody>
                        {bulkData.map((employee) => (
                          <TableRow key={employee.employeeId} className="group">
                            <TableCell className="bg-background sticky left-0 z-10 py-2">
                              <div className="flex items-center space-x-2">
                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-xs font-medium">
                                    {employee.employeeName}
                                  </div>
                                </div>
                                <Checkbox
                                  checked={employee.days.every(
                                    (day) => day.isPresent
                                  )}
                                  onCheckedChange={(isPresent) =>
                                    handleSelectAllDays(
                                      employee.employeeId,
                                      isPresent as boolean
                                    )
                                  }
                                />
                              </div>
                            </TableCell>
                            {employee.days.map((day) => (
                              <TableCell
                                key={day.date}
                                className="p-0.5 text-center"
                              >
                                <Checkbox
                                  checked={day.isPresent}
                                  onCheckedChange={(isPresent) =>
                                    handleDayCheckboxChange(
                                      employee.employeeId,
                                      day.date,
                                      isPresent as boolean
                                    )
                                  }
                                  className="mx-auto"
                                />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Table>
              </div>
            )}
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
