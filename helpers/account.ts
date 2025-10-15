/**
 * Account Helper Functions
 *
 * This module provides shared utility functions for financial calculations
 * and form operations across all accounting modules:
 *
 * - AP (Accounts Payable)
 * - AR (Accounts Receivable)
 * - CB (Cash Book)
 * - GL (General Ledger)
 *
 * All functions are designed to work with any form type and data structure
 * to ensure maximum reusability across different modules.
 */

import { IDecimal } from "@/interfaces/auth"
import { IVisibleFields } from "@/interfaces/setting"
import { addDays, format, parse } from "date-fns"

import { getData } from "@/lib/api-client"
import { BasicSetting, Lookup } from "@/lib/api-routes"
import { clientDateFormat } from "@/lib/date-utils"

// Generic types for cross-module compatibility (AP, AR, CB, GL)
// Using 'any' type intentionally to support all module-specific form types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HdForm = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DtForm = any

// ============================================================================
// CALCULATION UTILITIES
// ============================================================================

/**
 * Round a number to specified precision
 * @param amtValue - The amount to round
 * @param precision - Number of decimal places
 * @returns Rounded number
 */
export const mathRound = (amtValue: number, precision: number): number => {
  const factor = Math.pow(10, precision)
  return Math.round(amtValue * factor) / factor
}

/**
 * Calculate multiplier amount with precision
 * Used for: Exchange rate conversions, Quantity × Price calculations
 */
export const calculateMultiplierAmount = (
  baseAmount: number,
  multiplier: number,
  precision: number
  // isMultiply?: boolean
): number => {
  // const total = isMultiply ? baseAmount * multiplier : baseAmount / multiplier;
  const total = baseAmount * multiplier
  const rounded = mathRound(total, precision)
  //const rounded = Math.round(total * Math.pow(10, precision)) / Math.pow(10, precision);
  return Number(rounded)
}

/**
 * Calculate addition amount with precision
 * Used for: Adding discounts, surcharges, or adjustments
 */
export const calculateAdditionAmount = (
  baseAmount: number,
  additionamt: number,
  precision: number
): number => {
  const total = baseAmount + additionamt
  const rounded = mathRound(total, precision)
  //const rounded = Math.round(total * Math.pow(10, precision)) / Math.pow(10, precision);
  return Number(rounded)
}

/**
 * Calculate percentage amount with precision
 * Used for: GST calculations, discount percentages, tax calculations
 */
export const calculatePercentagecAmount = (
  baseAmount: number,
  percentage: number,
  precision: number
): number => {
  const total = (baseAmount * percentage) / 100
  const rounded = mathRound(total, precision)
  return Number(rounded)
}

/**
 * Calculate division amount with precision
 * Used for: Unit price calculations, average calculations
 */
export const calculateDivisionAmount = (
  baseAmount: number,
  divisor: number,
  precision: number
): number => {
  const total = baseAmount / divisor
  const rounded = mathRound(total, precision)
  return Number(rounded)
}

/**
 * Calculate subtraction amount with precision
 * Used for: Deductions, returns, credit calculations
 */
export const calculateSubtractionAmount = (
  baseAmount: number,
  subtractAmt: number,
  precision: number
): number => {
  const total = baseAmount - subtractAmt
  const rounded = mathRound(total, precision)
  return Number(rounded)
}

// ============================================================================
// FORM HANDLERS - Invoice/Transaction Details
// ============================================================================

/**
 * Handle quantity change in invoice details
 * Calculates: Total Amount = Bill Quantity × Unit Price
 * Uses billQTY (billing quantity) for calculations, not qty (physical quantity)
 * Modules: AP, AR
 */
