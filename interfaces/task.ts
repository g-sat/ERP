export interface ITask {
  taskId: number
  companyId: number
  taskCode: string
  taskName: string
  taskOrder: number
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface ITaskFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
