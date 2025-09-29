import { z } from "zod"

import { Task } from "@/lib/operations-utils"

export const JobOrderHdSchema = z
  .object({
    jobOrderId: z.number(),
    jobOrderNo: z
      .string()
      .max(20, "Job Order No must be less than 20 characters")
      .optional()
      .default(""),
    jobOrderDate: z
      .union([z.date(), z.string()])
      .refine(
        (val) => val !== null && val !== undefined && val !== "",
        "Job Order Date is required"
      ),
    customerId: z.number().min(1, "Customer is required"),
    currencyId: z.number().min(1, "Currency is required"),
    exhRate: z.number().min(0, "Exchange rate must be 0 or greater"),
    vesselId: z.number().min(1, "Vessel is required"),
    imoCode: z
      .string()
      .max(10, "IMO Code must be less than 10 characters")
      .optional()
      .default(""),
    vesselDistance: z.number().min(0, "Vessel Distance must be 0 or greater"),
    portId: z.number().min(1, "Port is required"),
    lastPortId: z.number().optional(),
    nextPortId: z.number().optional(),
    voyageId: z.number().optional(),
    natureOfCall: z
      .string()
      .max(50, "Nature of Call must be less than 50 characters")
      .optional()
      .default(""),
    isps: z
      .string()
      .max(20, "ISPS must be less than 20 characters")
      .optional()
      .default(""),
    etaDate: z.union([z.date(), z.string()]).optional(),
    etdDate: z.union([z.date(), z.string()]).optional(),
    ownerName: z
      .string()
      .max(200, "Owner Name must be less than 200 characters")
      .optional()
      .default(""),
    ownerAgent: z
      .string()
      .max(200, "Owner Agent must be less than 200 characters")
      .optional()
      .default(""),
    masterName: z
      .string()
      .max(200, "Master Name must be less than 200 characters")
      .optional()
      .default(""),
    charters: z
      .string()
      .max(200, "Charters must be less than 200 characters")
      .optional()
      .default(""),
    chartersAgent: z
      .string()
      .max(200, "Charters Agent must be less than 200 characters")
      .optional()
      .default(""),
    invoiceId: z.number().optional().default(0),
    invoiceNo: z.string().optional().default(""),
    invoiceDate: z.union([z.date(), z.string()]).optional(),
    seriesDate: z.union([z.date(), z.string()]).optional(),
    addressId: z.number().min(1, "Address is required"),
    contactId: z.number().min(1, "Contact is required"),
    remarks: z
      .string()
      .max(255, "Remarks must be less than 250 characters")
      .optional()
      .default(""),
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

export type JobOrderHdSchemaType = z.infer<typeof JobOrderHdSchema>

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

export type JobOrderDtSchemaType = z.infer<typeof JobOrderDtSchema>

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
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional()
    .default(""),
  editVersion: z.number().default(0),
})

export type AgencyRemunerationSchemaType = z.infer<
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
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional()
    .default(""),
  debitNoteId: z.number().default(0),
  debitNoteNo: z.string().default(""),
  editVersion: z.number().default(0),
})

export type ConsignmentExportSchemaType = z.infer<
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
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional()
    .default(""),
  debitNoteId: z.number().default(0),
  debitNoteNo: z.string().default(""),
  editVersion: z.number().default(0),
})

export type ConsignmentImportSchemaType = z.infer<
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
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional()
    .default(""),
  statusId: z.number().min(1, "Status is required"),
  editVersion: z.number().default(0),
})

export type CrewMiscellaneousSchemaType = z.infer<
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
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional()
    .default(""),
  editVersion: z.number().default(0),
})

export type CrewSignOffSchemaType = z.infer<typeof CrewSignOffSchema>

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
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional()
    .default(""),
  editVersion: z.number().default(0),
})

export type CrewSignOnSchemaType = z.infer<typeof CrewSignOnSchema>

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
  editVersion: z.number().default(0),
})

export type FreshWaterSchemaType = z.infer<typeof FreshWaterSchema>

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
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional()
    .default(""),
  debitNoteId: z.number().default(0),
  debitNoteNo: z.string().default(""),
  editVersion: z.number().default(0),
})

export type LandingItemsSchemaType = z.infer<typeof LandingItemsSchema>

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
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional()
    .default(""),
  debitNoteId: z.number().default(0),
  debitNoteNo: z.string().default(""),
  editVersion: z.number().default(0),
})

export type MedicalAssistanceSchemaType = z.infer<
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
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional()
    .default(""),
  editVersion: z.number().default(0),
})

export type OtherServiceSchemaType = z.infer<typeof OtherServiceSchema>

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
  debitNoteId: z.number().optional().default(0),
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional()
    .default(""),
  editVersion: z.number().default(0),
})

export type PortExpensesSchemaType = z.infer<typeof PortExpensesSchema>

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
  editVersion: z.number().default(0),
})

