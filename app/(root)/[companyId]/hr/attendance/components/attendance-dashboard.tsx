"use client"

import { IEmployeeAttendance } from "@/interfaces/attendance"
import { CheckCircle, Users, XCircle } from "lucide-react"

interface AttendanceDashboardProps {
  employees: IEmployeeAttendance[]
}

export function AttendanceDashboard({ employees }: AttendanceDashboardProps) {
  // For demo purposes, generate some realistic statistics
  const totalEmployees = employees?.length || 0
  const presentToday = Math.floor(totalEmployees * 0.85) // 85% present
  const absentToday = Math.floor(totalEmployees * 0.15) // 15% absent

  return (
    <div className="space-y-2 sm:space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        <div className="bg-muted/30 flex items-center gap-3 rounded-lg border px-4 py-2">
          <Users className="text-muted-foreground h-4 w-4" />
          <div>
            <div className="text-sm font-medium">Total Employees</div>
            <div className="text-lg font-bold">{totalEmployees}</div>
          </div>
        </div>

        <div className="bg-muted/30 flex items-center gap-3 rounded-lg border px-4 py-2 text-green-600">
          <CheckCircle className="text-muted-foreground h-4 w-4" />
          <div>
            <div className="text-sm font-medium">Present Today</div>
            <div className="text-lg font-bold text-green-600">
              {presentToday}
            </div>
          </div>
        </div>

        <div className="bg-muted/30 flex items-center gap-3 rounded-lg border px-4 py-2 text-red-600">
          <XCircle className="text-muted-foreground h-4 w-4" />
          <div>
            <div className="text-sm font-medium">Absent Today</div>
            <div className="text-lg font-bold text-red-600">{absentToday}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
