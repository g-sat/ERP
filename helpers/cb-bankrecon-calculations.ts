import {
  calculateAdditionAmount,
  calculateMultiplierAmount,
} from "@/helpers/account"
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
    totals.totAmt = calculateAdditionAmount(
      totals.totAmt,
      Number(detail.totAmt) || 0,
      amtDec
    )
  })

  return {
    totAmt: totals.totAmt,
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
    totals.totLocalAmt = calculateAdditionAmount(
      totals.totLocalAmt,
      Number(detail.totLocalAmt) || 0,
      locAmtDec
    )
  })

  return {
    totLocalAmt: totals.totLocalAmt,
  }
}

/**
 * Calculate country currency amounts
 */
export const calculateCtyAmounts = (
  details: ICbBankReconDt[],
  ctyAmtDec: number
) => {
  const totals = {
    totCtyAmt: 0,
  }

  details.forEach((detail) => {
    totals.totCtyAmt = calculateAdditionAmount(
      totals.totCtyAmt,
      Number(detail.totAmt) || 0,
      ctyAmtDec
    )
  })

  return {
    totCtyAmt: totals.totCtyAmt,
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
  return calculateMultiplierAmount(totAmt, exchangeRate, decimals.locAmtDec)
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
