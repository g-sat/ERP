export interface ITaskStatus {
  taskStatusId: number
  companyId: number
  taskStatusCode: string
  taskStatusName: string
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

export interface ITaskStatusFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