export const handleQtyChange = (
  hdForm: HdForm,
  rowData: DtForm,
  decimals: IDecimal,
  visible: IVisibleFields
) => {
  // Use billQTY for billing calculations (not qty)
  // billQTY is the quantity used for invoicing/payment
  // qty is the physical/actual quantity
  const billQTY = rowData?.billQTY ?? rowData?.qty ?? 0
  const unitPrice = rowData?.unitPrice ?? 0
  const exchangeRate = hdForm.getValues()?.exhRate ?? 0

  // Calculate total amount (allow 0 values)
  const totAmt = calculateMultiplierAmount(billQTY, unitPrice, decimals?.amtDec)
  rowData.totAmt = totAmt

  // Calculate local amounts if exchange rate exists
  if (
    exchangeRate !== 0 &&
    exchangeRate !== null &&
    exchangeRate !== undefined
  ) {
    handleTotalamountChange(hdForm, rowData, decimals, visible)
  }
}

/**
 * Handle total amount change
 * Calculates: Local Amount = Total × Exchange Rate
 * Then triggers city amount and GST calculations
 * Modules: AP, AR
 */
export const handleTotalamountChange = (
  hdForm: HdForm,
  rowData: DtForm,
  decimals: IDecimal,
  visible: IVisibleFields
) => {
  const totAmt = rowData?.totAmt ?? 0
  const exchangeRate = hdForm.getValues()?.exhRate ?? 0

  // Calculate local amount (allow 0 values)
  const totLocalAmt = calculateMultiplierAmount(
    totAmt,
    exchangeRate,
    decimals?.locAmtDec
  )
  rowData.totLocalAmt = totLocalAmt

  // Calculate city amount
  handleTotalCityamountChange(hdForm, rowData, decimals, visible)

  // Calculate GST amounts
  handleGstPercentageChange(hdForm, rowData, decimals, visible)
}

export const handleGstPercentageChange = (
  hdForm: HdForm,
  rowData: DtForm,
  decimals: IDecimal,
  visible: IVisibleFields
) => {
  const totAmt = rowData?.totAmt ?? 0
  const gstRate = rowData?.gstPercentage ?? 0
  const exchangeRate = hdForm.getValues()?.exhRate ?? 0

  // Calculate GST amount (allow 0 values)
  const gstAmt = calculatePercentagecAmount(totAmt, gstRate, decimals?.amtDec)
  rowData.gstAmt = gstAmt

  // Calculate GST local amount
  const gstLocalAmt = calculateMultiplierAmount(
    gstAmt,
    exchangeRate,
    decimals?.locAmtDec
  )
  rowData.gstLocalAmt = gstLocalAmt

  // Calculate GST city amount
  handleGstCityPercentageChange(hdForm, rowData, decimals, visible)
}

export const handleTotalCityamountChange = (
  hdForm: HdForm,
  rowData: DtForm,
  decimals: IDecimal,
  visible: IVisibleFields
) => {
  const totAmt = rowData?.totAmt ?? 0
  const exchangeRate = hdForm.getValues()?.exhRate ?? 0
  const cityExchangeRate = hdForm.getValues()?.ctyExhRate ?? 0
  let totCtyAmt = 0

  if (visible?.m_CtyCurr) {
    totCtyAmt = calculateMultiplierAmount(
      totAmt,
      cityExchangeRate,
      decimals?.locAmtDec
    )
  } else {
    totCtyAmt = calculateMultiplierAmount(
      totAmt,
      exchangeRate,
      decimals?.locAmtDec
    )
  }

  rowData.totCtyAmt = totCtyAmt
}

export const handleGstCityPercentageChange = (
  hdForm: HdForm,
  rowData: DtForm,
  decimals: IDecimal,
  visible: IVisibleFields
) => {
  const gstAmt = rowData?.gstAmt ?? 0
  const exchangeRate = hdForm.getValues()?.exhRate ?? 0
  const cityExchangeRate = hdForm.getValues()?.ctyExhRate ?? 0
  let gstCtyAmt = 0

  if (visible?.m_CtyCurr) {
    gstCtyAmt = calculateMultiplierAmount(
      gstAmt,
      cityExchangeRate,
      decimals?.locAmtDec
    )
  } else {
    gstCtyAmt = calculateMultiplierAmount(
      gstAmt,
      exchangeRate,
      decimals?.locAmtDec
    )
  }
  rowData.gstCtyAmt = gstCtyAmt
}

