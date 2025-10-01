import { z } from "zod"

export const JobOrderHdSchema = z
  .object({
    jobOrderId: z.number(),
    jobOrderNo: z
      .string()
      .max(20, "Job Order No must be less than 20 characters")
      .optional(),
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
      .optional(),
    vesselDistance: z.number().min(0, "Vessel Distance must be 0 or greater"),
    portId: z.number().min(1, "Port is required"),
    lastPortId: z.number().optional(),
    nextPortId: z.number().optional(),
    voyageId: z.number().optional(),
    natureOfCall: z
      .string()
      .max(50, "Nature of Call must be less than 50 characters")
      .optional(),
    isps: z.string().max(20, "ISPS must be less than 20 characters").optional(),
    etaDate: z.union([z.date(), z.string()]).optional(),
    etdDate: z.union([z.date(), z.string()]).optional(),
    ownerName: z
      .string()
      .max(200, "Owner Name must be less than 200 characters")
      .optional(),
    ownerAgent: z
      .string()
      .max(200, "Owner Agent must be less than 200 characters")
      .optional(),
    masterName: z
      .string()
      .max(200, "Master Name must be less than 200 characters")
      .optional(),
    charters: z
      .string()
      .max(200, "Charters must be less than 200 characters")
      .optional(),
    chartersAgent: z
      .string()
      .max(200, "Charters Agent must be less than 200 characters")
      .optional(),
    invoiceId: z.number().optional(),
    invoiceNo: z.string().optional(),
    invoiceDate: z.union([z.date(), z.string()]).optional(),
    seriesDate: z.union([z.date(), z.string()]).optional(),
    addressId: z.number().min(1, "Address is required"),
    contactId: z.number().min(1, "Contact is required"),
    remarks: z
      .string()
      .max(255, "Remarks must be less than 250 characters")
      .optional(),
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
  agencyRemunerationId: z.number(),
  date: z.union([z.string(), z.date()]).optional(),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().min(1, "Task ID is required"),
  glId: z.number().min(1, "GL Account is required"),
  chargeId: z.number().min(1, "Charge is required"),
  debitNoteId: z.number(),
  debitNoteNo: z.string().optional(),
  statusId: z.number().min(1, "Status is required"),
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional()
    .optional(),
  editVersion: z.number(),
})

export type AgencyRemunerationSchemaType = z.infer<
  typeof AgencyRemunerationSchema
>

export const ConsignmentExportSchema = z.object({
  consignmentExportId: z.number(),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().min(1, "Task ID is required"),
  chargeId: z.number().min(1, "Charge is required"),
  glId: z.number().min(1, "GL Account is required"),
  awbNo: z.string().min(1, "AWB Number is required"),
  carrierTypeId: z.number().min(1, "Cargo Type is required"),
  uomId: z.number().min(1, "UOM is required"),
  modeTypeId: z.number(),
  consignmentTypeId: z.number().min(1, "Type is required"),
  landingTypeId: z.number(),
  noOfPcs: z.number().min(0, "Number of pieces must be 0 or greater"),

  weight: z.number().min(0, "Weight must be 0 or greater"),
  pickupLocation: z.string().optional(),
  deliveryLocation: z.string().optional(),
  clearedBy: z.string().optional(),
  billEntryNo: z.string().optional(),
  declarationNo: z.string().optional(),
  receiveDate: z.union([z.string(), z.date()]).optional(),
  deliverDate: z.union([z.string(), z.date()]).optional(),
  arrivalDate: z.union([z.string(), z.date()]).optional(),
  amountDeposited: z.number().min(0, "Amount deposited must be 0 or greater"),
  refundInstrumentNo: z.string().optional(),
  statusId: z.number().min(1, "Status is required"),
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional()
    .optional(),
  debitNoteId: z.number(),
  debitNoteNo: z.string().optional(),
  editVersion: z.number(),
})

export type ConsignmentExportSchemaType = z.infer<
  typeof ConsignmentExportSchema
>

