export interface IBargeGLMapping {
  bargeId: number
  bargeName: string
  companyId: number
  glId: number
  glCode: string
  glName: string
  isActive: boolean
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
}

export interface IBargeGLMappingFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
