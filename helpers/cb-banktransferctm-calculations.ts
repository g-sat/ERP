import {
  calculateAdditionAmount,
  calculateMultiplierAmount,
} from "@/helpers/account"
import { ICbBankTransferCtmDt, IDecimal } from "@/interfaces"
import { IVisibleFields } from "@/interfaces/setting"
import { UseFormReturn } from "react-hook-form"

//used for cloning invoice & recalculateAndSetHeaderTotals invoice function
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

//used for cloning invoice & recalculateAndSetHeaderTotals invoice function
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

//used for cloning invoice & recalculateAndSetHeaderTotals invoice function
export const calculateLocalAmount = (
  totAmt: number,
  exchangeRate: number,
  decimals: IDecimal
) => {
  return calculateMultiplierAmount(totAmt, exchangeRate, decimals.locAmtDec)
}

export const recalculateDetailLocalAmounts = (
  detail: ICbBankTransferCtmDt,
  exchangeRate: number,
  decimals: IDecimal
) => {
  const totAmt = detail.toTotAmt || 0

  // Calculate local amounts
  const totLocalAmt = calculateLocalAmount(totAmt, exchangeRate, decimals)

  return {
    ...detail,
    toTotLocalAmt: totLocalAmt,
  }
}

export const recalculateAllDetailsLocalAmounts = (
  details: ICbBankTransferCtmDt[],
  exchangeRate: number,
  decimals: IDecimal
) => {
  return details.map((detail) =>
    recalculateDetailLocalAmounts(detail, exchangeRate, decimals)
  )
}

export const recalculateDetailFormAmounts = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dtForm: UseFormReturn<any>, // Generic form type for reusability
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hdForm: UseFormReturn<any>, // Generic form type for reusability
  decimals: IDecimal,
  _visible: IVisibleFields,
  exchangeRate?: number
) => {
  // Use provided exchange rates or read from form
  const currentExchangeRate =
    exchangeRate !== undefined
      ? exchangeRate
      : hdForm.getValues("toExhRate") || 0

  // Always recalculate if exchange rate is valid (even if totAmt is 0, we should update local amounts to 0)
  if (currentExchangeRate > 0) {
    // Get current form values
    const currentValues = dtForm.getValues()
    const detail: ICbBankTransferCtmDt = {
      ...currentValues,
      toTotAmt: currentValues.toTotAmt || 0,
    }

    // Recalculate local amounts using the shared function
    const recalculatedDetail = recalculateDetailLocalAmounts(
      detail,
      currentExchangeRate,
      decimals
    )

    // Update form with recalculated local amounts
    dtForm.setValue("toTotLocalAmt", recalculatedDetail.toTotLocalAmt, {
      shouldValidate: false,
      shouldDirty: true,
    })

    // Trigger form update to ensure UI reflects changes
    dtForm.trigger(["toTotLocalAmt"])

    return {
      toTotLocalAmt: recalculatedDetail.toTotLocalAmt,
    }
  }

  return null
}

// Calculate sum of (toTotLocalAmt + toBankChgLocalAmt) from all details
export const calculateDetailsTotalLocalAmount = (
  details: ICbBankTransferCtmDt[],
  locAmtDec: number
) => {
  let total = 0

  details.forEach((detail) => {
    const toTotLocalAmt = Number(detail.toTotLocalAmt) || 0
    const toBankChgLocalAmt = Number(detail.toBankChgLocalAmt) || 0
    const detailTotal = toTotLocalAmt + toBankChgLocalAmt
    total = calculateAdditionAmount(total, detailTotal, locAmtDec)
  })

  return total
}

// Validate that fromTotLocalAmt equals sum of (toTotLocalAmt + toBankChgLocalAmt) from all details
export const validateFromTotLocalAmt = (
  fromTotLocalAmt: number,
  details: ICbBankTransferCtmDt[],
  locAmtDec: number
): { isValid: boolean; expectedTotal: number; actualTotal: number } => {
  const expectedTotal = calculateDetailsTotalLocalAmount(details, locAmtDec)
  const actualTotal = fromTotLocalAmt

  // Compare with tolerance for floating point precision
  const tolerance = Math.pow(10, -locAmtDec)
  const isValid = Math.abs(actualTotal - expectedTotal) < tolerance

  return {
    isValid,
    expectedTotal,
    actualTotal,
  }
}

//recalculate and set header totals - NOTE: FROM and TO are separate entities, so we don't calculate header totals from details
// This function is kept for compatibility but doesn't calculate totals from details
export const recalculateAndSetHeaderTotals = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>,
  details: ICbBankTransferCtmDt[],
  decimals: IDecimal
) => {
  // FROM and TO are separate entities - we don't calculate header totals from details
  // The header FROM totals are entered manually by the user
  // This function is kept for compatibility but doesn't modify form values
  // Validation should be done separately using validateFromTotLocalAmt
}
