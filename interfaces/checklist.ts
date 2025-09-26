export interface IJobOrderHd {
  companyId: number
  jobOrderId: number
  jobOrderNo?: string
  jobOrderDate?: Date | string
  customerId?: number
  customerCode?: string
  customerName?: string
  currencyId?: number
  currencyCode?: string
  currencyName?: string
  exhRate?: number
  vesselId: number
  vesselName?: string
  imoCode?: string
  vesselDistance?: number
  portId?: number
  portName?: string
  lastPortId?: number
  lastPortName?: string
  nextPortId?: number
  nextPortName?: string
  voyageId?: number
  voyageNo?: string
  natureOfCall?: string
  isps?: string
  etaDate?: Date | string
  etdDate?: Date | string
  ownerName?: string
  ownerAgent?: string
  masterName?: string
  charters?: string
  chartersAgent?: string
  invoiceId?: number
  invoiceNo?: string
  invoiceDate?: Date | string
  seriesDate?: Date | string
  addressId?: number
  contactId?: number
  remarks?: string
  statusId?: number
  statusName?: string
  gstId?: number
  gstPercentage?: number
  isActive?: boolean
  isTaxable?: boolean
  isClose?: boolean
  isPost?: boolean
  editVersion?: string
  createById?: number
  createDate?: Date | string
  editById?: number
  editDate?: Date | string
  createBy?: string
  editBy?: string
}

export interface IJobOrderDt {
  jobOrderId: number
  companyId?: number
  jobOrderNo?: string
  itemNo: number
  taskId: number
  taskItemNo: number
  serviceId: number
  totAmt: number
  totLocalAmt: number
  gstAmt: number
  gstLocalAmt: number
  totAftAmt: number
  totLocalAftAmt: number
}

export interface IAgencyRemuneration {
  companyId: number
  agencyRemunerationId: number
  date: Date | string
  jobOrderId: number
  jobOrderNo: string
  taskId: number
  taskName?: string
  glId: number
  glName?: string
  chargeId: number
  chargeName?: string
  debitNoteId?: number
  debitNoteNo?: string
  totAmt: number
  gstAmt: number
  totAmtAftGst: number
  statusId: number
  statusName?: string
  remarks?: string
  createById: number
  createDate: Date
  editById?: number
  editDate?: Date
  editVersion: number
  createBy?: string
  editBy?: string
}

export interface IConsignmentExport {
  consignmentExportId: number
  companyId: number
  jobOrderId: number
  jobOrderNo: string
  taskId: number
  taskName?: string
  chargeId: number
  chargeName?: string
  glId: number
  glName?: string
  awbNo: string
  carrierTypeId: number
  carrierTypeName?: string
  uomId: number
  uomName?: string
  modeTypeId?: number
  modeTypeName?: string
  consignmentTypeId: number
  consignmentTypeName?: string
  landingTypeId?: number
  landingTypeName?: string
  noOfPcs?: number
  weight: number
  pickupLocation?: string
  deliveryLocation?: string
  clearedBy?: string
  billEntryNo?: string
  declarationNo?: string
  receiveDate?: Date | string
  deliverDate?: Date | string
  arrivalDate?: Date | string
  amountDeposited?: number
  refundInstrumentNo?: string
  statusId: number
  statusName?: string
  remarks: string
  debitNoteId?: number
  debitNoteNo?: string
  totAmt: number
  gstAmt: number
  totAmtAftGst: number
  createById: number
  createDate: Date
  editById?: number
  editDate?: Date
  editVersion: number
  createBy?: string
  editBy?: string
}

