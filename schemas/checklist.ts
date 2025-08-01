import { z } from "zod"

import { Task } from "@/lib/operations-utils"

export const JobOrderHdSchema = z
  .object({
    jobOrderId: z.number(),
    jobOrderNo: z.string().min(1, "Job Order No is required"),
    jobOrderDate: z
      .union([z.date(), z.string()])
      .refine(
        (val) => val !== null && val !== undefined && val !== "",
        "Job Order Date is required"
      ),
    customerId: z.number().min(1, "Customer is required"),
    currencyId: z.number().optional(),
    exhRate: z.number().optional(),
    vesselId: z.number().min(1, "Vessel is required"),
    imoCode: z.string().optional(),
    vesselDistance: z.number().min(0, "Vessel Distance must be 0 or greater"),
    portId: z.number().min(1, "Port is required"),
    lastPortId: z.number().optional(),
    nextPortId: z.number().optional(),
    voyageId: z.number().optional(),
    natureOfCall: z.string().optional(),
    isps: z.string().optional(),
    etaDate: z.union([z.date(), z.string()]).optional(),
    etdDate: z.union([z.date(), z.string()]).optional(),
    ownerName: z.string().optional(),
    ownerAgent: z.string().optional(),
    masterName: z.string().optional(),
    charters: z.string().optional(),
    chartersAgent: z.string().optional(),
    invoiceId: z.number().optional(),
    invoiceNo: z.string().optional(),
    invoiceDate: z.union([z.date(), z.string()]).optional(),
    seriesDate: z.union([z.date(), z.string()]).optional(),
    addressId: z.number().optional(),
    contactId: z.number().optional(),
    remarks: z.string().optional(),
    statusId: z.number().min(1, "Status is required"),
    gstId: z.number().optional(),
    gstPercentage: z.number().optional(),
    isActive: z.boolean().optional(),
    isTaxable: z.boolean().optional(),
    isClose: z.boolean().optional(),
    isPost: z.boolean().optional(),
    editVersion: z.string().optional(),
  })
  .refine(
    (data) => {
      // If isTaxable is true, gstId is required
      if (data.isTaxable && (!data.gstId || data.gstId === 0)) {
        return false
      }
      return true
    },
    {
      message: "GST is required when taxable is enabled",
      path: ["gstId"],
    }
  )

export type JobOrderHdFormValues = z.infer<typeof JobOrderHdSchema>

export const JobOrderDtSchema = z.object({
  jobOrderId: z.number(),
  companyId: z.number().optional(),
  jobOrderNo: z.string().optional(),
  itemNo: z.number(),
  taskId: z.number(),
  taskItemNo: z.number(),
  serviceId: z.number(),
  totAmt: z.number(),
  totLocalAmt: z.number(),
  gstAmt: z.number(),
  gstLocalAmt: z.number(),
  totAftAmt: z.number(),
  totLocalAftAmt: z.number(),
})

export type JobOrderDtFormValues = z.infer<typeof JobOrderDtSchema>

export const AgencyRemunerationSchema = z.object({
  agencyRemunerationId: z.number().default(0),
  date: z.union([z.string(), z.date()]).default(""),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().min(1, "Task ID is required"),
  glId: z.number().min(1, "GL Account is required"),
  chargeId: z.number().min(1, "Charge is required"),
  debitNoteId: z.number().default(0),
  debitNoteNo: z.string().default(""),
  statusId: z.number().min(1, "Status is required"),
  remarks: z.string().default(""),
})

export type AgencyRemunerationFormValues = z.infer<
  typeof AgencyRemunerationSchema
>

export const ConsignmentExportSchema = z.object({
  consignmentExportId: z.number().default(0),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().min(1, "Task ID is required"),
  chargeId: z.number().min(1, "Charge is required"),
  glId: z.number().min(1, "GL Account is required"),
  awbNo: z.string().min(1, "AWB Number is required"),
  carrierTypeId: z.number().min(1, "Cargo Type is required"),
  uomId: z.number().min(1, "UOM is required"),
  modeTypeId: z.number().default(0),
  consignmentTypeId: z.number().min(1, "Type is required"),
  landingTypeId: z.number().default(0),
  noOfPcs: z
    .number()
    .min(0, "Number of pieces must be 0 or greater")
    .default(1),
  weight: z.number().min(0, "Weight must be 0 or greater").default(0),
  pickupLocation: z.string().default(""),
  deliveryLocation: z.string().default(""),
  clearedBy: z.string().default(""),
  billEntryNo: z.string().default(""),
  declarationNo: z.string().default(""),
  receiveDate: z.union([z.string(), z.date()]).default(""),
  deliverDate: z.union([z.string(), z.date()]).default(""),
  arrivalDate: z.union([z.string(), z.date()]).default(""),
  amountDeposited: z
    .number()
    .min(0, "Amount deposited must be 0 or greater")
    .default(0),
  refundInstrumentNo: z.string().default(""),
  statusId: z.number().min(1, "Status is required"),
  remarks: z.string().default(""),
  debitNoteId: z.number().default(0),
  debitNoteNo: z.string().default(""),
})

