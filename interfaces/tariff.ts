export interface ITariff {
  tariffId: string
  task: string
  charge: string
  uom: string
  type?: string
  fromPlace?: string
  toPlace?: string
  displayRate: number
  basicRate: number
  minUnit: number
  maxUnit?: number
  isAdditional: boolean
  additionalUnit?: number
  additionalRate?: number
  isPrepayment: boolean
  prepaymentRate?: number
  isActive: boolean
  remarks?: string
}

export interface ITariffFilter {
  search?: string
  task?: string
  port?: string
  customer?: string
}

export interface Tariff {
  companyId: number
  tariffId: number
  rateType?: string
  taskId?: number
  taskCode?: string
  taskName?: string
  chargeId?: number
  chargeCode?: string
  chargeName?: string
  portId?: number
  portCode?: string
  portName?: string
  customerId?: number
  customerCode?: string
  customerName?: string
  currencyId: number
  currencyCode?: string
  currencyName?: string
  uomId?: number
  uomCode?: string
  uomName?: string
  slabUomId?: number
  slabUomCode?: string
  slabUomName?: string
  visaTypeId?: number
  visaTypeCode?: string
  visaTypeName?: string
  fromPlace?: number
  fromPlaceName?: string
  toPlace?: number
  toPlaceName?: string
  displayRate?: number
  basicRate?: number
  minUnit?: number
  maxUnit?: number
  isAdditional: boolean
  additionalUnit?: number
  additionalRate?: number
  prepaymentPercentage?: number
  isPrepayment: boolean
  itemNo: number
  remarks?: string
  isActive: boolean
  createById: number
  createDate: Date
  editById?: number
  editDate?: Date
  createBy?: string
  editBy?: string
}