export interface IConsignmentImport {
  consignmentImportId: number
  companyId: number
  jobOrderId: number
  jobOrderNo: string
  taskId: number
  taskName?: string
  chargeId: number
  chargeName?: string
  glId: number
  glName?: string
  awbNo: string
  carrierTypeId: number
  carrierTypeName?: string
  uomId: number
  uomName?: string
  modeTypeId?: number
  modeTypeName?: string
  consignmentTypeId: number
  consignmentTypeName?: string
  landingTypeId?: number
  landingTypeName?: string
  noOfPcs?: number
  weight: number
  pickupLocation?: string
  deliveryLocation?: string
  clearedBy?: string
  billEntryNo?: string
  declarationNo?: string
  receiveDate?: Date | string
  deliverDate?: Date | string
  arrivalDate?: Date | string
  amountDeposited?: number
  refundInstrumentNo?: string
  statusId: number
  statusName?: string
  remarks: string
  debitNoteId?: number
  debitNoteNo?: string
  totAmt: number
  gstAmt: number
  totAmtAftGst: number
  createById: number
  createDate: Date
  editById?: number
  editDate?: Date
  editVersion: number
  createBy?: string
  editBy?: string
}

export interface ICrewMiscellaneous {
  crewMiscellaneousId: number
  companyId: number
  jobOrderId: number
  jobOrderNo: string
  taskId: number
  debitNoteId?: number
  debitNoteNo?: string
  totAmt: number
  gstAmt: number
  totAmtAftGst: number
  description: string
  glId: number
  glName?: string
  quantity: number
  chargeId?: number
  chargeName?: string
  remarks: string
  statusId: number
  statusName?: string
  createById: number
  createDate: Date
  editById?: number
  editDate?: Date
  createBy?: string
  editBy?: string
  editVersion: number
}

export interface ICrewSignOff {
  crewSignOffId: number
  companyId: number
  jobOrderId: number
  jobOrderNo: string
  taskId: number
  chargeId: number
  chargeName?: string
  glId: number
  glName?: string
  visaTypeId: number
  crewName: string
  nationality: string
  rankId: number
  rankName?: string
  flightDetails: string
  hotelName: string
  departureDetails?: string
  transportName?: string
  clearing?: string
  statusId: number
  statusName?: string
  debitNoteId?: number
  debitNoteNo?: string
  overStayRemark?: string
  modificationRemark?: string
  cidClearance?: string
  totAmt: number
  gstAmt: number
  totAmtAftGst: number
  remarks: string
  createById: number
  createDate: Date
  editById?: number
  editDate?: Date
  editVersion: number
  createBy?: string
  editBy?: string
}

export interface ICrewSignOn {
  crewSignOnId: number
  companyId: number
  jobOrderId: number
  jobOrderNo: string
  taskId: number
  chargeId: number
  chargeName?: string
  glId: number
  glName?: string
  visaTypeId: number
  crewName: string
  nationality: string
  rankId: number
  rankName?: string
  flightDetails: string
  hotelName: string
  departureDetails?: string
  transportName?: string
  clearing?: string
  statusId: number
  statusName?: string
  debitNoteId?: number
  debitNoteNo?: string
  overStayRemark?: string
  modificationRemark?: string
  cidClearance?: string
  totAmt: number
  gstAmt: number
  totAmtAftGst: number
  remarks: string
  createById: number
  createDate: Date
  editById?: number
  editDate?: Date
  editVersion: number
  createBy?: string
  editBy?: string
}

export interface IEquipmentUsed {
  equipmentUsedId: number
  date: Date | string
  referenceNo: string
  companyId: number
  jobOrderId: number
  jobOrderNo: string
  taskId: number
  taskName?: string
  chargeId: number
  chargeName?: string
  glId: number
  glName?: string
  mafi?: string
  others?: string
  craneChargeId?: number
  craneChargeName?: string
  forkliftChargeId?: number
  forkliftChargeName?: string
  stevedoreChargeId?: number
  stevedoreChargeName?: string
  loadingRefNo?: string
  craneloading?: number
  forkliftloading?: number
  stevedoreloading?: number
  offloadingRefNo?: string
  craneOffloading?: number
  forkliftOffloading?: number
  stevedoreOffloading?: number
  launchServiceId?: number
  remarks?: string
  statusId: number
  statusName?: string
  isEquimentFooter?: boolean
  equimentFooter?: string
  debitNoteId?: number
  debitNoteNo?: string
  totAmt: number
  gstAmt: number
  totAmtAftGst: number
  createById: number
  createDate: Date
  editById?: number
  editDate?: Date
  createBy?: string
  editBy?: string
  editVersion: number
}

