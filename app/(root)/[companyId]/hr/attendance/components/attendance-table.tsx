"use client"

import { useMemo } from "react"
import {
  IAttendance,
  IAttendanceStatus,
  IDailyRecord,
  IEmployeeAttendance,
} from "@/interfaces/attendance"
import { Fingerprint, UserCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
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

interface AttendanceGridProps {
  employees: IEmployeeAttendance[]
  selectedMonthYear?: string
}

// Utility function to generate attendance data from employees
const generateAttendanceData = (
  employees: IEmployeeAttendance[],
  selectedMonthYear?: string
): IAttendance[] => {
  if (!employees || !Array.isArray(employees)) {
    console.warn("Invalid employees data:", employees)
    return []
  }

  console.log("employees generateAttendanceData", employees)

  return employees.flatMap((employee: IEmployeeAttendance) => {
    if (!employee || !employee.employeeId) {
      console.warn("Invalid employee data:", employee)
      return []
    }

    // Handle dailyRecords as either array or object
    let dailyRecords: IDailyRecord[] = []

    if (Array.isArray(employee.dailyRecords)) {
      // If it's an array, filter valid records
      dailyRecords = employee.dailyRecords.filter(
        (record) => record && record.date
      )
    } else if (
      employee.dailyRecords &&
      typeof employee.dailyRecords === "object"
    ) {
      // If it's an object with numeric keys (day numbers), convert to array format
      dailyRecords = Object.entries(employee.dailyRecords)
        .map(([dayNumber, record]) => {
          const recordData = record as Record<string, unknown>

          // Convert day number to actual date based on selected month
          const monthYear =
            selectedMonthYear ||
            `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
          const [year, month] = monthYear.split("-").map(Number)
          const day = parseInt(dayNumber, 10)

          // Create the actual date string
          const date = new Date(year, month - 1, day)
            .toISOString()
            .split("T")[0]

          return {
            date,
            status: (recordData.status as string) || "A",
            clockIn: (recordData.clockIn as string) || "",
            clockOut: (recordData.clockOut as string) || "",
            workingHours: (recordData.workingHours as string) || "0",
            lateInHours: (recordData.lateInHours as string) || "0",
            earlyOutHours: (recordData.earlyOutHours as string) || "0",
            isPhysical: (recordData.isPhysical as boolean) || false,
            isBiometric: (recordData.isBiometric as boolean) || false,
          }
        })
        .filter((record) => record && record.date)
    }

    return dailyRecords.map((record: IDailyRecord) => {
      // Normalize date format to YYYY-MM-DD for consistent comparison
      let recordDate = ""
      try {
        recordDate = record.date
          ? new Date(record.date).toISOString().split("T")[0]
          : ""
      } catch {
        console.warn("Invalid date format:", record.date)
        recordDate = record.date || "" // Keep original if parsing fails
      }

      return {
        id: `${employee.employeeId}-${recordDate}`,
        employeeId: employee.employeeId,
        employeeName: employee.employeeName,
        companyId: employee.companyId,
        companyName: employee.companyName,
        photo: employee.photo,
        date: recordDate,
        status: record.status || "A", // Default to Absent if no status
        clockIn: record.clockIn || "",
        clockOut: record.clockOut || "",
        totalWorkingHours: record.workingHours || "0",
        earlyOutHours: record.earlyOutHours || "0",
        lateInHours: record.lateInHours || "0",
        isPhysical: record.isPhysical || false,
        isBiometric: record.isBiometric || false,
      }
    })
  })
}

export function AttendanceTable({
  employees,
  selectedMonthYear,
}: AttendanceGridProps) {
  // Generate attendance data from employees
  const attendanceData = useMemo(() => {
    const data = generateAttendanceData(employees || [], selectedMonthYear)
    return data
  }, [employees, selectedMonthYear])

  // Generate days for the selected month
  const days = useMemo(() => {
    try {
      const monthYear =
        selectedMonthYear ||
        `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`

      const [year, month] = monthYear.split("-").map(Number)

      if (isNaN(year) || isNaN(month)) {
        throw new Error("Invalid month year format")
      }

      const daysCount = new Date(year, month, 0).getDate()
      const monthName = new Date(year, month - 1, 1).toLocaleDateString(
        "en-US",
        {
          month: "short",
        }
      )

      const daysArray = []
      for (let day = 1; day <= daysCount; day++) {
        const date = new Date(year, month - 1, day)
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
        const formattedDate = `${month}/${day.toString().padStart(2, "0")}`
        const fullDate = date.toISOString().split("T")[0] // YYYY-MM-DD format

        daysArray.push({
          day,
          dayName,
          formattedDate,
          fullDate,
          monthName,
        })
      }

      return daysArray
    } catch (error) {
      console.error("Error generating days:", error)
      return []
    }
  }, [selectedMonthYear])

  // If no employees, show empty state
  if (!employees || employees.length === 0) {
    return (
      <div>
        <div className="bg-muted/30 border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Attendance Records</h3>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                0 Employees
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground text-center">
            <div className="mb-2 text-lg font-medium">No employees found</div>
            <div className="text-sm">
              There are no employees to display for the selected period.
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: IAttendanceStatus) => {
    switch (status) {
      case "P":
        return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
      case "A":
        return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
      case "L":
        return "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200"
      case "HL":
        return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
      case "CL":
        return "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200"
      case "PL":
        return "bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200"
      case "WK":
        return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
      case "RE":
        return "bg-red-200 text-red-900 border-red-300 hover:bg-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
    }
  }

  const getAttendanceForDay = (employeeId: string, date: string) => {
    const attendance = attendanceData.find((att) => {
      return att.employeeId === employeeId && att.date === date
    })

    return attendance
  }

  const getTooltipContent = (attendance: IAttendance) => {
    if (!attendance) return "No attendance record for this day"

    const content = []

    // Add status information
    content.push(
      `Status: ${getStatusLabel(attendance.status as IAttendanceStatus)}`
    )

    // Add attendance type indicator
    if (attendance?.isPhysical) {
      content.push("Type: Physical Attendance")
    } else if (attendance?.isBiometric) {
      content.push("Type: Biometric Attendance")
    }

    // Add time information
    if (attendance.clockIn) {
      content.push(`Clock In: ${attendance.clockIn}`)
    }
    if (attendance.clockOut) {
      content.push(`Clock Out: ${attendance.clockOut}`)
    }

    // Add hours information
    if (attendance.totalWorkingHours && attendance.totalWorkingHours !== "0") {
      content.push(`Working Hours: ${attendance.totalWorkingHours}h`)
    }
    if (attendance.earlyOutHours && attendance.earlyOutHours !== "0") {
      content.push(`Early Out: ${attendance.earlyOutHours}h`)
    }
    if (attendance.lateInHours && attendance.lateInHours !== "0") {
      content.push(`Late In: ${attendance.lateInHours}h`)
    }

    // Add remarks if available
    if (attendance.remarks) {
      content.push(`Remarks: ${attendance.remarks}`)
    }

    return content.join("\n")
  }

  const getAttendanceIcon = (attendance: IAttendance) => {
    if (attendance.isPhysical) {
      return <UserCheck className="h-3 w-3 text-blue-600" />
    } else if (attendance.isBiometric) {
      return <Fingerprint className="h-3 w-3 text-green-600" />
    }
    return null
  }

  const getStatusLabel = (status: IAttendanceStatus) => {
    switch (status) {
      case "P":
        return "Present"
      case "A":
        return "Absent"
      case "L":
        return "Leave"
      case "HL":
        return "Half Day"
      case "CL":
        return "Casual Leave"
      case "PL":
        return "Paid Leave"
      case "WK":
        return "Weekend"
      case "RE":
        return "Rejected"
      default:
        return status
    }
  }

  // Calculate attendance counts for selected month
  const getAttendanceCounts = (employeeId: string) => {
    const monthYear =
      selectedMonthYear ||
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`

    const [year, month] = monthYear.split("-").map(Number)

    const monthAttendance = attendanceData.filter((att) => {
      if (!att.date) return false

      try {
        const attDate = new Date(att.date)
        return (
          att.employeeId === employeeId &&
          attDate.getMonth() === month - 1 &&
          attDate.getFullYear() === year
        )
      } catch {
        return false
      }
    })

    const presentCount = monthAttendance.filter(
      (att) => att.status === "P"
    ).length
    const totalCount = monthAttendance.length

    return { presentCount, totalCount }
  }

  return (
    <div>
      {/* Table Content */}
      <TooltipProvider>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="bg-muted/50 sticky left-0 z-10 w-[300px] min-w-[250px]">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">Employee</span>
                  </div>
                </TableHead>

                {days.map((day) => (
                  <TableHead
                    key={day.day}
                    className="w-[80px] min-w-[60px] p-2 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-semibold">
                        {day.day.toString().padStart(2, "0")}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {day.dayName}
                      </span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => {
                const { presentCount, totalCount } = getAttendanceCounts(
                  employee.employeeId
                )

                return (
                  <TableRow
                    key={employee.employeeId}
                    className="hover:bg-muted/30 group"
                  >
                    <TableCell className="bg-background sticky left-0 z-10 min-w-[250px]">
                      <div className="flex items-center space-x-3">
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">
                            {employee.employeeName}
                          </div>
                          <div className="text-muted-foreground truncate text-xs">
                            {employee.companyName}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-background flex-shrink-0 text-xs"
                        >
                          {presentCount}/{totalCount}
                        </Badge>
                      </div>
                    </TableCell>
                    {days.map((day) => {
                      const attendance = getAttendanceForDay(
                        employee.employeeId,
                        day.fullDate
                      )

                      return (
                        <TableCell key={day.day} className="p-1 text-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-full">
                                {attendance ? (
                                  <div
                                    className={`flex h-8 w-full cursor-pointer items-center justify-center rounded border text-xs font-medium transition-all hover:scale-105 ${getStatusColor(attendance.status as IAttendanceStatus)}`}
                                  >
                                    <div className="flex items-center gap-1">
                                      {getAttendanceIcon(attendance)}
                                      <span className="font-semibold">
                                        {attendance.status}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-muted-foreground flex h-8 w-full items-center justify-center rounded border border-dashed border-gray-300 text-xs">
                                    No Record
                                  </div>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs p-3">
                              <div className="space-y-2">
                                <div className="text-sm font-semibold">
                                  {employee.employeeName}
                                </div>
                                <div className="text-muted-foreground text-sm">
                                  {day.formattedDate} ({day.dayName})
                                </div>
                                <div className="text-xs whitespace-pre-line">
                                  {getTooltipContent(attendance!)}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </TooltipProvider>

      {/* Legend */}
      <div className="bg-muted/30 border-t p-4">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded border border-green-200 bg-green-100"></div>
            <span>Present (P)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded border border-red-200 bg-red-100"></div>
            <span>Absent (A)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded border border-gray-200 bg-gray-100"></div>
            <span>Weekend (WK)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded border border-blue-200 bg-blue-100"></div>
            <span>Half Day (HL)</span>
          </div>
          <div className="flex items-center gap-2">
            <Fingerprint className="h-3 w-3 text-green-600" />
            <span>Biometric</span>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-3 w-3 text-blue-600" />
            <span>Physical</span>
          </div>
        </div>
      </div>
    </div>
  )
}
