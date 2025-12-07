export interface IJobStatus {
  jobStatusId: number
  companyId: number
  jobStatusCode: string
  jobStatusName: string
  seqNo: number
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface IJobStatusFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