export const handleDetailsChange = (
  hdForm: HdForm,
  dtForm: HdForm,
  decimals: IDecimal
) => {
  const formData = hdForm.getValues()
  const detailsData = dtForm.getValues()

  if (detailsData.amount) {
    detailsData.localAmount = calculateMultiplierAmount(
      detailsData.amount,
      formData.exhRate,
      decimals?.locAmtDec
    )
  }

  if (detailsData.gstAmount) {
    detailsData.gstLocalAmount = calculateMultiplierAmount(
      detailsData.gstAmount,
      formData.exhRate,
      decimals?.locAmtDec
    )
  }

  if (formData.ctyExhRate && detailsData.amount) {
    detailsData.ctyAmount = calculateMultiplierAmount(
      detailsData.amount,
      formData.ctyExhRate,
      decimals?.ctyAmtDec
    )
  }

  if (formData.ctyExhRate && detailsData.gstAmount) {
    detailsData.gstCtyAmount = calculateMultiplierAmount(
      detailsData.gstAmount,
      formData.ctyExhRate,
      decimals?.ctyAmtDec
    )
  }
  dtForm.reset(detailsData)
}

// ============================================================================
// API UTILITIES - Data Fetching & Auto-population
// ============================================================================

/**
 * Fetch and set GST percentage based on account date
 * Modules: AP, AR
 */
export const setGSTPercentage = async (
  hdForm: HdForm,
  dtForm: HdForm,
  decimals: IDecimal,
  visible: IVisibleFields
) => {
  //
  const { gstId } = dtForm?.getValues()
  const { accountDate } = hdForm?.getValues()

  if (accountDate && gstId) {
    try {
      const dt = format(
        parse(accountDate, clientDateFormat, new Date()),
        "yyyy-MM-dd"
      )

      const res = await getData(
        `${BasicSetting.getGstPercentage}/${gstId}/${dt}`
      )
      const gstPercentage = res?.data as number
      dtForm?.setValue("gstPercentage", gstPercentage)
      dtForm.trigger("gstPercentage")
      handleGstPercentageChange(hdForm, dtForm, decimals, visible)
    } catch (error) {
      console.error("Error fetching GST percentage:", error)
    }
  }
}

/**
 * Calculate and set due date based on credit term
 * Due Date = Account Date + Credit Term Days
 * Modules: AP, AR
 */
export const setDueDate = async (form: HdForm) => {
  //to set due date
  const { accountDate, creditTermId, deliveryDate } = form?.getValues()

  if (deliveryDate && creditTermId) {
    try {
      const dt = format(
        parse(accountDate, clientDateFormat, new Date()),
        "yyyy-MM-dd"
      )
      const res = await getData(
        `${BasicSetting.getDaysfromCreditTerm}/${creditTermId}/${dt}`
      )

      const days = res?.data as number
      const dueDate = addDays(deliveryDate, days)

      form.setValue("dueDate", format(dueDate, clientDateFormat))
      form.trigger("dueDate")
    } catch {}
  }
}

/**
 * Fetch and set exchange rate based on currency and date
 * Also sets city exchange rate if not using separate city currency
 * Modules: AP, AR, CB, GL
 */
export const setExchangeRate = async (
  form: HdForm,
  round: number | 6,
  visible: IVisibleFields
) => {
  // to set exhange rate
  const { accountDate, currencyId } = form?.getValues()
  if (accountDate && currencyId) {
    try {
      const dt = format(
        parse(accountDate, clientDateFormat, new Date()),
        "yyyy-MM-dd"
      )
      const res = await getData(
        `${BasicSetting.getExchangeRate}/${currencyId}/${dt}`
      )

      const exhRate = res?.data

      form.setValue("exhRate", +Number(exhRate).toFixed(round))
      if (!visible?.m_CtyCurr) {
        form.setValue("ctyExhRate", +Number(exhRate).toFixed(round))
        form.trigger("ctyExhRate")
      }
      form.trigger("exhRate")
    } catch {}
  }
}

/**
 * Fetch and set exchange rate based on currency and date
 * Also sets city exchange rate if not using separate city currency
 * Modules: AP, AR, CB, GL
 */
