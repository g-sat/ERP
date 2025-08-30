export interface IAttendance {
  id: string
  employeeId: string
  employeeName: string
  department?: string
  location?: string
  companyId: number
  companyName: string
  photo?: string
  date: string
  status: string
  remarks?: string
  isPhysical?: boolean
}

export interface IEmployeeAttendance {
  employeeId: string
  employeeName: string
  companyId: number
  companyName: string
  photo?: string
  dailyRecords: IDailyRecord[]
}

export interface IDailyRecord {
  date: string
  status: string
  isPhysical?: boolean
}

export type IAttendanceStatus = "P" | "A" | "WK" | "VL"

export interface IAttendanceFilter {
  type?: string
  department?: string
  location?: string
  employeeId?: string
  dateFrom?: string
  dateTo?: string
  status?: string
}

export interface IAttendanceSummary {
  employeeId: string
  employeeName: string
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  totalWorkingHours: number
  averageWorkingHours: number
}
