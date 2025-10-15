import { mathRound } from "@/helpers/account"
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
    totals.totAmt += Number(detail.toTotAmt) || 0
  })

  return {
    totAmt: mathRound(totals.totAmt, amtDec),
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
    totals.totLocalAmt += Number(detail.toTotLocalAmt) || 0
  })

  return {
    totLocalAmt: mathRound(totals.totLocalAmt, locAmtDec),
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