export const setFromExchangeRate = async (
  form: HdForm,
  round: number | 6,
  visible: IVisibleFields,
  currencyFieldName: string = "currencyId"
) => {
  // to set exhange rate
  const accountDate = form?.getValues("accountDate")
  const currencyId = form?.getValues(currencyFieldName)

  if (accountDate && currencyId) {
    try {
      const dt =
        typeof accountDate === "string"
          ? format(
              parse(accountDate, clientDateFormat, new Date()),
              "yyyy-MM-dd"
            )
          : format(accountDate, "yyyy-MM-dd")
      const res = await getData(
        `${BasicSetting.getExchangeRate}/${currencyId}/${dt}`
      )

      const exhRate = res?.data

      form.setValue("fromExhRate", +Number(exhRate).toFixed(round))
      form.trigger("fromExhRate")
    } catch {}
  }
}

/**
 * Fetch and set exchange rate based on currency and date
 * Also sets city exchange rate if not using separate city currency
 * Modules: AP, AR, CB, GL
 */
export const setToExchangeRate = async (
  form: HdForm,
  round: number | 6,
  visible: IVisibleFields,
  currencyFieldName: string = "currencyId"
) => {
  // to set exhange rate
  const accountDate = form?.getValues("accountDate")
  const currencyId = form?.getValues(currencyFieldName)

  if (accountDate && currencyId) {
    try {
      const dt =
        typeof accountDate === "string"
          ? format(
              parse(accountDate, clientDateFormat, new Date()),
              "yyyy-MM-dd"
            )
          : format(accountDate, "yyyy-MM-dd")
      const res = await getData(
        `${BasicSetting.getExchangeRate}/${currencyId}/${dt}`
      )

      const exhRate = res?.data

      form.setValue("toExhRate", +Number(exhRate).toFixed(round))
      form.trigger("toExhRate")
    } catch {}
  }
}

/**
 * Fetch and set exchange rate based on currency and date
 * Also sets city exchange rate if not using separate city currency
 * Modules: AP, AR, CB, GL
 */
export const setPayExchangeRate = async (form: HdForm, round: number | 6) => {
  // to set exhange rate
  const { accountDate, payCurrencyId } = form?.getValues()
  if (accountDate && payCurrencyId) {
    try {
      const dt = format(
        parse(accountDate, clientDateFormat, new Date()),
        "yyyy-MM-dd"
      )
      const res = await getData(
        `${BasicSetting.getExchangeRate}/${payCurrencyId}/${dt}`
      )

      const exhRate = res?.data

      form.setValue("payExhRate", +Number(exhRate).toFixed(round))
      form.trigger("payExhRate")
    } catch {}
  }
}

/**
 * Fetch and set local currency exchange rate
 * Used for city/country currency conversions
 * Modules: AP, AR, CB, GL
 */
export const setExchangeRateLocal = async (form: HdForm, round: number | 6) => {
  // to set exhange rate
  const { accountDate, currencyId } = form?.getValues()
  if (accountDate && currencyId) {
    try {
      const dt = format(
        parse(accountDate, clientDateFormat, new Date()),
        "yyyy-MM-dd"
      )
      const res = await getData(
        `${BasicSetting.getExchangeRateLocal}/${currencyId}/${dt}`
      )
      const exhRate = res?.data
      form.setValue("ctyExhRate", +Number(exhRate).toFixed(round))
      form.trigger("ctyExhRate")
    } catch {}
  }
}

/**
 * Fetch and set receiving/payment exchange rates for receipts
 * Sets both recExhRate and payExhRate
 * Modules: AR (Receipt), AP (Payment)
 */
export const setRecExchangeRate = async (form: HdForm, round: number | 6) => {
  // to set recving exhange rate for the receipt
  const { accountDate, currencyId } = form?.getValues()
  if (accountDate && currencyId) {
    try {
      const dt = format(
        parse(accountDate, clientDateFormat, new Date()),
        "yyyy-MM-dd"
      )
      const res = await getData(
        `${BasicSetting.getExchangeRate}/${currencyId}/${dt}`
      )

      const exhRate = res?.data
      form.setValue("recExhRate", +Number(exhRate).toFixed(round))
      form.setValue("payExhRate", +Number(exhRate).toFixed(round))
    } catch {}
  }
}