export type ConsignmentExportFormValues = z.infer<
  typeof ConsignmentExportSchema
>

export const ConsignmentImportSchema = z.object({
  consignmentImportId: z.number().default(0),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().min(1, "Task ID is required"),
  chargeId: z.number().min(1, "Charge is required"),
  glId: z.number().min(1, "GL Account is required"),
  awbNo: z.string().min(1, "AWB Number is required"),
  carrierTypeId: z.number().min(1, "Cargo Type is required"),
  uomId: z.number().min(1, "UOM is required"),
  modeTypeId: z.number().default(0),
  consignmentTypeId: z.number().min(1, "Type is required"),
  landingTypeId: z.number().default(0),
  noOfPcs: z
    .number()
    .min(0, "Number of pieces must be 0 or greater")
    .default(1),
  weight: z.number().min(0, "Weight must be 0 or greater").default(0),
  pickupLocation: z.string().default(""),
  deliveryLocation: z.string().default(""),
  clearedBy: z.string().default(""),
  billEntryNo: z.string().default(""),
  declarationNo: z.string().default(""),
  receiveDate: z.union([z.string(), z.date()]).default(""),
  deliverDate: z.union([z.string(), z.date()]).default(""),
  arrivalDate: z.union([z.string(), z.date()]).default(""),
  amountDeposited: z
    .number()
    .min(0, "Amount deposited must be 0 or greater")
    .default(0),
  refundInstrumentNo: z.string().default(""),
  statusId: z.number().min(1, "Status is required"),
  remarks: z.string().default(""),
  debitNoteId: z.number().default(0),
  debitNoteNo: z.string().default(""),
})

export type ConsignmentImportFormValues = z.infer<
  typeof ConsignmentImportSchema
>

export const CrewMiscellaneousSchema = z.object({
  crewMiscellaneousId: z.number().default(0),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().min(1, "Task ID is required"),
  debitNoteId: z.number().default(0),
  debitNoteNo: z.string().default(""),
  description: z.string().min(1, "Description is required"),
  glId: z.number().min(1, "GL Account is required"),
  quantity: z.number().min(0, "Quantity must be 0 or greater").default(0),
  chargeId: z.number().default(0),
  remarks: z.string().default(""),
  statusId: z.number().min(1, "Status is required"),
})

export type CrewMiscellaneousFormValues = z.infer<
  typeof CrewMiscellaneousSchema
>

export const CrewSignOffSchema = z.object({
  crewSignOffId: z.number().default(0),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().optional().default(Task.CrewSignOn),
  chargeId: z.number().min(1, "Charge is required"),
  glId: z.number().min(1, "GL Account is required"),
  visaTypeId: z.number().min(1, "Visa Type is required"),
  crewName: z.string().min(1, "Crew Name is required"),
  nationality: z.string().min(1, "Nationality is required"),
  rankId: z.number().optional().default(0),
  flightDetails: z.string().optional().default(""),
  hotelName: z.string().optional().default(""),
  departureDetails: z.string().optional().default(""),
  transportName: z.string().optional().default(""),
  clearing: z.string().optional().default(""),
  statusId: z.number().min(1, "Status is required"),
  debitNoteId: z.number().optional().default(0),
  debitNoteNo: z.string().optional().default(""),
  overStayRemark: z.string().optional().default(""),
  modificationRemark: z.string().optional().default(""),
  cidClearance: z.string().optional().default(""),
  remarks: z.string().default(""),
})

export type CrewSignOffFormValues = z.infer<typeof CrewSignOffSchema>

