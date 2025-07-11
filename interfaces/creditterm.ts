export interface ICreditTerm {
  creditTermId: number
  companyId: number
  creditTermCode: string
  creditTermName: string
  noDays: number
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface ICreditTermFilter {
  isActive?: boolean
  region?: string
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface ICreditTermDt {
  companyId: number
  creditTermId: number
  creditTermCode: string
  creditTermName: string
  fromDay: number
  toDay: number
  dueDay: number
  noMonth: number
  isEndOfMonth: boolean
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
}