/**
 * Fetch and populate customer address and contact details
 * Auto-fills: address, phone, contact name, email, fax
 * Modules: AR
 */
export enum EntityType {
  CUSTOMER = "customer",
  SUPPLIER = "supplier",
  BANK = "bank",
}

export const setAddressContactDetails = async (
  form: HdForm,
  entityType: EntityType
) => {
  // Get the appropriate entity ID based on entity type
  const formValues = form?.getValues()
  const entityId =
    entityType === EntityType.CUSTOMER
      ? formValues.customerId
      : entityType === EntityType.SUPPLIER
        ? formValues.supplierId
        : formValues.bankId

  // Get the appropriate API endpoints based on entity type
  const addressEndpoint =
    entityType === EntityType.CUSTOMER
      ? Lookup.getCustomerAddress
      : entityType === EntityType.SUPPLIER
        ? Lookup.getSupplierAddress
        : Lookup.getBankAddress

  const contactEndpoint =
    entityType === EntityType.CUSTOMER
      ? Lookup.getCustomerContact
      : entityType === EntityType.SUPPLIER
        ? Lookup.getSupplierContact
        : Lookup.getBankContact

  if (entityId !== 0) {
    try {
      const addresses = await getData(`${addressEndpoint}/${entityId}`)
      const contacts = await getData(`${contactEndpoint}/${entityId}`)

      if (addresses && addresses.length !== 0) {
        const data = addresses.data[0]

        await form.setValue("addressId", data?.addressId)
        await form.setValue("address1", data?.address1)
        await form.setValue("address2", data?.address2)
        await form.setValue("address3", data?.address3)
        await form.setValue("address4", data?.address4)
        await form.setValue("pinCode", data?.pinCode)
        await form.setValue("countryId", data?.countryId)
        await form.setValue("phoneNo", data?.phoneNo)

        await form?.trigger("addressId")
        await form?.trigger("address1")
        await form?.trigger("address2")
        await form?.trigger("address3")
        await form?.trigger("address4")
        await form?.trigger("pinCode")
        await form?.trigger("countryId")
        await form?.trigger("phoneNo")

        await form?.clearErrors()
      } else {
        await form.setValue("addressId", 0)
        await form.setValue("address1", "")
        await form.setValue("address2", "")
        await form.setValue("address3", "")
        await form.setValue("address4", "")
        await form.setValue("pinCode", "")
        await form.setValue("countryId", 0)
        await form.setValue("phoneNo", "")

        await form?.trigger("addressId")
        await form?.trigger("address1")
        await form?.trigger("address2")
        await form?.trigger("address3")
        await form?.trigger("address4")
        await form?.trigger("pinCode")
        await form?.trigger("countryId")
        await form?.trigger("phoneNo")

        await form?.clearErrors()
      }

      if (contacts && contacts.length !== 0) {
        const data = contacts.data[0]

        await form.setValue("contactId", data?.contactId)
        await form.setValue("contactName", data?.contactName)
        await form.setValue("mobileNo", data?.mobileNo)
        await form.setValue("emailAdd", data?.emailAdd)
        await form.setValue("faxNo", data?.faxNo)

        await form?.trigger("contactId")
        await form?.trigger("contactName")
        await form?.trigger("mobileNo")
        await form?.trigger("emailAdd")
        await form?.trigger("faxNo")

        await form?.clearErrors()
      } else {
        await form.setValue("contactId", 0)
        await form.setValue("contactName", "")
        await form.setValue("mobileNo", "")
        await form.setValue("emailAdd", "")
        await form.setValue("faxNo", "")

        await form?.trigger("contactId")
        await form?.trigger("contactName")
        await form?.trigger("mobileNo")
        await form?.trigger("emailAdd")
        await form?.trigger("faxNo")

        await form?.clearErrors()
      }
    } catch (error) {
      console.error(
        `Error fetching ${entityType} address and contact details:`,
        error
      )
    }
  }
}
