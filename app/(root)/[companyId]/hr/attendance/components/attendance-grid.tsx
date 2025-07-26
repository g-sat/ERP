"use client"

import React, { useMemo } from "react"
import {
  IAttendance,
  IAttendanceStatus,
  IEmployeeAttendance,
} from "@/interfaces/attendance"
import { Fingerprint, UserCheck } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  attendanceData: IAttendance[]
  selectedMonthYear?: string
}

export function AttendanceGrid({
  employees,
  attendanceData,
  selectedMonthYear,
}: AttendanceGridProps) {
  // Generate days for the selected month
  const daysInMonth = useMemo(() => {
    const days = []
    const monthYear =
      selectedMonthYear ||
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
    const [year, month] = monthYear.split("-").map(Number)
    const daysCount = new Date(year, month, 0).getDate()
    const monthName = new Date(year, month - 1, 1).toLocaleDateString("en-US", {
      month: "short",
    })

    for (let day = 1; day <= daysCount; day++) {
      const date = new Date(year, month - 1, day)
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
      const formattedDate = `${month}/${day.toString().padStart(2, "0")}`
      days.push({
        day,
        dayName,
        formattedDate,
        fullDate: date.toISOString().split("T")[0],
        monthName,
      })
    }
    return days
  }, [selectedMonthYear])

  const getStatusColor = (status: IAttendanceStatus) => {
    switch (status) {
      case "P":
        return "bg-green-100 text-green-800 border-green-200"
      case "A":
        return "bg-red-100 text-red-800 border-red-200"
      case "L":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "HL":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "CL":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "PL":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      case "WK":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "REJECTED":
        return "bg-red-200 text-red-900 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getAttendanceForDay = (employeeId: string, date: string) => {
    return attendanceData.find(
      (att) => att.employeeId === employeeId && att.date === date
    )
  }

  const getTooltipContent = (attendance: IAttendance) => {
    if (!attendance) return null

    const content = []

    // Add attendance type indicator
    if (attendance.isPhysical) {
      content.push("📝 Physical Attendance")
    } else if (attendance.isBiometric) {
      content.push("🔐 Biometric Attendance")
    }

    if (attendance.clockIn) {
      content.push(`IN - ${attendance.clockIn}`)
    }
    if (attendance.clockOut) {
      content.push(`OUT - ${attendance.clockOut}`)
    }
    if (attendance.totalWorkingHours) {
      content.push(`Total Working Hours: ${attendance.totalWorkingHours}`)
    }
    if (attendance.earlyOutHours) {
      content.push(`Early OUT: ${attendance.earlyOutHours}`)
    }
    if (attendance.lateInHours) {
      content.push(`Late IN: ${attendance.lateInHours}`)
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
      case "REJECTED":
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
      const attDate = new Date(att.date)
      return (
        att.employeeId === employeeId &&
        attDate.getMonth() === month - 1 && // month is 0-indexed in Date
        attDate.getFullYear() === year
      )
    })

    const presentCount = monthAttendance.filter(
      (att) => att.status === "P"
    ).length
    const totalCount = monthAttendance.length

    return { presentCount, totalCount }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Attendance Report - {daysInMonth[0]?.monthName}{" "}
            {(() => {
              const monthYear =
                selectedMonthYear ||
                `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
              const [year] = monthYear.split("-").map(Number)
              return year
            })()}
          </CardTitle>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              {employees.length} Employees
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <TooltipProvider>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="bg-muted/50 sticky left-0 z-10 w-[300px]">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">Employee</span>
                    </div>
                  </TableHead>
                  <TableHead className="w-[200px]">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">Company</span>
                    </div>
                  </TableHead>
                  {daysInMonth.map((day) => (
                    <TableHead key={day.day} className="w-[80px] text-center">
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
                {employees.map((employee) => (
                  <TableRow
                    key={employee.employeeId}
                    className="hover:bg-muted/30"
                  >
                    <TableCell className="bg-background sticky left-0 z-10">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage
                            src={employee.employeePhoto}
                            alt={employee.employeeName}
                          />
                          <AvatarFallback className="text-xs">
                            {employee.employeeName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">
                            {employee.employeeName}
                          </div>
                          <div className="text-muted-foreground truncate text-xs">
                            {employee.department}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="flex-shrink-0 text-xs"
                        >
                          {(() => {
                            const { presentCount, totalCount } =
                              getAttendanceCounts(employee.employeeId)
                            return `${presentCount}/${totalCount}`
                          })()}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {employee.companyName ? (
                          <span className="text-foreground">
                            {employee.companyName}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">
                            No Company
                          </span>
                        )}
                      </div>
                    </TableCell>
                    {daysInMonth.map((day) => {
                      const attendance = getAttendanceForDay(
                        employee.employeeId,
                        day.fullDate
                      )

                      return (
                        <TableCell key={day.day} className="p-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-full">
                                {attendance ? (
                                  <div
                                    className={`flex h-8 w-full cursor-pointer items-center justify-center rounded border text-xs font-medium transition-all hover:scale-105 ${getStatusColor(attendance.status)}`}
                                  >
                                    {attendance.status === "REJECTED" ? (
                                      <div className="h-3 w-3 rounded-full border-2 border-white bg-red-500"></div>
                                    ) : (
                                      <div className="flex items-center gap-1">
                                        {getAttendanceIcon(attendance)}
                                        <span className="font-semibold">
                                          {attendance.status}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-muted-foreground flex h-8 w-full items-center justify-center text-xs">
                                    -
                                  </div>
                                )}
                              </div>
                            </TooltipTrigger>
                            {attendance && (
                              <TooltipContent side="top" className="max-w-xs">
                                <div className="space-y-2">
                                  <div className="text-sm font-semibold">
                                    {employee.employeeName}
                                  </div>
                                  <div className="text-muted-foreground text-sm">
                                    {day.formattedDate} ({day.dayName})
                                  </div>
                                  <div className="text-xs font-medium">
                                    Status: {getStatusLabel(attendance.status)}
                                  </div>
                                  <div className="border-t pt-2 text-xs whitespace-pre-line">
                                    {getTooltipContent(attendance)}
                                  </div>
                                </div>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="bg-muted/30 border-t p-4">
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded border border-green-200 bg-green-100"></div>
              <span>Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded border border-red-200 bg-red-100"></div>
              <span>Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded border border-gray-200 bg-gray-100"></div>
              <span>Weekend</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded border border-blue-200 bg-blue-100"></div>
              <span>Half Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded border border-orange-200 bg-orange-100"></div>
              <span>Casual Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded border border-indigo-200 bg-indigo-100"></div>
              <span>Paid Leave</span>
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
      </CardContent>
    </Card>
  )
}
