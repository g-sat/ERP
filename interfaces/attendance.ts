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
  clockIn?: string
  clockOut?: string
  totalWorkingHours?: string
  earlyOutHours?: string
  remarks?: string
  isPhysical?: boolean
  isBiometric?: boolean
  lateInHours?: string
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
  clockIn?: string
  clockOut?: string
  workingHours?: string
  lateInHours?: string
  earlyOutHours?: string
  isPhysical?: boolean
  isBiometric?: boolean
}

export type IAttendanceStatus =
  | "P"
  | "A"
  | "L"
  | "HL"
  | "CL"
  | "PL"
  | "WK"
  | "RE"

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
