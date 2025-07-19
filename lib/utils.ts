import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`
}

export enum ModuleId {
  master = 1,
  operations = 2,
  sales = 3,
  purchase = 4,
  ar = 25,
  ap = 26,
  cb = 27,
  gl = 28,
  setting = 99,
  admin = 100,
}

export enum MasterTransactionId {
  country = 1,
  currency = 2,
  department = 3,
  coa_category1 = 5,
  coa_category2 = 6,
  coa_category3 = 7,
  chart_of_account = 8,
  credit_terms = 9,
  uom = 10,
  employee = 11,
  bank = 12,
  designation = 13,
  port = 14,
  port_region = 15,
  tax = 16,
  tax_category = 17,
  barge = 18,
  vessel = 19,
  order_type = 20,
  order_type_category = 21,
  credit_term_dt = 22,
  currency_dt = 23,
  currency_local_dt = 24,
  voyage = 25,
  customer = 26,
  supplier = 27,
  gst = 28,
  gst_category = 29,
  account_setup = 30,
  product = 31,
  uom_dt = 32,
  gst_dt = 33,
  tax_dt = 34,
  category = 35,
  sub_category = 36,
  group_credit_limit = 37,
  customer_group_credit_limit = 38,
  account_setup_category = 39,
  payment_type = 40,
  account_type = 41,
  account_group = 42,
  customer_credit_limit = 43,
  group_credit_limit_customer = 44,
  supplier_contact = 45,
  account_setup_dt = 46,
  document_type = 47,
  charge = 48,
  task = 49,
  job_order = 50,
  service_type = 51,
  service_type_category = 52,
}

export enum OperationsTransactionId {
  checklist = 1,
  tariff = 2,
  job_order = 1,
  port_expenses = 1,
  launch_service = 2,
  equipment_used = 3,
  crew_sign_on = 4,
  crew_sign_off = 5,
  agency_remuneration = 6,
  consignment_export = 7,
  consignment_import = 8,
  crew_miscellaneous = 9,
  fresh_water = 10,
  landing_items = 11,
  medical_assistance = 12,
  other_service = 13,
  third_party = 14,
  technicians_surveyors = 15,
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

export enum AdminTransactionId {
  user = 1,
  user_rights = 2,
  user_group = 3,
  user_group_rights = 4,
  document_no = 5,
  modules = 6,
  transaction = 7,
  document = 8,
  user_role = 9,
  share_data = 10,
}

export enum SettingTransactionId {
  grid_setting = 1,
  document_no = 2,
  dec_setting = 3,
  fin_setting = 4,
  mandatory_fields = 5,
  visible_fields = 6,
  dynamic_lookup = 7,
  doc_seq_no = 8,
  user_setting = 9,
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
  country = "country",
  currency = "currency",
  currency_dt = "currency_dt",
  currency_local_dt = "currency_local_dt",
  department = "department",
  employee = "employee",
  service_type = "service_type",
  service_type_category = "service_type_category",
  designation = "designation",
  port = "port",
  port_region = "port_region",
  tax = "tax",
  tax_category = "tax_category",
  barge = "barge",
  vessel = "vessel",
  order_type = "order_type",
  order_type_category = "order_type_category",
  credit_term = "credit_term",
  credit_term_dt = "credit_term_dt",
  uom = "uom",
  gst = "gst",
  gst_category = "gst_category",
  account_setup = "account_setup",
  account_setup_category = "account_setup_category",
  account_type = "account_type",
  account_group = "account_group",
  voyage = "voyage",
  product = "product",
  uom_dt = "uom_dt",
  gst_dt = "gst_dt",
  tax_dt = "tax_dt",
  category = "category",
  sub_category = "sub_category",
  group_credit_limit = "group_credit_limit",
  customer_group_credit_limit = "customer_group_credit_limit",
  account_setup_dt = "account_setup_dt",
  document_type = "document_type",
  charge = "charge",
  task = "task",
  job_order = "job_order",
  job_order_dt = "job_order_dt",
  coa_category1 = "coa_category1",
  coa_category2 = "coa_category2",
  coa_category3 = "coa_category3",
  chart_of_account = "chart_of_account",
  payment_type = "payment_type",
  customer = "customer",
  customer_address = "customer_address",
  customer_contact = "customer_contact",
  supplier = "supplier",
  supplier_address = "supplier_address",
  supplier_contact = "supplier_contact",
  bank = "bank",
  bank_address = "bank_address",
  bank_contact = "bank_contact",
  user_group = "user_group",
  user_group_rights = "user_group_rights",
  user_role = "user_role",
  user = "user",

  // operations
  port_expenses = "port_expenses",
  launch_service = "launch_service",
  equipment_used = "equipment_used",
  agency_remuneration = "agency_remuneration",
  consignment_export = "consignment_export",
  consignment_import = "consignment_import",
  crew_miscellaneous = "crew_miscellaneous",
  crew_sign_off = "crew_sign_off",
  crew_sign_on = "crew_sign_on",
  fresh_water = "fresh_water",
  landing_items = "landing_items",
  medical_assistance = "medical_assistance",
  other_service = "other_service",
  third_party = "third_party",
  technicians_surveyors = "technicians_surveyors",
}
