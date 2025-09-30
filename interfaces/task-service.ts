export interface ITaskService {
  companyId: number
  taskId: number
  chargeId?: number | null
  glId?: number | null
  uomId?: number | null
  carrierTypeId?: number | null
  modeTypeId?: number | null
  consignmentTypeId?: number | null
  landingTypeId?: number | null
  visaTypeId?: number | null
  statusTypeId?: number | null
  createById: number
  createDate: string
  editById?: number | null
  editDate?: string | null
}