export type LaunchServiceSchemaType = z.infer<typeof LaunchServiceSchema>

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
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional()
    .default(""),
  statusId: z.number().min(1, "Status is required"),
  isEquimentFooter: z.boolean().default(false),
  equimentFooter: z.string().optional().default(""),
  debitNoteId: z.number().optional().default(0),
  debitNoteNo: z.string().optional().default(""),
  editVersion: z.number().default(0),
})

export type EquipmentUsedSchemaType = z.infer<typeof EquipmentUsedSchema>

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
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional()
    .default(""),
  debitNoteId: z.number().default(0),
  debitNoteNo: z.string().default(""),
  editVersion: z.number().default(0),
})

export type TechnicianSurveyorSchemaType = z.infer<
  typeof TechnicianSurveyorSchema
>

export const ThirdPartySchema = z.object({
  thirdPartyId: z.number().default(0),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().min(1, "Task ID is required"),
  debitNoteId: z.number().default(0),
  debitNoteNo: z.string().default(""),
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional()
    .default(""),
  quantity: z.number().min(0, "Quantity must be 0 or greater").default(0),
  glId: z.number().min(1, "GL Account is required"),
  chargeId: z.number().min(1, "Charge is required"),
  statusId: z.number().min(1, "Status is required"),
  supplierId: z.number().min(1, "Supplier is required"),
  supplierMobileNumber: z.string().default(""),
  uomId: z.number().min(1, "UOM is required"),
  deliverDate: z.union([z.string(), z.date()]).default(""),
  editVersion: z.number().default(0),
})

export type ThirdPartySchemaType = z.infer<typeof ThirdPartySchema>

// Define debitNoteDtSchema first since it's referenced by debitNoteHdSchema
export const debitNoteDtSchema = z
  .object({
    debitNoteId: z.number().min(1, "Debit Note ID is required"),
    debitNoteNo: z.string().min(1, "Debit Note Number is required"),
    itemNo: z.number().min(0, "Item Number is required").default(0),
    taskId: z.number().min(1, "Task ID is required"),
    chargeId: z.number().min(1, "Charge is required"),
    glId: z.number().min(1, "GL Account is required"),
    qty: z.number().min(0, "Quantity must be 0 or greater").default(0),
    unitPrice: z.number().min(0, "Unit price must be 0 or greater").default(0),
    totLocalAmt: z.number().default(0),
    totAmt: z.number().min(0, "Total amount must be 0 or greater").default(0),
    gstId: z.number().min(1, "GST ID is required"),
    gstPercentage: z
      .number()
      .min(0, "GST percentage must be 0 or greater")
      .default(0),
    gstAmt: z.number().min(0, "GST amount must be 0 or greater").default(0),
    totAftGstAmt: z
      .number()
      .min(0, "Total after GST must be 0 or greater")
      .default(0),
    remarks: z
      .string()
      .max(500, "Remarks must be less than 500 characters")
      .optional()
      .default(""),
    editVersion: z
      .number()
      .min(0, "Edit version must be 0 or greater")
      .default(0),
    isServiceCharge: z.boolean().default(false),
    serviceCharge: z.number().default(0),
  })
  .superRefine((data, ctx) => {
    if (
      data.isServiceCharge &&
      (data.serviceCharge === 0 ||
        data.serviceCharge === undefined ||
        data.serviceCharge === null)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Service charge amount is required when service charge is enabled",
        path: ["serviceCharge"],
      })
    }
  })

export type DebitNoteDtSchemaType = z.infer<typeof debitNoteDtSchema>

// Define debitNoteHdSchema after debitNoteDtSchema
export const debitNoteHdSchema = z.object({
  debitNoteId: z.number().default(0),
  debitNoteNo: z.string().min(1, "Debit Note Number is required"),
  debitNoteDate: z.union([z.string(), z.date()]).default(""),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  itemNo: z.number().min(0, "Item Number is required").default(0),
  taskId: z.number().min(1, "Task ID is required"),
  serviceId: z.number().min(1, "Service ID is required"),
  chargeId: z.number().min(1, "Charge is required"),
  currencyId: z.number().min(1, "Currency is required"),
  exhRate: z.number().min(0, "Exchange rate must be 0 or greater").default(0),
  totAmt: z.number().min(0, "Total amount must be 0 or greater").default(0),
  gstAmt: z.number().min(0, "GST amount must be 0 or greater").default(0),
  totAftGstAmt: z
    .number()
    .min(0, "Total after GST must be 0 or greater")
    .default(0),
  glId: z.number().min(1, "GL Account is required"),
  taxableAmt: z
    .number()
    .min(0, "Taxable amount must be 0 or greater")
    .default(0),
  nonTaxableAmt: z
    .number()
    .min(0, "Non-taxable amount must be 0 or greater")
    .default(0),
  isLocked: z.boolean().default(false),
  editVersion: z
    .number()
    .min(0, "Edit version must be 0 or greater")
    .default(0),
  // Nested Details
  data_details: z.array(debitNoteDtSchema).optional().default([]),
})

export type DebitNoteHdSchemaType = z.infer<typeof debitNoteHdSchema>
