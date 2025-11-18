import {
  calculateAdditionAmount,
  calculateMultiplierAmount,
  calculatePercentagecAmount,
} from "@/helpers/account"
import { ICbBankTransferCtmDt, IDecimal } from "@/interfaces"

/**
 * Calculate total amounts (base currency)
 */
export const calculateTotalAmounts = (
  details: ICbBankTransferCtmDt[],
  amtDec: number
) => {
  const totals = {
    totAmt: 0,
  }

  details.forEach((detail) => {
    totals.totAmt = calculateAdditionAmount(
      totals.totAmt,
      Number(detail.toTotAmt) || 0,
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
  details: ICbBankTransferCtmDt[],
  locAmtDec: number
) => {
  const totals = {
    totLocalAmt: 0,
  }

  details.forEach((detail) => {
    totals.totLocalAmt = calculateAdditionAmount(
      totals.totLocalAmt,
      Number(detail.toTotLocalAmt) || 0,
      locAmtDec
    )
  })

  return {
    totLocalAmt: totals.totLocalAmt,
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
 * Calculate total amount based on quantity and unit price
 */
export const calculateTotalAmount = (
  qty: number,
  unitPrice: number,
  decimals: IDecimal
) => {
  return calculateMultiplierAmount(qty, unitPrice, decimals.amtDec)
}