export const CrewSignOnSchema = z.object({
  crewSignOnId: z.number().default(0),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().optional().default(Task.CrewSignOn),
  chargeId: z.number().min(1, "Charge is required"),
  glId: z.number().min(1, "GL Account is required"),
  visaTypeId: z.number().min(1, "Visa Type is required"),
  crewName: z.string().min(1, "Crew Name is required"),
  nationality: z.string().min(1, "Nationality is required"),
  rankId: z.number().optional().default(0),
  flightDetails: z.string().optional().default(""),
  hotelName: z.string().optional().default(""),
  departureDetails: z.string().optional().default(""),
  transportName: z.string().optional().default(""),
  clearing: z.string().optional().default(""),
  statusId: z.number().min(1, "Status is required"),
  debitNoteId: z.number().optional().default(0),
  debitNoteNo: z.string().optional().default(""),
  overStayRemark: z.string().optional().default(""),
  modificationRemark: z.string().optional().default(""),
  cidClearance: z.string().optional().default(""),
  remarks: z.string().default(""),
})

export type CrewSignOnFormValues = z.infer<typeof CrewSignOnSchema>

export const FreshWaterSchema = z.object({
  freshWaterId: z.number().default(0),
  date: z.union([z.string(), z.date()]).default(""),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().optional().default(Task.FreshWater),
  glId: z.number().optional().default(0),
  chargeId: z.number().min(1, "Charge is required"),
  bargeId: z.number().min(1, "Barge is required"),
  operatorName: z.string().optional().default(""),
  supplyBarge: z.string().optional().default(""),
  distance: z.number().min(0, "Distance must be 0 or greater").default(0),
  quantity: z.number().min(0, "Quantity must be 0 or greater").default(0),
  receiptNo: z.string().default(""),
  uomId: z.number().min(1, "UOM is required"),
  debitNoteId: z.number().optional().default(0),
  debitNoteNo: z.string().optional().default(""),
  remarks: z.string().optional().default(""),
  statusId: z.number().min(1, "Status is required"),
})

export type FreshWaterFormValues = z.infer<typeof FreshWaterSchema>

export const LandingItemsSchema = z.object({
  landingItemId: z.number().default(0),
  date: z.string().min(1, "Landing Date is required"),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().min(1, "Task ID is required"),
  glId: z.number().min(1, "GL Account is required"),
  chargeId: z.number().min(1, "Charge is required"),
  name: z.string().min(1, "Name is required"),
  quantity: z.number().min(0, "Quantity must be 0 or greater").default(1),
  weight: z.number().min(0, "Weight must be 0 or greater").default(0),
  landingTypeId: z.number().min(1, "Landing Type is required"),
  locationName: z.string().min(1, "Location Name is required"),
  uomId: z.number().min(1, "UOM is required"),
  returnDate: z.string().default(""),
  statusId: z.number().min(1, "Status is required"),
  remarks: z.string().default(""),
  debitNoteId: z.number().default(0),
  debitNoteNo: z.string().default(""),
})

export type LandingItemsFormValues = z.infer<typeof LandingItemsSchema>

export const MedicalAssistanceSchema = z.object({
  medicalAssistanceId: z.number().default(0),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().min(1, "Task ID is required"),
  chargeId: z.number().min(1, "Charge is required"),
  glId: z.number().min(1, "GL Account is required"),
  crewName: z.string().min(1, "Crew Name is required"),
  nationality: z.string().min(1, "Nationality is required"),
  rankId: z.number().optional().default(0),
  reason: z.string().optional().default(""),
  admittedDate: z.union([z.string(), z.date()]).default(""),
  dischargedDate: z.union([z.string(), z.date()]).default(""),
  visaTypeId: z.number().default(0),
  statusId: z.number().min(1, "Status is required"),
  remarks: z.string().default(""),
  debitNoteId: z.number().default(0),
  debitNoteNo: z.string().default(""),
})

export type MedicalAssistanceFormValues = z.infer<
  typeof MedicalAssistanceSchema
>

export const OtherServiceSchema = z.object({
  otherServiceId: z.number().default(0),
  date: z.string().min(1, "Service Date is required"),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().min(1, "Task ID is required"),
  chargeId: z.number().min(1, "Charge is required"),
  glId: z.number().min(1, "GL Account is required"),
  serviceProvider: z.string().min(1, "Service Provider is required"),
  quantity: z.number().min(0, "Quantity must be 0 or greater").default(1),
  amount: z.number().min(0, "Amount must be 0 or greater"),
  uomId: z.number().min(1, "UOM is required"),
  statusId: z.number().min(1, "Status is required"),
  debitNoteId: z.number().default(0),
  debitNoteNo: z.string().default(""),
  remarks: z.string().default(""),
})

export type OtherServiceFormValues = z.infer<typeof OtherServiceSchema>

