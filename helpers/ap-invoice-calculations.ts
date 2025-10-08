/**
 * AP Invoice Calculations Module
 *
 * This module provides calculation functions specifically for AP Invoice details:
 * - Quantity × Unit Price = Total Amount
 * - Total Amount × Exchange Rate = Local Amount
 * - GST calculations for all currencies
 *
 * Uses shared calculation utilities from @/helpers/account
 */

import {
  calculateMultiplierAmount,
  calculatePercentagecAmount,
} from "@/helpers/account"
import { IDecimal } from "@/interfaces/auth"
import { IVisibleFields } from "@/interfaces/setting"

export interface IDecimalConfig {
  amtDec: number
  locAmtDec: number
  ctyAmtDec: number
  qtyDec?: number
  priceDec?: number
  exhRateDec?: number
}

export interface IExchangeRates {
  exchangeRate: number
  cityExchangeRate?: number
}

export interface IVisibilityConfig {
  m_CtyCurr?: boolean
}

// ============================================================================
// INVOICE DETAIL CALCULATIONS
// ============================================================================

/**
 * Calculate Total Amount from Bill Quantity and Unit Price
 * Formula: Total Amount = Bill Quantity × Unit Price
 *
 * @param billQty - Bill quantity
 * @param unitPrice - Unit price
 * @param decimals - Decimal configuration
 * @returns Calculated total amount
 */
export const calculateDetailTotalAmount = (
  billQty: number,
  unitPrice: number,
  decimals: IDecimal
): number => {
  if (!billQty || !unitPrice) return 0
  return calculateMultiplierAmount(billQty, unitPrice, decimals.amtDec)
}

/**
 * Calculate Local Amount from Total Amount and Exchange Rate
 * Formula: Local Amount = Total Amount × Exchange Rate
 *
 * @param totAmt - Total amount in base currency
 * @param exchangeRate - Exchange rate
 * @param decimals - Decimal configuration
 * @returns Calculated local amount
 */
export const calculateDetailLocalAmount = (
  totAmt: number,
  exchangeRate: number,
  decimals: IDecimal
): number => {
  if (!totAmt || !exchangeRate) return 0
  return calculateMultiplierAmount(totAmt, exchangeRate, decimals.locAmtDec)
}

/**
 * Calculate City Amount from Total Amount and City Exchange Rate
 * Formula: City Amount = Total Amount × City Exchange Rate
 *
 * @param totAmt - Total amount in base currency
 * @param cityExchangeRate - City exchange rate
 * @param decimals - Decimal configuration
 * @returns Calculated city amount
 */
export const calculateDetailCityAmount = (
  totAmt: number,
  cityExchangeRate: number,
  decimals: IDecimal
): number => {
  if (!totAmt || !cityExchangeRate) return 0
  return calculateMultiplierAmount(totAmt, cityExchangeRate, decimals.ctyAmtDec)
}

/**
 * Calculate GST Amount from Total Amount and GST Percentage
 * Formula: GST Amount = Total Amount × (GST Percentage / 100)
 *
 * @param totAmt - Total amount
 * @param gstPercentage - GST percentage
 * @param decimals - Decimal configuration
 * @returns Calculated GST amount
 */
export const calculateDetailGstAmount = (
  totAmt: number,
  gstPercentage: number,
  decimals: IDecimal
): number => {
  if (!totAmt || !gstPercentage) return 0
  return calculatePercentagecAmount(totAmt, gstPercentage, decimals.amtDec)
}

/**
 * Calculate GST Local Amount from GST Amount and Exchange Rate
 * Formula: GST Local Amount = GST Amount × Exchange Rate
 *
 * @param gstAmt - GST amount
 * @param exchangeRate - Exchange rate
 * @param decimals - Decimal configuration
 * @returns Calculated GST local amount
 */
export const calculateDetailGstLocalAmount = (
  gstAmt: number,
  exchangeRate: number,
  decimals: IDecimal
): number => {
  if (!gstAmt || !exchangeRate) return 0
  return calculateMultiplierAmount(gstAmt, exchangeRate, decimals.locAmtDec)
}

/**
 * Calculate GST City Amount from GST Amount and City Exchange Rate
 * Formula: GST City Amount = GST Amount × City Exchange Rate
 *
 * @param gstAmt - GST amount
 * @param cityExchangeRate - City exchange rate
 * @param decimals - Decimal configuration
 * @returns Calculated GST city amount
 */
export const calculateDetailGstCityAmount = (
  gstAmt: number,
  cityExchangeRate: number,
  decimals: IDecimal
): number => {
  if (!gstAmt || !cityExchangeRate) return 0
  return calculateMultiplierAmount(gstAmt, cityExchangeRate, decimals.ctyAmtDec)
}