export const ConsignmentImportSchema = z.object({
  consignmentImportId: z.number(),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().min(1, "Task ID is required"),
  chargeId: z.number().min(1, "Charge is required"),
  glId: z.number().min(1, "GL Account is required"),
  awbNo: z.string().min(1, "AWB Number is required"),
  carrierTypeId: z.number().min(1, "Cargo Type is required"),
  uomId: z.number().min(1, "UOM is required"),
  modeTypeId: z.number(),
  consignmentTypeId: z.number().min(1, "Type is required"),
  landingTypeId: z.number(),
  noOfPcs: z.number().min(0, "Number of pieces must be 0 or greater"),

  weight: z.number().min(0, "Weight must be 0 or greater"),
  pickupLocation: z.string().optional(),
  deliveryLocation: z.string().optional(),
  clearedBy: z.string().optional(),
  billEntryNo: z.string().optional(),
  declarationNo: z.string().optional(),
  receiveDate: z.union([z.string(), z.date()]).optional(),
  deliverDate: z.union([z.string(), z.date()]).optional(),
  arrivalDate: z.union([z.string(), z.date()]).optional(),
  amountDeposited: z.number().min(0, "Amount deposited must be 0 or greater"),
  refundInstrumentNo: z.string().optional(),
  statusId: z.number().min(1, "Status is required"),
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional()
    .optional(),
  debitNoteId: z.number(),
  debitNoteNo: z.string().optional(),
  editVersion: z.number(),
})

export type ConsignmentImportSchemaType = z.infer<
  typeof ConsignmentImportSchema
>

export const CrewMiscellaneousSchema = z.object({
  crewMiscellaneousId: z.number(),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().min(1, "Task ID is required"),
  debitNoteId: z.number(),
  debitNoteNo: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  glId: z.number().min(1, "GL Account is required"),
  quantity: z.number().min(0, "Quantity must be 0 or greater"),
  chargeId: z.number(),
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional()
    .optional(),
  statusId: z.number().min(1, "Status is required"),
  editVersion: z.number(),
})

export type CrewMiscellaneousSchemaType = z.infer<
  typeof CrewMiscellaneousSchema
>

export const CrewSignOffSchema = z.object({
  crewSignOffId: z.number(),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().optional(),
  chargeId: z.number().min(1, "Charge is required"),
  glId: z.number().min(1, "GL Account is required"),
  visaTypeId: z.number().min(1, "Visa Type is required"),
  crewName: z.string().min(1, "Crew Name is required"),
  nationality: z.string().min(1, "Nationality is required"),
  rankId: z.number().optional(),
  flightDetails: z.string().optional(),
  hotelName: z.string().optional(),
  departureDetails: z.string().optional(),
  transportName: z.string().optional(),
  clearing: z.string().optional(),
  statusId: z.number().min(1, "Status is required"),
  debitNoteId: z.number().optional(),
  debitNoteNo: z.string().optional(),
  overStayRemark: z.string().optional(),
  modificationRemark: z.string().optional(),
  cidClearance: z.string().optional(),
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional()
    .optional(),
  editVersion: z.number(),
})

export type CrewSignOffSchemaType = z.infer<typeof CrewSignOffSchema>

export const CrewSignOnSchema = z.object({
  crewSignOnId: z.number(),
  jobOrderId: z.number().min(1, "Job Order is required"),
  jobOrderNo: z.string().min(1, "Job Order is required"),
  taskId: z.number().optional(),
  chargeId: z.number().min(1, "Charge is required"),
  glId: z.number().min(1, "GL Account is required"),
  visaTypeId: z.number().min(1, "Visa Type is required"),
  crewName: z
    .string()
    .min(1, "Crew Name is required")
    .max(150, "Crew Name must be less than 150 characters"),
  nationality: z
    .string()
    .min(1, "Nationality is required")
    .max(100, "Nationality must be less than 100 characters"),
  rankId: z.number().min(1, "Rank is required"),
  flightDetails: z
    .string()
    .max(255, "Flight Details must be less than 255 characters")
    .optional()
    .optional(),
  hotelName: z
    .string()
    .max(100, "Hotel Name must be less than 100 characters")
    .optional()
    .optional(),
  departureDetails: z
    .string()
    .max(255, "Departure Details must be less than 255 characters")
    .optional()
    .optional(),
  transportName: z
    .string()
    .max(100, "Transport Name must be less than 100 characters")
    .optional()
    .optional(),
  clearing: z
    .string()
    .max(100, "Clearing must be less than 100 characters")
    .optional()
    .optional(),
  statusId: z.number().min(1, "Status is required"),
  debitNoteId: z.number().optional(),
  debitNoteNo: z.string().optional(),
  overStayRemark: z
    .string()
    .max(255, "Over Stay Remark must be less than 255 characters")
    .optional()
    .optional(),
  modificationRemark: z
    .string()
    .max(255, "Modification Remark must be less than 255 characters")
    .optional()
    .optional(),
  cidClearance: z
    .string()
    .max(255, "CID Clearance must be less than 255 characters")
    .optional()
    .optional(),
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional()
    .optional(),
  editVersion: z.number(),
})

