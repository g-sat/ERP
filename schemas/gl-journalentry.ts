import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import * as z from "zod"

// ============================================
// GL JOURNAL DETAIL SCHEMA
// ============================================
export const GLJournalDtSchema = (
  required: IMandatoryFields,
  visible: IVisibleFields
) => {
  return z.object({
    // Core Identifiers
    journalId: z.string().optional(),
    journalNo: z.string().optional(),
    itemNo: z.number(),
    seqNo: z.number().optional(),

    // GL Account
    glId: z.number().min(1, "GL Account is required"),

    glCode: z.string().optional(),
    glName: z.string().optional(),

    // Remarks
    remarks: required?.m_Remarks
      ? z.string().min(3, "Remarks must be at least 3 characters")
      : z.string().optional(),

    // Product
    productId: visible?.m_ProductId
      ? required?.m_ProductId
        ? z.number().min(1, "Product is required")
        : z.number().optional()
      : z.number().optional(),

    productCode: z.string().optional(),
    productName: z.string().optional(),

    // Debit/Credit Flag
    isDebit: z.boolean(),

    // Amounts
    totAmt: z.number().min(0.01, "Amount must be greater than 0"),
    totLocalAmt: z.number().optional(),
    totCtyAmt: visible?.m_CtyCurr ? z.number().min(0) : z.number().optional(),

    // GST Fields
    gstId: visible?.m_GstId
      ? required?.m_GstId
        ? z.number().min(1, "GST is required")
        : z.number().optional()
      : z.number().optional(),
    gstName: z.string().optional(),
    gstCode: z.string().optional(),

    gstPercentage: z.number().optional(),
    gstAmt: z.number().optional(),
    gstLocalAmt: z.number().optional(),
    gstCtyAmt: visible?.m_CtyCurr ? z.number().min(0) : z.number().optional(),

    // Dimensional Fields
    departmentId: visible?.m_DepartmentId
      ? required?.m_DepartmentId
        ? z.number().min(1, "Department is required")
        : z.number().optional()
      : z.number().optional(),

    departmentCode: z.string().optional(),
    departmentName: z.string().optional(),

    employeeId: visible?.m_EmployeeId
      ? required?.m_EmployeeId
        ? z.number().min(1, "Employee is required")
        : z.number().optional()
      : z.number().optional(),

    employeeCode: z.string().optional(),
    employeeName: z.string().optional(),

    portId: visible?.m_PortId
      ? required?.m_PortId
        ? z.number().min(1, "Port is required")
        : z.number().optional()
      : z.number().optional(),

    portCode: z.string().optional(),
    portName: z.string().optional(),

    vesselId: visible?.m_VesselId
      ? required?.m_VesselId
        ? z.number().min(1, "Vessel is required")
        : z.number().optional()
      : z.number().optional(),

    vesselCode: z.string().optional(),
    vesselName: z.string().optional(),

    bargeId: visible?.m_BargeId
      ? required?.m_BargeId
        ? z.number().min(1, "Barge is required")
        : z.number().optional()
      : z.number().optional(),

    bargeCode: z.string().optional(),
    bargeName: z.string().optional(),

    voyageId: visible?.m_VoyageId
      ? required?.m_VoyageId
        ? z.number().min(1, "Voyage is required")
        : z.number().optional()
      : z.number().optional(),

    voyageNo: z.string().optional(),

    // Job Order Fields
    jobOrderId: visible?.m_JobOrderId
      ? required?.m_JobOrderId
        ? z.number().min(1, "Job Order is required")
        : z.number().optional()
      : z.number().optional(),

    jobOrderNo: z.string().optional(),

    taskId: visible?.m_JobOrderId
      ? required?.m_JobOrderId
        ? z.number().min(1, "Task is required")
        : z.number().optional()
      : z.number().optional(),

    taskName: z.string().optional(),

    serviceId: visible?.m_JobOrderId
      ? required?.m_JobOrderId
        ? z.number().min(1, "Service is required")
        : z.number().optional()
      : z.number().optional(),

    serviceName: z.string().optional(),

    // Audit
    editVersion: z.number().optional(),
  })
}

