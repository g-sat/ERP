import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts day of week number (1-7) to day name
 * @param dayNumber - Day number (1 = Sunday, 2 = Monday, ..., 7 = Saturday)
 * @returns Day name or original value if invalid
 */
export function getDayName(dayNumber: string | number | undefined): string {
  if (!dayNumber) return "Sunday"

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]

  const num =
    typeof dayNumber === "string" ? parseInt(dayNumber, 10) : dayNumber

  return num >= 1 && num <= 7 ? dayNames[num - 1] : "Sunday"
}

/**
 * Converts day of week number to short day name
 * @param dayNumber - Day number (1 = Sun, 2 = Mon, ..., 7 = Sat)
 * @returns Short day name or original value if invalid
 */
export function getShortDayName(
  dayNumber: string | number | undefined
): string {
  if (!dayNumber) return "Sun"

  const shortDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const num =
    typeof dayNumber === "string" ? parseInt(dayNumber, 10) : dayNumber

  return num >= 1 && num <= 7 ? shortDayNames[num - 1] : "Sun"
}

/**
 * Gets the day number from a Date object (1-7, where 1 = Sunday)
 * @param date - Date object
 * @returns Day number (1-7)
 */
export function getDayNumber(date: Date): number {
  return date.getDay() + 1 // getDay() returns 0-6, we want 1-7
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`
}

export enum ModuleId {
  master = 1,
  sales = 2,
  purchase = 3,
  operations = 4,
  hr = 5,
  dashboard = 6,
  approvals = 7,
  document = 8,
  request = 9,

  ar = 25,
  ap = 26,
  cb = 27,
  gl = 28,
  setting = 99,
  admin = 100,
}

export enum MasterTransactionId {
  accountGroup = 1,
  accountSetup = 2,
  accountSetupCategory = 3,
  accountSetupDt = 4,
  accountType = 5,
  bank = 6,
  barge = 7,
  category = 8,
  charge = 9,
  chartOfAccount = 10,
  coaCategory1 = 11,
  coaCategory2 = 12,
  coaCategory3 = 13,
  country = 14,
  creditTerm = 15,
  creditTermDt = 16,
  currency = 17,
  currencyDt = 18,
  currencyLocalDt = 19,
  customer = 20,
  customerCreditLimit = 21,
  department = 22,
  designation = 23,
  documentType = 24,
  employee = 25,
  employeeCategory = 26,
  entityType = 27,
  groupCreditLimit = 28,
  gst = 29,
  gstCategory = 30,
  gstDt = 31,
  leaveType = 32,
  loanType = 33,
  orderType = 34,
  orderTypeCategory = 35,
  paymentType = 36,
  port = 37,
  portRegion = 38,
  product = 39,
  serviceType = 40,
  serviceTypeCategory = 41,
  subCategory = 42,
  supplier = 43,
  task = 44,
  tax = 45,
  taxCategory = 46,
  taxDt = 47,
  uom = 48,
  uomDt = 49,
  vessel = 50,
  voyage = 51,
  workLocation = 52,
}

export enum AdminTransactionId {
  user = 1,
  userRights = 2,
  userGroup = 3,
  userGroupRights = 4,
  userRoles = 5,
  userProfile = 6,
  shareData = 7,
  company = 8,
  document = 9,
  notDefine = 100,
}

export enum SettingTransactionId {
  gridSetting = 1,
  documentNo = 2,
  decSetting = 3,
  finSetting = 4,
  mandatoryFields = 5,
  visibleFields = 6,
  dynamicLookup = 7,
  docSeqNo = 8,
  userSetting = 9,
  operationSetting = 10,
}

export enum OperationsTransactionId {
  checklist = 1,
  tariff = 2,
  template = 3,
  job_order = 4,
  port_expenses = 5,
  launch_service = 6,
  equipment_used = 7,
  crew_sign_on = 8,
  crew_sign_off = 9,
  agency_remuneration = 10,
  consignment_export = 11,
  consignment_import = 12,
  crew_miscellaneous = 13,
  fresh_water = 14,
  landing_items = 15,
  medical_assistance = 16,
  other_service = 17,
  third_party = 18,
  technicians_surveyors = 19,
}

export enum ARTransactionId {
  invoice = 1,
  debit_note = 2,
  credit_note = 3,
  adjustment = 4,
  receipt = 5,
  refund = 6,
  doc_setoff = 7,
  reports = 99,
}

export enum APTransactionId {
  invoice = 1,
  debit_note = 2,
  credit_note = 3,
  adjustment = 4,
  payment = 5,
  refund = 6,
  doc_setoff = 7,
  reports = 99,
}

export enum CBTransactionId {
  cb_receipt = 1,
  cb_payment = 2,
  cb_patty_cash = 3,
  cb_bank_transfer = 4,
  cb_bank_recon = 5,
  reports = 99,
}

export enum GLTransactionId {
  journal_entry = 1,
  ar_ap_contra = 2,
  fixed_asset = 3,
  opening_balance = 4,
  year_end_process = 5,
  period_close = 6,
  reports = 99,
}

export enum HRTransactionId {
  employees = 1,
  loan = 2,
  leave = 3,
  attendance = 4,
  payruns = 5,
  setting = 6,
}

export enum DashboardTransactionId {
  dashboard1 = 1,
  dashboard2 = 2,
  dashboard3 = 3,
  dashboard4 = 4,
  dashboard5 = 5,
  dashboard6 = 6,
  dashboard7 = 7,
  dashboard8 = 8,
  dashboard9 = 9,
  dashboard10 = 10,
}

export enum RequestTransactionId {
  loan = 1,
  leave = 2,
  pettyCash = 3,
}

export enum DocumentTransactionId {
  document = 1,
}

export enum ApprovalsTransactionId {
  approvals = 1,
}

export function getModuleAndTransactionId(pathname: string): {
  moduleId: number
  transactionId: number
} {
  // Extract the module name and transaction name from the URL path
  // Expected path structure: /[companyId]/module/transaction
  const pathParts = pathname.split("/")

  // Skip the first empty part and companyId, then get module and transaction
  const moduleName = pathParts[2]?.toLowerCase() // e.g., 'admin', 'master', etc.
  const transactionName = pathParts[3]?.toLowerCase() // e.g., 'user', 'account-type', etc.

  // Map module name to module ID
  const moduleId = ModuleId[moduleName as keyof typeof ModuleId] || 0

  // Map transaction name to transaction ID based on module
  let transactionId = 0

  switch (moduleId) {
    case ModuleId.master:
      transactionId =
        MasterTransactionId[
          transactionName as keyof typeof MasterTransactionId
        ] || 0
      break
    case ModuleId.operations:
      transactionId =
        OperationsTransactionId[
          transactionName as keyof typeof OperationsTransactionId
        ] || 0
      break
    case ModuleId.ar:
      transactionId =
        ARTransactionId[transactionName as keyof typeof ARTransactionId] || 0
      break
    case ModuleId.ap:
      transactionId =
        APTransactionId[transactionName as keyof typeof APTransactionId] || 0
      break
    case ModuleId.cb:
      transactionId =
        CBTransactionId[transactionName as keyof typeof CBTransactionId] || 0
      break
    case ModuleId.gl:
      transactionId =
        GLTransactionId[transactionName as keyof typeof GLTransactionId] || 0
      break
    case ModuleId.admin:
      transactionId =
        AdminTransactionId[
          transactionName as keyof typeof AdminTransactionId
        ] || 0
      break
    case ModuleId.setting:
      transactionId =
        SettingTransactionId[
          transactionName as keyof typeof SettingTransactionId
        ] || 0
      break
  }

  return { moduleId, transactionId }
}

export enum TableName {
  //admin
  auditlog = "AdmAuditLog",
  errorlog = "AdmErrorLog",
  userlog = "AdmUserLog",
  user = "AdmUser",
  userRole = "AdmUserRole",
  userGroup = "AdmUserGroup",
  userGroupRights = "AdmUserGroupRights",
  userRights = "AdmUserRights",
  userProfile = "AdmUserProfile",
  shareData = "AdmShareData",
  company = "AdmCompany",
  document = "AdmDocument",
  notDefine = "AdmNotDefine",

  //mater
  accountGroup = "M_AccountGroup",
  accountSetup = "M_AccountSetup",
  accountSetupCategory = "M_AccountSetupCategory",
  accountSetupDt = "M_AccountSetupDt",
  accountType = "M_AccountType",
  bank = "M_Bank",
  bankAddress = "M_BankAddress",
  bankContact = "M_BankContact",
  barge = "M_Barge",
  category = "M_Category",
  charge = "M_Charge",
  chartOfAccount = "M_ChartOfAccount",
  coaCategory1 = "M_COACategory1",
  coaCategory2 = "M_COACategory2",
  coaCategory3 = "M_COACategory3",
  country = "M_Country",
  creditTerm = "M_CreditTerm",
  creditTermDt = "M_CreditTermDt",
  currency = "M_Currency",
  currencyDt = "M_CurrencyDt",
  currencyLocalDt = "M_CurrencyLocalDt",
  customer = "M_Customer",
  customerAddress = "M_CustomerAddress",
  customerContact = "M_CustomerContact",
  customerCreditLimit = "M_CustomerCreditLimit",
  department = "M_Department",
  designation = "M_Designation",
  documentType = "M_DocumentType",
  employee = "M_Employee",
  employeeCategory = "M_EmployeeCategory",
  entityTypes = "M_EntityTypes",
  groupCreditLimit = "M_GroupCreditLimit",
  groupCreditLimitCustomer = "M_GroupCreditLimit_Customer",
  groupCreditLimitDt = "M_GroupCreditLimitDt",
  gst = "M_Gst",
  gstCategory = "M_GstCategory",
  gstDt = "M_GstDt",
  leaveType = "M_LeaveType",
  loanType = "M_LoanType",
  orderType = "M_OrderType",
  orderTypeCategory = "M_OrderTypeCategory",
  paymentType = "M_PaymentType",
  port = "M_Port",
  portRegion = "M_PortRegion",
  product = "M_Product",
  serviceType = "M_ServiceType",
  serviceTypeCategory = "M_ServiceTypeCategory",
  shift = "M_Shift",
  status = "M_Status",
  subCategory = "M_SubCategory",
  supplier = "M_Supplier",
  supplierAddress = "M_SupplierAddress",
  supplierBank = "M_SupplierBank",
  supplierContact = "M_SupplierContact",
  task = "M_Task",
  tax = "M_Tax",
  taxCategory = "M_TaxCategory",
  taxDt = "M_TaxDt",
  uom = "M_Uom",
  uomDt = "M_UomDt",
  vessel = "M_Vessel",
  voyage = "M_Voyage",
  workLocation = "M_WorkLocation",

  // operations
  checklist = "checklist",
  portExpense = "portExpense",
  launchService = "launchService",
  equipmentUsed = "equipmentUsed",
  agencyRemuneration = "agencyRemuneration",
  consignmentExport = "consignmentExport",
  consignmentImport = "consignmentImport",
  crewMiscellaneous = "crewMiscellaneous",
  crewSignOff = "crewSignOff",
  crewSignOn = "crewSignOn",
  freshWater = "freshWater",
  landingItems = "landingItems",
  medicalAssistance = "medicalAssistance",
  otherService = "otherService",
  thirdParty = "thirdParty",
  techniciansSurveyors = "techniciansSurveyors",
  debitNote = "debitNote",
  tariff = "tariff",

  //AR
  arInvoice = "arInvoice",
  arDebitNote = "arDebitNote",
  arCreditNote = "arCreditNote",
  arAdjustment = "arAdjustment",
  arReceipt = "arReceipt",
  arRefund = "arRefund",
  arDocSetoff = "arDocSetoff",

  //AP
  apInvoice = "apInvoice",
  apDebitNote = "apDebitNote",
  apCreditNote = "apCreditNote",
  apAdjustment = "apAdjustment",
  apPayment = "apPayment",
  apRefund = "apRefund",
  apDocSetoff = "apDocSetoff",

  //CB
  cbReceipt = "cbReceipt",
  cbPayment = "cbPayment",
  cbPattyCash = "cbPattyCash",
  cbBankTransfer = "cbBankTransfer",
  cbBankRecon = "cbBankRecon",

  //GL
  journalEntry = "journalEntry",
  arApContra = "arApContra",
  fixedAsset = "fixedAsset",
  openingBalance = "openingBalance",
  yearEndProcess = "yearEndProcess",
  periodClose = "periodClose",
  template = "template",
}