export type CrewSignOnSchemaType = z.infer<typeof CrewSignOnSchema>

export const FreshWaterSchema = z.object({
  freshWaterId: z.number(),
  date: z.union([z.string(), z.date()]).optional(),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().optional(),
  glId: z.number().optional(),
  chargeId: z.number().min(1, "Charge is required"),
  bargeId: z.number().min(1, "Barge is required"),
  operatorName: z.string().optional(),
  supplyBarge: z.string().optional(),
  distance: z.number().min(0, "Distance must be 0 or greater"),
  quantity: z.number().min(0, "Quantity must be 0 or greater"),
  receiptNo: z.string().optional(),
  uomId: z.number().min(1, "UOM is required"),
  debitNoteId: z.number().optional(),
  debitNoteNo: z.string().optional(),
  remarks: z.string().optional(),
  statusId: z.number().min(1, "Status is required"),
  editVersion: z.number(),
})

export type FreshWaterSchemaType = z.infer<typeof FreshWaterSchema>

export const LandingItemsSchema = z.object({
  landingItemId: z.number(),
  date: z.string().min(1, "Landing Date is required"),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().min(1, "Task ID is required"),
  glId: z.number().min(1, "GL Account is required"),
  chargeId: z.number().min(1, "Charge is required"),
  name: z.string().min(1, "Name is required"),
  quantity: z.number().min(0, "Quantity must be 0 or greater"),
  weight: z.number().min(0, "Weight must be 0 or greater"),
  landingTypeId: z.number().min(1, "Landing Type is required"),
  locationName: z.string().min(1, "Location Name is required"),
  uomId: z.number().min(1, "UOM is required"),
  returnDate: z.string().optional(),
  statusId: z.number().min(1, "Status is required"),
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional()
    .optional(),
  debitNoteId: z.number(),
  debitNoteNo: z.string().optional(),
  editVersion: z.number(),
})

export type LandingItemsSchemaType = z.infer<typeof LandingItemsSchema>

export const MedicalAssistanceSchema = z.object({
  medicalAssistanceId: z.number(),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().min(1, "Task ID is required"),
  chargeId: z.number().min(1, "Charge is required"),
  glId: z.number().min(1, "GL Account is required"),
  crewName: z.string().min(1, "Crew Name is required"),
  nationality: z.string().min(1, "Nationality is required"),
  rankId: z.number().optional(),
  reason: z.string().optional(),
  admittedDate: z.union([z.string(), z.date()]).optional(),
  dischargedDate: z.union([z.string(), z.date()]).optional(),
  visaTypeId: z.number(),
  statusId: z.number().min(1, "Status is required"),
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional()
    .optional(),
  debitNoteId: z.number(),
  debitNoteNo: z.string().optional(),
  editVersion: z.number(),
})

export type MedicalAssistanceSchemaType = z.infer<
  typeof MedicalAssistanceSchema
>

export const OtherServiceSchema = z.object({
  otherServiceId: z.number(),
  date: z.string().min(1, "Service Date is required"),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().min(1, "Task ID is required"),
  chargeId: z.number().min(1, "Charge is required"),
  glId: z.number().min(1, "GL Account is required"),
  serviceProvider: z.string().min(1, "Service Provider is required"),
  quantity: z.number().min(0, "Quantity must be 0 or greater"),
  amount: z.number().min(0, "Amount must be 0 or greater"),
  uomId: z.number().min(1, "UOM is required"),
  statusId: z.number().min(1, "Status is required"),
  debitNoteId: z.number(),
  debitNoteNo: z.string().optional(),
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional()
    .optional(),
  editVersion: z.number(),
})