export interface IFreshWater {
  freshWaterId: number
  date: Date | string
  companyId: number
  jobOrderId: number
  jobOrderNo: string
  taskId: number
  taskName?: string | null
  glId: number
  glName?: string | null
  chargeId: number
  chargeName?: string | null
  bargeId: number
  bargeName?: string | null
  operatorName?: string | null
  supplyBarge?: string | null
  distance: number
  quantity: number
  receiptNo: string
  uomId: number
  uomName?: string | null
  statusId: number
  statusName?: string | null
  remarks: string
  debitNoteId?: number | null
  debitNoteNo?: string | null
  totAmt: number
  gstAmt: number
  totAmtAftGst: number
  createById: number
  createDate: Date
  editById?: number
  editDate?: Date
  editVersion: number
  createBy?: string
  editBy?: string
}

export interface ILandingItems {
  landingItemId: number
  date: Date | string
  companyId: number
  jobOrderId: number
  jobOrderNo: string
  taskId: number
  taskName?: string
  glId: number
  glName?: string
  chargeId: number
  chargeName?: string
  name: string
  quantity: number
  weight: number
  landingTypeId: number
  landingTypeName?: string
  locationName: string
  uomId: number
  uomName?: string
  returnDate?: Date | string
  statusId: number
  statusName?: string
  remarks: string
  debitNoteId?: number
  debitNoteNo?: string
  totAmt: number
  gstAmt: number
  totAmtAftGst: number
  createById: number
  createDate: Date
  editById?: number
  editDate?: Date
  editVersion: number
  createBy?: string
  editBy?: string
}

export interface ILaunchService {
  companyId: number
  launchServiceId: number
  date: Date | string
  jobOrderId: number
  jobOrderNo: string
  taskId: number
  taskName?: string
  uomId: number
  uomName?: string
  glId: number
  glName?: string
  chargeId: number
  chargeName?: string
  bargeId?: number
  bargeName?: string
  ameTally?: string
  boatopTally?: string
  boatOperator?: string
  distance?: number
  loadingTime?: string
  leftJetty?: string
  waitingTime?: number
  alongsideVessel?: string
  departedFromVessel?: string
  timeDiff?: number
  arrivedAtJetty?: string
  deliveredWeight: number
  landedWeight: number
  annexure?: string
  invoiceNo?: string
  portId?: number
  statusId: number
  debitNoteId?: number
  debitNoteNo?: string
  totAmt: number
  gstAmt: number
  totAmtAftGst: number
  remarks: string
  createById: number
  createDate: Date
  editById?: number
  editDate?: Date
  createBy?: string
  editBy?: string
  editVersion: number
}

export interface ILaunchServiceFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface IAgencyRemunerationFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface IConsignmentExportFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface IConsignmentImportFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface ICrewMiscellaneousFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface ICrewSignOffFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface ICrewSignOnFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface IEquipmentUsedFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface IFreshWaterFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface ILandingItemsFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface IMedicalAssistanceFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface IOtherServiceFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface ITechnicianSurveyorFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface IThirdPartyFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface IMedicalAssistance {
  medicalAssistanceId: number
  jobOrderId: number
  jobOrderNo: string
  taskId: number
  chargeId: number
  chargeName?: string
  glId: number
  glName?: string
  crewName: string
  nationality: string
  rankId: number
  rankName?: string
  visaTypeId: number
  visaTypeName?: string
  reason?: string
  admittedDate?: Date | string
  dischargedDate?: Date | string
  statusId: number
  statusName?: string
  remarks: string
  debitNoteId?: number
  debitNoteNo?: string
  createById: number
  createDate: Date
  editById?: number
  editDate?: Date
  editVersion: number
  createBy?: string
  editBy?: string
}

export interface IOtherService {
  otherServiceId: number
  date: Date | string
  companyId: number
  jobOrderId: number
  jobOrderNo: string
  taskId: number
  chargeId: number
  chargeName?: string
  glId: number
  glName?: string
  serviceProvider: string
  quantity: number
  amount: number
  uomId: number
  uomName?: string
  statusId: number
  statusName?: string
  debitNoteId?: number
  debitNoteNo?: string
  totAmt: number
  gstAmt: number
  totAmtAftGst: number
  remarks: string
  createById: number
  createDate: Date
  editById?: number
  editDate?: Date
  editVersion: number
  createBy?: string
  editBy?: string
}

