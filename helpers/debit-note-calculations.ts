import { IDecimal } from "@/interfaces/auth"
import { IDebitNoteDt } from "@/interfaces/checklist"

import {
  calculateAdditionAmount,
  calculateMultiplierAmount,
  calculatePercentagecAmount,
  mathRound,
} from "./account"

/**
 * Calculate quantity * unit price
 */
export const calculateQuantityUnitPrice = (
  qty: number,
  unitPrice: number,
  precision: number = 2
): number => {
  return calculateMultiplierAmount(qty, unitPrice, precision)
}

/**
 * Calculate VAT amount from VAT percentage
 */
export const calculateVatAmount = (
  totalAmount: number,
  vatPercentage: number,
  precision: number = 2
): number => {
  return calculatePercentagecAmount(totalAmount, vatPercentage, precision)
}

/**
 * Calculate total amount after VAT (total amount + VAT amount)
 */
export const calculateTotalAfterVat = (
  totalAmount: number,
  vatAmount: number,
  precision: number = 2
): number => {
  return calculateAdditionAmount(totalAmount, vatAmount, precision)
}

/**
 * Calculate all debit note detail amounts
 */
export const calculateDebitNoteDetailAmounts = (
  qty: number,
  unitPrice: number,
  vatPercentage: number,
  decimals?: Partial<IDecimal>
): {
  totalAmount: number
  vatAmount: number
  totalAfterVat: number
} => {
  const precision = decimals?.amtDec || 2

  // Calculate total amount (qty * unit price)
  const totalAmount = calculateQuantityUnitPrice(qty, unitPrice, precision)

  // Calculate VAT amount
  const vatAmount = calculateVatAmount(totalAmount, vatPercentage, precision)

  // Calculate total after VAT
  const totalAfterVat = calculateTotalAfterVat(
    totalAmount,
    vatAmount,
    precision
  )

  return {
    totalAmount,
    vatAmount,
    totalAfterVat,
  }
}

/**
 * Calculate sum of total amounts from debit note details
 */
export const calculateTotalAmountSum = (
  details: IDebitNoteDt[],
  decimals?: Partial<IDecimal>
): number => {
  const precision = decimals?.amtDec || 2
  const sum = details.reduce((total, detail) => {
    return calculateAdditionAmount(total, detail.totAmt || 0, precision)
  }, 0)

  return mathRound(sum, precision)
}

/**
 * Calculate sum of VAT amounts from debit note details
 */
export const calculateVatAmountSum = (
  details: IDebitNoteDt[],
  decimals?: Partial<IDecimal>
): number => {
  const precision = decimals?.amtDec || 2
  const sum = details.reduce((total, detail) => {
    return calculateAdditionAmount(total, detail.gstAmt || 0, precision)
  }, 0)

  return mathRound(sum, precision)
}

/**
 * Calculate sum of total after VAT amounts from debit note details
 */
export const calculateTotalAfterVatSum = (
  details: IDebitNoteDt[],
  decimals?: Partial<IDecimal>
): number => {
  const precision = decimals?.amtDec || 2
  const sum = details.reduce((total, detail) => {
    return calculateAdditionAmount(total, detail.totAmtAftGst || 0, precision)
  }, 0)

  return mathRound(sum, precision)
}

/**
 * Calculate all summary totals for debit note
 */
export const calculateDebitNoteSummary = (
  details: IDebitNoteDt[],
  decimals?: Partial<IDecimal>
): {
  totalAmount: number
  vatAmount: number
  totalAfterVat: number
} => {
  const totalAmount = calculateTotalAmountSum(details, decimals)
  const vatAmount = calculateVatAmountSum(details, decimals)
  const totalAfterVat = calculateTotalAfterVatSum(details, decimals)

  return {
    totalAmount,
    vatAmount,
    totalAfterVat,
  }
}

/**
 * Recalculate all amounts for a debit note detail when any field changes
 */
export const recalculateDebitNoteDetail = (
  detail: Partial<IDebitNoteDt>,
  decimals?: Partial<IDecimal>
): Partial<IDebitNoteDt> => {
  const qty = detail.qty || 0
  const unitPrice = detail.unitPrice || 0
  const vatPercentage = detail.gstPercentage || 0

  const calculated = calculateDebitNoteDetailAmounts(
    qty,
    unitPrice,
    vatPercentage,
    decimals
  )

  return {
    ...detail,
    totAmt: calculated.totalAmount,
    gstAmt: calculated.vatAmount,
    totAmtAftGst: calculated.totalAfterVat,
  }
}

/**
 * Validate and format amounts for display
 */
export const formatAmount = (
  amount: number,
  decimals?: Partial<IDecimal>,
  type: "amount" | "local" | "city" = "amount"
): number => {
  const precision =
    type === "amount"
      ? decimals?.amtDec || 2
      : type === "local"
        ? decimals?.locAmtDec || 2
        : decimals?.ctyAmtDec || 2

  return mathRound(amount, precision)
}