export type OtherServiceSchemaType = z.infer<typeof OtherServiceSchema>

export const PortExpensesSchema = z.object({
  portExpenseId: z.number(),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  quantity: z.number().min(0, "Quantity must be 0 or greater"),
  supplierId: z.number().min(1, "Supplier is required"),
  chargeId: z.number().min(1, "Charge is required"),
  statusId: z.number().min(1, "Status is required"),
  uomId: z.number().min(1, "UOM is required"),
  deliverDate: z.string().min(1, "Deliver Date is required"),
  glId: z.number().min(1, "GL Account is required"),
  debitNoteId: z.number().optional(),
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional()
    .optional(),
  editVersion: z.number(),
})

export type PortExpensesSchemaType = z.infer<typeof PortExpensesSchema>

export const LaunchServiceSchema = z.object({
  launchServiceId: z.number(),
  date: z.string().min(1, "Service Date is required"),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().min(1, "Task ID is required"),
  glId: z.number().min(1, "GL Account is required"),
  chargeId: z.number().min(1, "Charge is required"),
  uomId: z.number().min(1, "UOM is required"),
  ameTally: z.string().min(1, "AME Tally is required"),
  boatopTally: z.string().optional(),
  distance: z.number().optional(),
  loadingTime: z.union([z.date(), z.string()]).optional(),
  leftJetty: z.union([z.date(), z.string()]).optional(),
  alongsideVessel: z.union([z.date(), z.string()]).optional(),
  departedFromVessel: z.union([z.date(), z.string()]).optional(),
  arrivedAtJetty: z.union([z.date(), z.string()]).optional(),
  waitingTime: z.number().min(0, "Waiting time must be 0 or greater"),
  timeDiff: z.number().min(0, "Time difference must be 0 or greater"),
  deliveredWeight: z.number().optional(),
  landedWeight: z.number().optional(),
  boatOperator: z.string().optional(),
  annexure: z.string().optional(),
  invoiceNo: z.string().optional(),
  portId: z.number().min(1, "Port is required"),
  bargeId: z.number().min(1, "Barge is required"),
  statusId: z.number().min(1, "Status is required"),
  debitNoteId: z.number().optional(),
  debitNoteNo: z.string().optional(),
  remarks: z.string().optional(),
  editVersion: z.number(),
})

export type LaunchServiceSchemaType = z.infer<typeof LaunchServiceSchema>

export const EquipmentUsedSchema = z.object({
  equipmentUsedId: z.number(),
  date: z.string().min(1, "Date is required"),
  referenceNo: z.string().min(1, "Reference Number is required"),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().min(1, "Task ID is required"),
  chargeId: z.number().min(1, "Charge is required"),
  glId: z.number().min(1, "GL Account is required"),
  mafi: z.string().optional(),
  others: z.string().optional(),
  forkliftChargeId: z.number().optional(),
  craneChargeId: z.number().optional(),
  stevedoreChargeId: z.number().optional(),
  loadingRefNo: z.string().optional(),
  craneloading: z.number().optional(),
  forkliftloading: z.number().optional(),
  stevedoreloading: z.number().optional(),
  offloadingRefNo: z.string().optional(),
  craneOffloading: z.number().optional(),
  forkliftOffloading: z.number().optional(),
  stevedoreOffloading: z.number().optional(),
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional()
    .optional(),
  statusId: z.number().min(1, "Status is required"),
  isNotes: z.boolean(),
  notes: z.string().optional(),
  debitNoteId: z.number().optional(),
  debitNoteNo: z.string().optional(),
  editVersion: z.number(),
})

export type EquipmentUsedSchemaType = z.infer<typeof EquipmentUsedSchema>

export const TechnicianSurveyorSchema = z.object({
  technicianSurveyorId: z.number(),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().min(1, "Task ID is required"),
  glId: z.number().min(1, "GL Account is required"),
  chargeId: z.number().min(1, "Charge is required"),
  name: z.string().min(1, "Name is required"),
  quantity: z.number().min(0, "Quantity must be 0 or greater"),
  uomId: z.number().min(1, "UOM is required"),
  natureOfAttendance: z.string().min(1, "Nature of Attendance is required"),
  companyInfo: z.string().min(1, "Company Info is required"),
  passTypeId: z.number().min(1, "Pass Type is required"),
  embarked: z.union([z.string(), z.date()]).optional(),
  disembarked: z.union([z.string(), z.date()]).optional(),
  portRequestNo: z.string().optional(),
  statusId: z.number().min(1, "Status is required"),
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional()
    .optional(),
  debitNoteId: z.number(),
  debitNoteNo: z.string().optional(),
  editVersion: z.number(),
})