export const PortExpensesSchema = z.object({
  portExpenseId: z.number().default(0),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  quantity: z.number().min(0, "Quantity must be 0 or greater").default(1),
  supplierId: z.number().min(1, "Supplier is required"),
  chargeId: z.number().min(1, "Charge is required"),
  statusId: z.number().min(1, "Status is required"),
  uomId: z.number().min(1, "UOM is required"),
  deliverDate: z.string().min(1, "Deliver Date is required"),
  glId: z.number().min(1, "GL Account is required"),
  debitNoteId: z.number().default(0),
  debitNoteNo: z.string().default(""),
  remarks: z.string().default(""),
})

export type PortExpensesFormValues = z.infer<typeof PortExpensesSchema>

export const LaunchServiceSchema = z.object({
  launchServiceId: z.number().default(0),
  date: z.string().min(1, "Service Date is required"),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().min(1, "Task ID is required"),
  glId: z.number().min(1, "GL Account is required"),
  chargeId: z.number().min(1, "Charge is required"),
  uomId: z.number().min(1, "UOM is required"),
  ameTally: z.string().min(1, "AME Tally is required"),
  boatopTally: z.string().optional().default(""),
  distance: z.number().optional().default(0),
  loadingTime: z.string().default(""),
  leftJetty: z.string().default(""),
  alongsideVessel: z.string().default(""),
  departedFromVessel: z.string().default(""),
  arrivedAtJetty: z.string().default(""),
  waitingTime: z
    .number()
    .min(0, "Waiting time must be 0 or greater")
    .default(0),
  timeDiff: z
    .number()
    .min(0, "Time difference must be 0 or greater")
    .default(0),

  deliveredWeight: z.number().optional().default(0),
  landedWeight: z.number().optional().default(0),
  boatOperator: z.string().optional().default(""),
  annexure: z.string().optional().default(""),
  invoiceNo: z.string().optional().default(""),
  portId: z.number().min(1, "Port is required"),
  bargeId: z.number().min(1, "Barge is required"),
  statusId: z.number().min(1, "Status is required"),
  debitNoteId: z.number().optional().default(0),
  debitNoteNo: z.string().optional().default(""),
  remarks: z.string().optional().default(""),
})

export type LaunchServiceFormValues = z.infer<typeof LaunchServiceSchema>

export const EquipmentUsedSchema = z.object({
  equipmentUsedId: z.number().default(0),
  date: z.string().min(1, "Date is required"),
  referenceNo: z.string().min(1, "Reference Number is required"),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().min(1, "Task ID is required"),
  chargeId: z.number().min(1, "Charge is required"),
  glId: z.number().min(1, "GL Account is required"),
  mafi: z.string().optional().default(""),
  others: z.string().optional().default(""),
  forkliftChargeId: z.number().optional().default(0),
  craneChargeId: z.number().optional().default(0),
  stevedoreChargeId: z.number().optional().default(0),
  loadingRefNo: z.string().optional().default(""),
  craneloading: z.number().optional().default(0),
  forkliftloading: z.number().optional().default(0),
  stevedoreloading: z.number().optional().default(0),
  offloadingRefNo: z.string().optional().default(""),
  craneOffloading: z.number().optional().default(0),
  forkliftOffloading: z.number().optional().default(0),
  stevedoreOffloading: z.number().optional().default(0),
  launchServiceId: z.number().optional().default(0),
  remarks: z.string().default(""),
  statusId: z.number().min(1, "Status is required"),
  isEquimentFooter: z.boolean().default(false),
  equimentFooter: z.string().optional().default(""),
  debitNoteId: z.number().optional().default(0),
  debitNoteNo: z.string().optional().default(""),
})

export type EquipmentUsedFormValues = z.infer<typeof EquipmentUsedSchema>

export const TechnicianSurveyorSchema = z.object({
  technicianSurveyorId: z.number().default(0),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().min(1, "Task ID is required"),
  glId: z.number().min(1, "GL Account is required"),
  chargeId: z.number().min(1, "Charge is required"),
  name: z.string().min(1, "Name is required"),
  quantity: z.number().min(0, "Quantity must be 0 or greater").default(0),
  uomId: z.number().min(1, "UOM is required"),
  natureOfAttendance: z.string().min(1, "Nature of Attendance is required"),
  companyInfo: z.string().min(1, "Company Info is required"),
  passTypeId: z.number().min(1, "Pass Type is required"),
  embarked: z.union([z.string(), z.date()]).default(""),
  disembarked: z.union([z.string(), z.date()]).default(""),
  portRequestNo: z.string().default(""),
  statusId: z.number().min(1, "Status is required"),
  remarks: z.string().default(""),
  debitNoteId: z.number().default(0),
  debitNoteNo: z.string().default(""),
})

