export interface IVoyage {
  voyageId: number
  voyageNo: string
  referenceNo: string
  vesselId: number
  vesselName?: string
  bargeId: number
  bargeName?: string
  remarks?: string
  isActive: boolean
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
}

export interface ISaveVoyage {
  voyageId: string
  voyageNo: string
  referenceNo: string
  vesselId: number
  bargeId: number
  remarks?: string
  isActive: boolean
}

export interface IVoyageFilter {
  search?: string
  isActive?: boolean
  sortOrder?: "asc" | "desc"
}
