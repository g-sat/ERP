import { mathRound } from "@/helpers/account"
import { IApDocsetoffDt, IDecimal } from "@/interfaces"

/**
 * Calculate total amounts (base currency)
 */
export const calculateTotalAmounts = (
  details: IApDocsetoffDt[],
  amtDec: number
) => {
  const totals = {
    totAmt: 0,
  }

  details.forEach((detail) => {
    totals.totAmt += Number(detail.docTotAmt) || 0
  })

  return {
    totAmt: mathRound(totals.totAmt, amtDec),
  }
}

/**
 * Calculate local currency amounts
 */
export const calculateLocalAmounts = (
  details: IApDocsetoffDt[],
  locAmtDec: number
) => {
  const totals = {
    totLocalAmt: 0,
  }

  details.forEach((detail) => {
    totals.totLocalAmt += Number(detail.docTotLocalAmt) || 0
  })

  return {
    totLocalAmt: mathRound(totals.totLocalAmt, locAmtDec),
  }
}

/**
 * Calculate country currency amounts
 */
export const calculateCountryAmounts = (
  details: IApDocsetoffDt[],
  ctyAmtDec: number
) => {
  const totals = {
    totCtyAmt: 0,
  }

  details.forEach((detail) => {
    totals.totCtyAmt += Number(detail.docTotAmt) || 0
  })

  return {
    totCtyAmt: mathRound(totals.totCtyAmt, ctyAmtDec),
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
  detail: IApDocsetoffDt,
  exchangeRate: number,
  decimals: IDecimal
) => {
  const totAmt = detail.docTotAmt || 0

  // Calculate local amounts
  const totLocalAmt = calculateLocalAmount(totAmt, exchangeRate, decimals)

  return {
    ...detail,
    totLocalAmt,
  }
}

/**
 * Recalculate all amounts for all detail rows based on exchange rates
 */
export const recalculateAllDetailAmounts = (
  details: IApDocsetoffDt[],
  exchangeRate: number,
  decimals: IDecimal
) => {
  return details.map((detail) =>
    recalculateDetailAmounts(detail, exchangeRate, decimals)
  )
}

/**
 * Calculate allocation amounts and exchange gain/loss for auto-allocated transactions
 */
export const calculateAllocationAmounts = (
  allocAmt: number,
  exhRate: number,
  docExhRate: number,
  docTotLocalAmt: number,
  decimals: IDecimal
) => {
  // Calculate allocation amounts
  const allocLocalAmt = mathRound(allocAmt * exhRate, decimals.locAmtDec)
  const docAllocAmt = allocAmt
  const docAllocLocalAmt = mathRound(allocAmt * docExhRate, decimals.locAmtDec)

  // Calculate cent difference
  const centDiff = mathRound(
    docAllocLocalAmt - allocLocalAmt,
    decimals.locAmtDec
  )

  // Exchange gain/loss equals cent difference
  const exhGainLoss = centDiff

  return {
    allocLocalAmt,
    docAllocAmt,
    docAllocLocalAmt,
    centDiff,
    exhGainLoss,
  }
}

/**
 * Calculate total exchange gain/loss from all details
 */
export const calculateTotalExchangeGainLoss = (
  details: IApDocsetoffDt[],
  decimals: IDecimal
) => {
  const totalExhGainLoss = details.reduce((sum, detail) => {
    return sum + (Number(detail.exhGainLoss) || 0)
  }, 0)

  return mathRound(totalExhGainLoss, decimals.amtDec)
}
