import { mathRound } from "@/helpers/account"
import { ICbBankReconDt, IDecimal } from "@/interfaces"

/**
 * Calculate total amounts (base currency)
 */
export const calculateTotalAmounts = (
  details: ICbBankReconDt[],
  amtDec: number
) => {
  const totals = {
    totAmt: 0,
  }

  details.forEach((detail) => {
    totals.totAmt += Number(detail.totAmt) || 0
  })

  return {
    totAmt: mathRound(totals.totAmt, amtDec),
  }
}

/**
 * Calculate local currency amounts
 */
export const calculateLocalAmounts = (
  details: ICbBankReconDt[],
  locAmtDec: number
) => {
  const totals = {
    totLocalAmt: 0,
  }

  details.forEach((detail) => {
    totals.totLocalAmt += Number(detail.totLocalAmt) || 0
  })

  return {
    totLocalAmt: mathRound(totals.totLocalAmt, locAmtDec),
  }
}

/**
 * Calculate country currency amounts
 */
export const calculateCountryAmounts = (
  details: ICbBankReconDt[],
  ctyAmtDec: number
) => {
  const totals = {
    totCtyAmt: 0,
  }

  details.forEach((detail) => {
    totals.totCtyAmt += Number(detail.totAmt) || 0
  })

  return {
    totCtyAmt: mathRound(totals.totCtyAmt, ctyAmtDec),
  }
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
