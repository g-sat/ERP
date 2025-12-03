export interface IVisa {
  visaId: number
  companyId: number
  visaCode: string
  visaName: string
  visaOrder: number
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface IVisaFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

