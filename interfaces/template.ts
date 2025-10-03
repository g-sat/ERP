export interface ITemplateHd {
  companyId: number
  templateId: number
  templateName: string
  taskId: number
  taskName?: string
  chargeId: number
  chargeName?: string
  isActive: boolean
  createById: number
  editById: number
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  data_details?: ITemplateDt[]
}

export interface ITemplateDt {
  templateId: number
  itemNo: number
  chargeId: number
  chargeName?: string
  remarks: string
  editVersion: number
  isServiceCharge: boolean
  serviceCharge: number
}

export interface ITemplateFilter {
  search?: string
  sortOrder?: string
}