export type GLJournalDtSchemaType = z.infer<
  ReturnType<typeof GLJournalDtSchema>
>

// ============================================
// GL JOURNAL HEADER SCHEMA
// ============================================
export const GLJournalHdSchema = (
  required: IMandatoryFields,
  visible: IVisibleFields
) => {
  return z.object({
    // Core Identifiers
    companyId: z.number().optional(),
    journalId: z.string().optional(),
    journalNo: z.string().optional(),

    // Reference
    referenceNo: required?.m_ReferenceNo
      ? z.string().min(1, "Reference No is required")
      : z.string().optional(),

    // Dates
    trnDate: z.union([z.date(), z.string()]),
    accountDate: z.union([z.date(), z.string()]),

    // Currency Fields
    currencyId: z.number().min(1, "Currency is required"),
    exhRate: z.number().min(0.000001, "Exchange Rate must be greater than 0"),
    ctyExhRate: visible?.m_CtyCurr
      ? z.number().min(0.000001, "City Exchange Rate must be greater than 0")
      : z.number().optional(),

    // Amounts (calculated from details)
    totAmt: z.number().optional(),
    totLocalAmt: z.number().optional(),
    totCtyAmt: visible?.m_CtyCurr ? z.number().min(0) : z.number().optional(),

    // GST Fields (calculated from details)
    gstClaimDate: z.union([z.date(), z.string(), z.null()]).optional(),
    gstAmt: z.number().optional(),
    gstLocalAmt: z.number().optional(),
    gstCtyAmt: visible?.m_CtyCurr ? z.number().min(0) : z.number().optional(),
    totAmtAftGst: z.number().optional(),
    totLocalAmtAftGst: z.number().optional(),
    totCtyAmtAftGst: visible?.m_CtyCurr
      ? z.number().min(0)
      : z.number().optional(),

    // Remarks
    remarks: required?.m_Remarks_Hd
      ? z.string().min(3, "Remarks must be at least 3 characters")
      : z.string().optional(),

    // Journal-Specific Fields
    isReverse: z.boolean().optional(),
    isRecurrency: z.boolean().optional(),
    revDate: z.union([z.date(), z.string(), z.null()]).optional(),
    recurrenceUntil: z.union([z.date(), z.string(), z.null()]).optional(),

    // Module Reference
    moduleFrom: z.string().optional(),

    // Audit Fields
    createById: z.number().optional(),
    createDate: z.union([z.date(), z.string()]).optional(),
    editById: z.number().optional().nullable(),
    editDate: z.union([z.date(), z.string(), z.null()]).optional(),
    editVersion: z.number().optional(),

    // Cancel Fields
    isCancel: z.boolean().optional(),
    cancelById: z.number().optional().nullable(),
    cancelDate: z.union([z.date(), z.string(), z.null()]).optional(),
    cancelRemarks: z.string().optional().nullable(),

    // Post Fields
    isPost: z.boolean().optional().nullable(),
    postById: z.number().optional().nullable(),
    postDate: z.union([z.date(), z.string(), z.null()]).optional(),

    // Approval Fields
    appStatusId: z.number().optional().nullable(),
    appById: z.number().optional().nullable(),
    appDate: z.union([z.date(), z.string(), z.null()]).optional(),

    // Audit Lookup Fields (returned from API, not submitted)
    createBy: z.string().optional(),
    editBy: z.string().optional(),
    cancelBy: z.string().optional(),
    postBy: z.string().optional(),
    appBy: z.string().optional(),

    // Nested Details Array
    data_details: z.array(GLJournalDtSchema(required, visible)),
  })
}

export type GLJournalHdSchemaType = z.infer<
  ReturnType<typeof GLJournalHdSchema>
>

// ============================================
// FILTER SCHEMA
// ============================================
export const GLJournalFilterSchema = z.object({
  startDate: z.union([z.date(), z.string()]),
  endDate: z.union([z.date(), z.string()]),
  search: z.string().optional(),
  sortOrder: z.string().optional(),
  sortBy: z.string().optional(),
  pageNumber: z.number().optional(),
  pageSize: z.number().optional(),
})

export type GLJournalFilterSchemaType = z.infer<typeof GLJournalFilterSchema>