export type TechnicianSurveyorFormValues = z.infer<
  typeof TechnicianSurveyorSchema
>

export const ThirdPartySchema = z.object({
  thirdPartyId: z.number().default(0),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().min(1, "Task ID is required"),
  debitNoteId: z.number().default(0),
  debitNoteNo: z.string().default(""),
  remarks: z.string().default(""),
  quantity: z.number().min(0, "Quantity must be 0 or greater").default(0),
  glId: z.number().min(1, "GL Account is required"),
  chargeId: z.number().min(1, "Charge is required"),
  statusId: z.number().min(1, "Status is required"),
  supplierId: z.number().min(1, "Supplier is required"),
  supplierMobileNumber: z.string().default(""),
  uomId: z.number().min(1, "UOM is required"),
  deliverDate: z.union([z.string(), z.date()]).default(""),
})

export type ThirdPartyFormValues = z.infer<typeof ThirdPartySchema>

export const DebitNoteHdSchema = z.object({
  debitNoteId: z.number().default(0),
  debitNoteNo: z.string().min(1, "Debit Note Number is required"),
  debitNoteDate: z.string().min(1, "Debit Note Date is required"),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().min(1, "Task ID is required"),
  taskName: z.string().default(""),
  serviceId: z.number().min(1, "Service ID is required"),
  serviceName: z.string().default(""),
  chargeId: z.number().min(1, "Charge is required"),
  chargeName: z.string().default(""),
  currencyId: z.number().min(1, "Currency is required"),
  currencyName: z.string().default(""),
  exhRate: z.number().min(0, "Exchange rate must be 0 or greater").default(0),
  totAmt: z.number().min(0, "Total amount must be 0 or greater").default(0),
  serviceAmt: z
    .number()
    .min(0, "Service amount must be 0 or greater")
    .default(0),
  gstAmt: z.number().min(0, "GST amount must be 0 or greater").default(0),
  totAftGstAmt: z
    .number()
    .min(0, "Total after GST must be 0 or greater")
    .default(0),
  glId: z.number().min(1, "GL Account is required"),
  glName: z.string().default(""),
  taxableAmt: z
    .number()
    .min(0, "Taxable amount must be 0 or greater")
    .default(0),
  nonTaxableAmt: z
    .number()
    .min(0, "Non-taxable amount must be 0 or greater")
    .default(0),
  editVersion: z
    .number()
    .min(0, "Edit version must be 0 or greater")
    .default(0),
  debitNoteDetails: z.array(z.object({})).default([]), // Placeholder for DebitNoteDtViewModel structure
})

export type DebitNoteHdFormValues = z.infer<typeof DebitNoteHdSchema>

export const DebitNoteDtSchema = z.object({
  debitNoteId: z.number().min(1, "Debit Note ID is required"),
  debitNoteNo: z.string().min(1, "Debit Note Number is required"),
  itemNo: z.number().min(1, "Item Number is required"),
  taskId: z.number().min(1, "Task ID is required"),
  taskName: z.string().default(""),
  chargeId: z.number().min(1, "Charge is required"),
  chargeName: z.string().default(""),
  glId: z.number().min(1, "GL Account is required"),
  glName: z.string().default(""),
  qty: z.number().min(0, "Quantity must be 0 or greater").default(0),
  unitPrice: z.number().min(0, "Unit price must be 0 or greater").default(0),
  totLocalAmt: z.number().default(0),
  totAmt: z.number().min(0, "Total amount must be 0 or greater").default(0),
  gstId: z.number().min(1, "GST ID is required"),
  gstName: z.string().default(""),
  gstPercentage: z
    .number()
    .min(0, "GST percentage must be 0 or greater")
    .default(0),
  gstAmt: z.number().min(0, "GST amount must be 0 or greater").default(0),
  totAftGstAmt: z
    .number()
    .min(0, "Total after GST must be 0 or greater")
    .default(0),
  remarks: z.string().default(""),
  editVersion: z
    .number()
    .min(0, "Edit version must be 0 or greater")
    .default(0),
  isServiceCharge: z.boolean().default(false),
  serviceCharge: z.number().default(0),
})

export type DebitNoteDtFormValues = z.infer<typeof DebitNoteDtSchema>
