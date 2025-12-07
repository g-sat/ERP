export interface IChargeGLMapping {
  chargeId: number
  chargeName: string
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

export interface IChargeGLMappingFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
