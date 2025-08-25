"use client"

import { IEmployeeAttendance } from "@/interfaces/attendance"
import { CheckCircle, Clock, Users, XCircle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AttendanceDashboardProps {
  employees: IEmployeeAttendance[]
}

export function AttendanceDashboard({ employees }: AttendanceDashboardProps) {
  // For demo purposes, generate some realistic statistics
  const totalEmployees = employees?.length || 0
  const presentToday = Math.floor(totalEmployees * 0.85) // 85% present
  const absentToday = Math.floor(totalEmployees * 0.1) // 10% absent
  const lateToday = Math.floor(totalEmployees * 0.05) // 5% late

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">
              {totalEmployees}
            </div>
            <p className="text-muted-foreground text-xs">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600 sm:text-2xl">
              {presentToday}
            </div>
            <p className="text-muted-foreground text-xs">Employees present</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <XCircle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600 sm:text-2xl">
              {absentToday}
            </div>
            <p className="text-muted-foreground text-xs">Employees absent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Today</CardTitle>
            <Clock className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-yellow-600 sm:text-2xl">
              {lateToday}
            </div>
            <p className="text-muted-foreground text-xs">Employees late</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
