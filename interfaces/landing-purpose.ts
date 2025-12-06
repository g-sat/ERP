export interface ILandingPurpose {
  landingPurposeId: number
  companyId: number
  landingPurposeCode: string
  landingPurposeName: string
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

export interface ILandingPurposeFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

