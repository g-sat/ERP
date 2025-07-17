export interface ITariffFilter {
  search?: string
  task?: string
  port?: string
  customer?: string
}

export interface ITariff {
  tariffId: number
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
  visaTypeId?: number
  visaTypeCode?: string
  visaTypeName?: string
  displayRate?: number
  basicRate?: number
  minUnit?: number
  maxUnit?: number
  isAdditional: boolean
  additionalUnit?: number
  additionalRate?: number
  prepaymentPercentage?: number
  isPrepayment: boolean
  seqNo?: number
  isDefault: boolean
  remarks?: string
  isActive?: boolean
}

export interface ITariffCount {
  taskId: number
  taskCode: string
  taskName: string
  count: number
}

export interface IPortTariff {
  portId: number
  portCode: string
  portName: string
  tariffCount: number
}

export interface ITaskTariff {
  taskId: number
  taskCode: string
  taskName: string
  tariffCount: number
}

export interface CopyRate {
  fromCompanyId: number
  toCompanyId: number
  fromTaskId: number
  fromPortId: number
  toPortId: number
  fromCustomerId: number
  toCustomerId: number
  multipleId: string
  isOverwrite: boolean
  isDelete: boolean
}
