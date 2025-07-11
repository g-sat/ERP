export interface IAccountSetup {
  companyId: number
  accSetupId: number
  accSetupCode: string
  accSetupName: string
  accSetupCategoryId: number
  accSetupCategoryCode: string
  accSetupCategoryName: string
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface IAccountSetupFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface IAccountSetupCategory {
  companyId: number
  accSetupCategoryId: number
  accSetupCategoryCode: string
  accSetupCategoryName: string
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface IAccountSetupCategoryFilter {
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface IAccountSetupDt {
  companyId: number
  accSetupId: number
  accSetupName: string
  currencyId: number
  currencyName: string
  glId: number
  glCode: string
  glName: string
  applyAllCurr: boolean
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
}

export interface IAccountSetupDtFilter {
  search?: string
  sortOrder?: "asc" | "desc"
}
