export interface IPaySchedule {
  payscheduleId: number
  companyId: number
  companyName: string
  workWeek?: string | null
  isMonthly: boolean
  workingDaysPerMonth?: number | null
  isPayOn: boolean
  payDayOfMonth?: number | null
  firstPayPeriod: string // Format: 'yyyy-mm-dd'
  firstPayDate: string // Format: 'yyyy-mm-dd'
  isLocked: boolean
  createDate: string | Date
  editDate?: string | Date
  editVersion: number
}

export interface IPayScheduleFilter {
  isActive?: boolean
  companyId?: number
}

export interface IUpcomingPayroll {
  period: string // Format: 'MMM-YYYY'
  payDate: string // Format: 'DD MMM YYYY'
}
