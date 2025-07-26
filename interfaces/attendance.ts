export interface IAttendance {
  id: string
  employeeId: string
  employeeName: string
  companyId: number
  companyName: string
  employeePhoto?: string
  date: string
  status: IAttendanceStatus
  clockIn?: string
  clockOut?: string
  totalWorkingHours?: string
  earlyOutHours?: string
  lateInHours?: string
  leaveType?: ILeaveType
  department?: string
  location?: string
  isBiometric: boolean
  isPhysical: boolean
  notes?: string
  createdDate: string
  editDate: string
}

// API Response interfaces for /hr/GetAttendanceEmployee
export interface IAttendanceRecord {
  Day: number
  Status: IAttendanceStatus
  ClockIn: string | null
  ClockOut: string | null
  WorkingHours: string | null
  EarlyOutHours: string | null
  LateInHours: string | null
  Biometric: "Yes" | "No"
  Physical: "Yes" | "No"
}

export interface IAttendanceEmployee {
  EmployeeId: number
  EmployeeName: string
  CompanyId: number
  CompanyName: string
  EmployeePhoto: string
  Records: IAttendanceRecord[]
}

// New interface for actual API response structure
export interface IDailyRecord {
  status: IAttendanceStatus
  clockIn: string
  clockOut: string
  workingHours?: string
  earlyOutHours?: string
  lateInHours?: string
  biometric?: boolean | string
  physical?: boolean | string
}

export interface IActualAttendanceEmployee {
  employeeId: number
  employeeName: string
  companyId: number
  companyName: string
  photo: string
  dailyRecords: Record<string, IDailyRecord>
}

export type IAttendanceStatus =
  | "P" // Present
  | "A" // Absent
  | "L" // Leave
  | "HL" // Half Leave
  | "CL" // Casual Leave
  | "PL" // Paid Leave
  | "WK" // Weekend
  | "REJECTED" // Rejected/Unapproved

export type ILeaveType =
  | "FIRST_HALF"
  | "SECOND_HALF"
  | "FULL_DAY"
  | "CASUAL"
  | "PAID"
  | "SICK"
  | "ANNUAL"

export interface IAttendanceFilter {
  department?: string
  location?: string
  employeeId?: string
  companyId?: number
  dateFrom?: string
  dateTo?: string
  status?: IAttendanceStatus
  type?: "ALL" | "BIOMETRIC" | "PHYSICAL"
}

export interface IAttendanceSummary {
  employeeId: string
  employeeName: string
  employeePhoto?: string
  department?: string
  totalDays: number
  presentDays: number
  absentDays: number
  leaveDays: number
  totalWorkingHours: string
  earlyOutHours: string
  lateInHours: string
}

export interface IEmployeeAttendance {
  employeeId: string
  employeeName: string
  companyId: number
  companyName: string
  employeePhoto?: string
  department?: string
  location?: string
}
