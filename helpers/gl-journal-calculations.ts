import {
  calculateAdditionAmount,
  calculateMultiplierAmount,
  calculatePercentagecAmount,
} from "@/helpers/account"
import { IDecimal, IGLJournalDt } from "@/interfaces"

/**
 * Calculate total amounts (base currency)
 */
export const calculateTotalAmounts = (
  details: IGLJournalDt[],
  amtDec: number
) => {
  const totals = {
    totAmt: 0,
    gstAmt: 0,
    totAmtAftGst: 0,
  }

  details.forEach((detail) => {
    if (!detail.isDebit) {
      return
    }

    totals.totAmt = calculateAdditionAmount(
      totals.totAmt,
      Number(detail.totAmt) || 0,
      amtDec
    )
    totals.gstAmt = calculateAdditionAmount(
      totals.gstAmt,
      Number(detail.gstAmt) || 0,
      amtDec
    )
  })

  return {
    totAmt: totals.totAmt,
    gstAmt: totals.gstAmt,
    totAmtAftGst: calculateAdditionAmount(totals.totAmt, totals.gstAmt, amtDec),
  }
}

/**
 * Calculate local currency amounts
 */
export const calculateLocalAmounts = (
  details: IGLJournalDt[],
  locAmtDec: number
) => {
  const totals = {
    totLocalAmt: 0,
    gstLocalAmt: 0,
    totLocalAmtAftGst: 0,
  }

  details.forEach((detail) => {
    if (!detail.isDebit) {
      return
    }

    totals.totLocalAmt = calculateAdditionAmount(
      totals.totLocalAmt,
      Number(detail.totLocalAmt) || 0,
      locAmtDec
    )
    totals.gstLocalAmt = calculateAdditionAmount(
      totals.gstLocalAmt,
      Number(detail.gstLocalAmt) || 0,
      locAmtDec
    )
  })

  return {
    totLocalAmt: totals.totLocalAmt,
    gstLocalAmt: totals.gstLocalAmt,
    totLocalAmtAftGst: calculateAdditionAmount(
      totals.totLocalAmt,
      totals.gstLocalAmt,
      locAmtDec
    ),
  }
}

/**
 * Calculate country currency amounts
 */
export const calculateCtyAmounts = (
  details: IGLJournalDt[],
  ctyAmtDec: number
) => {
  const totals = {
    totCtyAmt: 0,
    gstCtyAmt: 0,
    totCtyAmtAftGst: 0,
  }

  details.forEach((detail) => {
    if (!detail.isDebit) {
      return
    }

    totals.totCtyAmt = calculateAdditionAmount(
      totals.totCtyAmt,
      Number(detail.totCtyAmt) || 0,
      ctyAmtDec
    )
    totals.gstCtyAmt = calculateAdditionAmount(
      totals.gstCtyAmt,
      Number(detail.gstCtyAmt) || 0,
      ctyAmtDec
    )
  })

  return {
    totCtyAmt: totals.totCtyAmt,
    gstCtyAmt: totals.gstCtyAmt,
    totCtyAmtAftGst: calculateAdditionAmount(
      totals.totCtyAmt,
      totals.gstCtyAmt,
      ctyAmtDec
    ),
  }
}

/**
 * Calculate GST amount based on total amount and GST percentage
 */
export const calculateGstAmount = (
  totAmt: number,
  gstPercentage: number,
  decimals: IDecimal
) => {
  return calculatePercentagecAmount(totAmt, gstPercentage, decimals.amtDec)
}

/**
 * Calculate local amount based on total amount and exchange rate
 */
export const calculateLocalAmount = (
  totAmt: number,
  exchangeRate: number,
  decimals: IDecimal
) => {
  return calculateMultiplierAmount(totAmt, exchangeRate, decimals.locAmtDec)
}

/**
 * Calculate country amount based on total amount and city exchange rate
 */
export const calculateCtyAmount = (
  totAmt: number,
  cityExchangeRate: number,
  decimals: IDecimal
) => {
  return calculateMultiplierAmount(totAmt, cityExchangeRate, decimals.ctyAmtDec)
}

/**
 * Calculate total amount based on quantity and unit price
 */
export const calculateTotalAmount = (
  qty: number,
  unitPrice: number,
  decimals: IDecimal
) => {
  return calculateMultiplierAmount(qty, unitPrice, decimals.amtDec)
}

/**
 * Recalculate all amounts for a detail row based on exchange rates
 */
export const recalculateDetailAmounts = (
  detail: IGLJournalDt,
  exchangeRate: number,
  cityExchangeRate: number,
  decimals: IDecimal,
  hasCountryCurrency: boolean
) => {
  const totAmt = detail.totAmt || 0
  const gstPercentage = detail.gstPercentage || 0

  // Calculate GST amount
  const gstAmt = calculateGstAmount(totAmt, gstPercentage, decimals)

  // Calculate local amounts
  const totLocalAmt = calculateLocalAmount(totAmt, exchangeRate, decimals)
  const gstLocalAmt = calculateLocalAmount(gstAmt, exchangeRate, decimals)

  // Calculate country amounts if enabled
  let totCtyAmt = 0
  let gstCtyAmt = 0
  if (hasCountryCurrency) {
    totCtyAmt = calculateCtyAmount(totAmt, cityExchangeRate, decimals)
    gstCtyAmt = calculateCtyAmount(gstAmt, cityExchangeRate, decimals)
  }

  return {
    ...detail,
    gstAmt,
    totLocalAmt,
    gstLocalAmt,
    totCtyAmt,
    gstCtyAmt,
  }
}

/**
 * Recalculate all amounts for all detail rows based on exchange rates
 */
export const recalculateAllDetailAmounts = (
  details: IGLJournalDt[],
  exchangeRate: number,
  cityExchangeRate: number,
  decimals: IDecimal,
  hasCountryCurrency: boolean
) => {
  return details.map((detail) =>
    recalculateDetailAmounts(
      detail,
      exchangeRate,
      cityExchangeRate,
      decimals,
      hasCountryCurrency
    )
  )
}