export type TechnicianSurveyorSchemaType = z.infer<
  typeof TechnicianSurveyorSchema
>

export const ThirdPartySchema = z.object({
  thirdPartyId: z.number(),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  jobOrderNo: z.string().min(1, "Job Order No is required"),
  taskId: z.number().min(1, "Task ID is required"),
  debitNoteId: z.number(),
  debitNoteNo: z.string().optional(),
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional()
    .optional(),
  quantity: z.number().min(0, "Quantity must be 0 or greater"),
  glId: z.number().min(1, "GL Account is required"),
  chargeId: z.number().min(1, "Charge is required"),
  statusId: z.number().min(1, "Status is required"),
  supplierId: z.number().min(1, "Supplier is required"),
  supplierMobileNumber: z.string().optional(),
  uomId: z.number().min(1, "UOM is required"),
  deliverDate: z.union([z.string(), z.date()]).optional(),
  editVersion: z.number(),
})

export type ThirdPartySchemaType = z.infer<typeof ThirdPartySchema>

// Define debitNoteDtSchema first since it's referenced by debitNoteHdSchema
export const debitNoteDtSchema = z
  .object({
    debitNoteId: z.number().min(1, "Debit Note ID is required"),
    debitNoteNo: z.string().min(1, "Debit Note Number is required"),
    itemNo: z.number().min(0, "Item Number is required"),
    taskId: z.number().min(1, "Task ID is required"),
    chargeId: z.number().min(1, "Charge is required"),
    glId: z.number().min(1, "GL Account is required"),
    qty: z.number().min(0, "Quantity must be 0 or greater"),
    unitPrice: z.number().min(0, "Unit price must be 0 or greater"),
    totLocalAmt: z.number(),
    totAmt: z.number().min(0, "Total amount must be 0 or greater"),
    gstId: z.number().min(1, "GST ID is required"),
    gstPercentage: z.number().min(0, "GST percentage must be 0 or greater"),
    gstAmt: z.number().min(0, "GST amount must be 0 or greater"),
    totAftGstAmt: z.number().min(0, "Total after GST must be 0 or greater"),
    remarks: z
      .string()
      .max(500, "Remarks must be less than 500 characters")
      .optional(),
    editVersion: z.number().min(0, "Edit version must be 0 or greater"),
    isServiceCharge: z.boolean(),
    serviceCharge: z.number(),
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
  debitNoteId: z.number(),
  debitNoteNo: z.string().min(1, "Debit Note Number is required"),
  debitNoteDate: z.union([z.string(), z.date()]).optional(),
  jobOrderId: z.number().min(1, "Job Order ID is required"),
  itemNo: z.number().min(0, "Item Number is required"),
  taskId: z.number().min(1, "Task ID is required"),
  serviceId: z.number().min(1, "Service ID is required"),
  chargeId: z.number().min(1, "Charge is required"),
  currencyId: z.number().min(1, "Currency is required"),
  exhRate: z.number().min(0, "Exchange rate must be 0 or greater"),
  totAmt: z.number().min(0, "Total amount must be 0 or greater"),
  gstAmt: z.number().min(0, "GST amount must be 0 or greater"),
  totAftGstAmt: z.number().min(0, "Total after GST must be 0 or greater"),
  glId: z.number().min(1, "GL Account is required"),
  taxableAmt: z.number().min(0, "Taxable amount must be 0 or greater"),
  nonTaxableAmt: z.number().min(0, "Non-taxable amount must be 0 or greater"),
  isLocked: z.boolean(),
  editVersion: z.number().min(0, "Edit version must be 0 or greater"),
  // Nested Details
  data_details: z.array(debitNoteDtSchema).optional(),
})

export type DebitNoteHdSchemaType = z.infer<typeof debitNoteHdSchema>
