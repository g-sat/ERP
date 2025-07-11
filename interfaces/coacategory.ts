export interface ICoaCategory1 {
  coaCategoryId: number
  companyId: number
  coaCategoryCode: string
  coaCategoryName: string
  seqNo: number
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string | null
  isActive: boolean
  remarks: string
}

export interface ICoaCategory1Filter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface ICoaCategory2 {
  coaCategoryId: number
  companyId: number
  coaCategoryCode: string
  coaCategoryName: string
  seqNo: number
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string | null
  isActive: boolean
  remarks: string
}

export interface ICoaCategory2Filter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface ICoaCategory3 {
  coaCategoryId: number
  companyId: number
  coaCategoryCode: string
  coaCategoryName: string
  seqNo: number
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string | null
  isActive: boolean
  remarks: string
}

export interface ICoaCategory3Filter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
