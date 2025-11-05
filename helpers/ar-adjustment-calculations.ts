import { mathRound } from "@/helpers/account"
import { IArAdjustmentDt, IDecimal } from "@/interfaces"

/**
 * Calculate total amounts (base currency)
 */
export const calculateTotalAmounts = (
  details: IArAdjustmentDt[],
  amtDec: number
) => {
  const totals = {
    totAmt: 0,
    gstAmt: 0,
    totAmtAftGst: 0,
  }

  details.forEach((detail) => {
    totals.totAmt += Number(detail.totAmt) || 0
    totals.gstAmt += Number(detail.gstAmt) || 0
  })

  return {
    totAmt: mathRound(totals.totAmt, amtDec),
    gstAmt: mathRound(totals.gstAmt, amtDec),
    totAmtAftGst: mathRound(totals.totAmt + totals.gstAmt, amtDec),
  }
}

/**
 * Calculate local currency amounts
 */
export const calculateLocalAmounts = (
  details: IArAdjustmentDt[],
  locAmtDec: number
) => {
  const totals = {
    totLocalAmt: 0,
    gstLocalAmt: 0,
    totLocalAmtAftGst: 0,
  }

  details.forEach((detail) => {
    totals.totLocalAmt += Number(detail.totLocalAmt) || 0
    totals.gstLocalAmt += Number(detail.gstLocalAmt) || 0
  })

  return {
    totLocalAmt: mathRound(totals.totLocalAmt, locAmtDec),
    gstLocalAmt: mathRound(totals.gstLocalAmt, locAmtDec),
    totLocalAmtAftGst: mathRound(
      totals.totLocalAmt + totals.gstLocalAmt,
      locAmtDec
    ),
  }
}

/**
 * Calculate country currency amounts
 */
export const calculateCountryAmounts = (
  details: IArAdjustmentDt[],
  ctyAmtDec: number
) => {
  const totals = {
    totCtyAmt: 0,
    gstCtyAmt: 0,
    totCtyAmtAftGst: 0,
  }

  details.forEach((detail) => {
    totals.totCtyAmt += Number(detail.totCtyAmt) || 0
    totals.gstCtyAmt += Number(detail.gstCtyAmt) || 0
  })

  return {
    totCtyAmt: mathRound(totals.totCtyAmt, ctyAmtDec),
    gstCtyAmt: mathRound(totals.gstCtyAmt, ctyAmtDec),
    totCtyAmtAftGst: mathRound(totals.totCtyAmt + totals.gstCtyAmt, ctyAmtDec),
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
  const gstAmt = (totAmt * gstPercentage) / 100
  return mathRound(gstAmt, decimals.amtDec)
}

/**
 * Calculate local amount based on total amount and exchange rate
 */
export const calculateLocalAmount = (
  totAmt: number,
  exchangeRate: number,
  decimals: IDecimal
) => {
  const localAmt = totAmt * exchangeRate
  return mathRound(localAmt, decimals.locAmtDec)
}

/**
 * Calculate country amount based on total amount and city exchange rate
 */
export const calculateCountryAmount = (
  totAmt: number,
  cityExchangeRate: number,
  decimals: IDecimal
) => {
  const countryAmt = totAmt * cityExchangeRate
  return mathRound(countryAmt, decimals.ctyAmtDec)
}

/**
 * Calculate total amount based on quantity and unit price
 */
export const calculateTotalAmount = (
  qty: number,
  unitPrice: number,
  decimals: IDecimal
) => {
  const totAmt = qty * unitPrice
  return mathRound(totAmt, decimals.amtDec)
}

/**
 * Recalculate all amounts for a detail row based on exchange rates
 */
export const recalculateDetailAmounts = (
  detail: IArAdjustmentDt,
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
    totCtyAmt = calculateCountryAmount(totAmt, cityExchangeRate, decimals)
    gstCtyAmt = calculateCountryAmount(gstAmt, cityExchangeRate, decimals)
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
  details: IArAdjustmentDt[],
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
