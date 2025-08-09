export interface IPayRun {
  id: number
  payrollType: string
  startDate: Date
  endDate: Date
  paymentDate: Date
  employeeCount: number
  totalAmount: number
  status: string // 'DRAFT' | 'PROCESSING' | 'APPROVED' | 'PAID' | 'CANCELLED'
  processedBy?: number
  processedDate?: Date
  approvedBy?: number
  approvedDate?: Date
  remarks?: string
  // Related data
  processedByName?: string
  approvedByName?: string
  createDate?: Date
  createBy?: string
  editDate?: Date
  editBy?: string
}

export interface IPayRunHistory {
  id: number
  paymentDate: string
  payrollType: string
  payrollPeriod: string
  status: string
  totalAmount: number
  employeeCount: number
}

export interface IPayRunFilter {
  payrollType?: string
  status?: string
  dateFrom?: Date
  dateTo?: Date
  employeeCount?: number
}

export interface IPayRunDashboard {
  totalPayRuns: number
  activePayRuns: number
  pendingApprovals: number
  totalAmount: number
  monthlyPayroll: number
  recentPayRuns: IPayRun[]
}