// ============================================================================
// COMPREHENSIVE CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate all GST-related amounts (GST amount, GST local, GST city)
 *
 * @param totAmt - Total amount
 * @param gstPercentage - GST percentage
 * @param exchangeRates - Exchange rates object
 * @param decimals - Decimal configuration
 * @param visible - Visibility configuration
 * @returns Object with all GST amounts
 */
export const calculateAllGstAmounts = (
  totAmt: number,
  gstPercentage: number,
  exchangeRates: IExchangeRates,
  decimals: IDecimal,
  visible?: IVisibleFields
) => {
  const gstAmt = calculateDetailGstAmount(totAmt, gstPercentage, decimals)

  const gstLocalAmt = calculateDetailGstLocalAmount(
    gstAmt,
    exchangeRates.exchangeRate,
    decimals
  )

  const gstCtyAmt =
    visible?.m_CtyCurr && exchangeRates.cityExchangeRate
      ? calculateDetailGstCityAmount(
          gstAmt,
          exchangeRates.cityExchangeRate,
          decimals
        )
      : 0

  return {
    gstAmt,
    gstLocalAmt,
    gstCtyAmt,
  }
}

/**
 * Calculate all local currency amounts (total local, total city)
 *
 * @param totAmt - Total amount
 * @param exchangeRates - Exchange rates object
 * @param decimals - Decimal configuration
 * @param visible - Visibility configuration
 * @returns Object with all local amounts
 */
export const calculateAllLocalAmounts = (
  totAmt: number,
  exchangeRates: IExchangeRates,
  decimals: IDecimal,
  visible?: IVisibleFields
) => {
  const totLocalAmt = calculateDetailLocalAmount(
    totAmt,
    exchangeRates.exchangeRate,
    decimals
  )

  const totCtyAmt =
    visible?.m_CtyCurr && exchangeRates.cityExchangeRate
      ? calculateDetailCityAmount(
          totAmt,
          exchangeRates.cityExchangeRate,
          decimals
        )
      : 0

  return {
    totLocalAmt,
    totCtyAmt,
  }
}

/**
 * Calculate all amounts for an invoice detail row
 * This is the main calculation function that calculates everything at once
 *
 * @param billQty - Bill quantity
 * @param unitPrice - Unit price
 * @param gstPercentage - GST percentage
 * @param exchangeRates - Exchange rates object
 * @param decimals - Decimal configuration
 * @param visible - Visibility configuration
 * @returns Object with all calculated amounts
 */
export const calculateInvoiceDetailAmounts = (
  billQty: number,
  unitPrice: number,
  gstPercentage: number,
  exchangeRates: IExchangeRates,
  decimals: IDecimal,
  visible?: IVisibleFields
) => {
  // Calculate total amount
  const totAmt = calculateDetailTotalAmount(billQty, unitPrice, decimals)

  // Calculate local amounts
  const { totLocalAmt, totCtyAmt } = calculateAllLocalAmounts(
    totAmt,
    exchangeRates,
    decimals,
    visible
  )

  // Calculate GST amounts
  const { gstAmt, gstLocalAmt, gstCtyAmt } = calculateAllGstAmounts(
    totAmt,
    gstPercentage,
    exchangeRates,
    decimals,
    visible
  )

  return {
    totAmt,
    totLocalAmt,
    totCtyAmt,
    gstAmt,
    gstLocalAmt,
    gstCtyAmt,
  }
}

/**
 * Recalculate amounts when total amount is manually changed
 * (doesn't recalculate total from qty × price)
 *
 * @param totAmt - Total amount (manually entered)
 * @param gstPercentage - GST percentage
 * @param exchangeRates - Exchange rates object
 * @param decimals - Decimal configuration
 * @param visible - Visibility configuration
 * @returns Object with calculated amounts (excluding totAmt)
 */
export const recalculateFromTotalAmount = (
  totAmt: number,
  gstPercentage: number,
  exchangeRates: IExchangeRates,
  decimals: IDecimal,
  visible?: IVisibleFields
) => {
  // Calculate local amounts
  const { totLocalAmt, totCtyAmt } = calculateAllLocalAmounts(
    totAmt,
    exchangeRates,
    decimals,
    visible
  )

  // Calculate GST amounts
  const { gstAmt, gstLocalAmt, gstCtyAmt } = calculateAllGstAmounts(
    totAmt,
    gstPercentage,
    exchangeRates,
    decimals,
    visible
  )

  return {
    totLocalAmt,
    totCtyAmt,
    gstAmt,
    gstLocalAmt,
    gstCtyAmt,
  }
}
