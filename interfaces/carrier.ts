export interface ICarrier {
  carrierId: number
  companyId: number
  carrierCode: string
  carrierName: string
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

export interface ICarrierFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