export interface IPortExpenses {
  portExpenseId: number
  companyId: number
  jobOrderId: number
  jobOrderNo: string
  taskId: number
  taskName?: string
  quantity: number
  supplierId: number
  supplierName?: string
  chargeId: number
  chargeName?: string
  statusId: number
  statusName?: string
  uomId: number
  uomName?: string
  deliverDate?: Date | string
  glId: number
  glName?: string
  debitNoteId?: number
  debitNoteNo?: string
  totAmt: number
  gstAmt: number
  totAmtAftGst: number
  remarks?: string
  createById: number
  createDate: Date
  editById?: number
  editDate?: Date
  createBy?: string
  editBy?: string
  editVersion: number
}

export interface IPortExpensesFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}

export interface ITechnicianSurveyor {
  technicianSurveyorId: number
  companyId: number
  jobOrderId: number
  jobOrderNo: string
  taskId: number
  taskName?: string
  glId: number
  glName?: string
  chargeId: number
  chargeName?: string
  name: string
  quantity: number
  uomId: number
  natureOfAttendance: string
  companyInfo: string
  passTypeId: number
  passTypeName?: string
  embarked?: Date | string
  disembarked?: Date | string
  portRequestNo?: string
  statusId: number
  statusName?: string
  remarks: string
  debitNoteId?: number
  debitNoteNo?: string
  totAmt: number
  gstAmt: number
  totAmtAftGst: number
  createById: number
  createDate: Date
  editById?: number
  editDate?: Date
  editVersion: number
  createBy?: string
  editBy?: string
}

export interface IThirdParty {
  thirdPartyId: number
  companyId: number
  jobOrderId: number
  jobOrderNo: string
  taskId: number
  taskName?: string
  debitNoteId?: number
  debitNoteNo?: string
  totAmt: number
  gstAmt: number
  totAmtAftGst: number
  remarks?: string
  createById: number
  createDate: Date
  editById?: number
  editDate?: Date
  editVersion: number
  quantity: number
  supplierName?: string
  glId: number
  glName?: string
  chargeId: number
  chargeName?: string
  statusId: number
  statusName?: string
  supplierId: number
  supplierMobileNumber?: string
  uomId: number
  uomName?: string
  deliverDate?: Date | string
  createBy?: string
  editBy?: string
}

export interface IDebitNoteHd {
  companyId: number
  debitNoteId: number
  debitNoteNo: string
  debitNoteDate: Date | string
  itemNo: number
  jobOrderId: number
  taskId: number
  taskName?: string
  serviceId: number
  serviceName?: string
  chargeId: number
  chargeName?: string
  currencyId: number
  currencyName?: string
  exhRate: number
  totAmt: number
  gstAmt: number
  totAftGstAmt: number
  glId: number
  glName?: string
  taxableAmt: number
  nonTaxableAmt: number
  isLocked: boolean
  editVersion: number
  data_details?: IDebitNoteDt[]
}

export interface IDebitNoteDt {
  debitNoteId: number
  debitNoteNo: string
  itemNo: number
  taskId: number
  taskName?: string
  chargeId: number
  chargeName?: string
  glId: number
  glName?: string
  qty: number
  unitPrice: number
  totLocalAmt: number
  totAmt: number
  gstId: number
  gstName?: string
  gstPercentage: number
  gstAmt: number
  totAftGstAmt: number
  remarks: string
  editVersion: number
  isServiceCharge: boolean
  serviceCharge: number
}

export interface ITaskDetails {
  portExpense: number
  launchService: number
  equipmentUsed: number
  crewSignOn: number
  crewSignOff: number
  crewMiscellaneous: number
  medicalAssistance: number
  consignmentImport: number
  consignmentExport: number
  thirdParty: number
  freshWater: number
  technicianSurveyor: number
  landingItems: number
  otherService: number
  agencyRemuneration: number
  visaService: number
}

export interface IDebitNoteData {
  multipleId: string
  taskId: number
  jobOrderId: number
  debitNoteNo: string
}
