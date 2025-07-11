export interface IChartofAccount {
  glId: number
  glCode: string
  glName: string
  companyId: number
  accTypeId: number
  accTypeCode: string
  accTypeName: string
  accGroupId: number
  accGroupCode: string
  accGroupName: string
  coaCategoryId1: number
  coaCategoryCode1: string
  coaCategoryName1: string
  coaCategoryId2: number
  coaCategoryCode2: string
  coaCategoryName2: string
  coaCategoryId3: number
  coaCategoryCode3: string
  coaCategoryName3: string
  isSysControl: boolean
  isDeptMandatory: boolean
  isBargeMandatory: boolean
  isJobControl: boolean
  isBankControl: boolean
  isHeading: boolean
  isGLCodeEditable: boolean
  seqNo: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface IChartofAccountFilter {
  isActive?: boolean
  accTypeId?: number
  accGroupId?: number
  search?: string
  sortOrder?: "asc" | "desc"
}
