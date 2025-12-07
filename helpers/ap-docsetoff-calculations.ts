import {
  calculateDivisionAmount,
  calculateMultiplierAmount,
  calculateSubtractionAmount,
} from "@/helpers/account"
import { IApDocSetOffDt, IDecimal } from "@/interfaces"

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const validateAllocation = (details: IApDocSetOffDt[]): boolean => {
  return details.length > 0
}

// ============================================================================
// HEADER CALCULATIONS
// ============================================================================

/**
 * Same Currency scenario
 * Inputs: totAmt, exhRate
 * Outputs: { totAmt, totLocalAmt, payTotAmt, payTotLocalAmt }
 */
export const calculateSameCurrency = (
  totAmt: number,
  exhRate: number,
  decimals: IDecimal
) => {
  const totLocalAmt = calculateMultiplierAmount(
    totAmt,
    exhRate,
    decimals.locAmtDec
  )
  const payTotAmt = totAmt
  const payTotLocalAmt = totLocalAmt

  return {
    totAmt,
    totLocalAmt,
    payTotAmt,
    payTotLocalAmt,
  }
}

/**
 * Different Currency scenario
 * Inputs: payTotAmt, recExhRate, exhRate
 * Outputs: { payTotAmt, payTotLocalAmt, totAmt, totLocalAmt }
 */
export const calculateDiffCurrency = (
  payTotAmt: number,
  recExhRate: number,
  exhRate: number,
  decimals: IDecimal
) => {
  const payTotLocalAmt = calculateMultiplierAmount(
    payTotAmt,
    recExhRate,
    decimals.locAmtDec
  )
  const totAmt = calculateDivisionAmount(
    payTotLocalAmt,
    exhRate,
    decimals.amtDec
  )
  const totLocalAmt = calculateMultiplierAmount(
    totAmt,
    exhRate,
    decimals.locAmtDec
  )

  return {
    payTotAmt,
    payTotLocalAmt,
    totAmt,
    totLocalAmt,
  }
}

/**
 * Unallocated Amounts
 * Inputs: totAmt, totLocalAmt, allocTotAmt, allocTotLocalAmt
 * Outputs: { unAllocAmt }
 */
export const calculateUnallocated = (
  totAmt: number,
  allocTotAmt: number,
  decimals: IDecimal
) => {
  const unAllocAmt = calculateSubtractionAmount(
    totAmt,
    allocTotAmt,
    decimals.amtDec
  )

  return {
    unAllocAmt,
  }
}

// ============================================================================
// AUTO ALLOCATION
// ============================================================================

/**
 * Auto allocation over details.
 * Conditions:
 * 1) If totAmt == 0: Calculate sum of negative amounts and sum of positive amounts.
 *    Use the one with lower absolute value (lowest amount), then allocate:
 *    - If negative sum is lower: allocate all negatives fully, allocate positives up to that amount
 *    - If positive sum is lower: allocate all positives fully, allocate negatives up to that amount
 * 2) If totAmt > 0: sort rows placing negative docBalAmt first, then allocate
 *    by consuming remaining amount across positives; negatives are fully taken first
 * After allocation, computes local amounts, doc allocations, gain/loss, sums, and unallocated.
 */
export const autoAllocateAmounts = (
  details: IApDocSetOffDt[],
  decimals?: IDecimal
) => {
  const updatedDetails = (details || []).map((d) => ({ ...d }))

  // Calculate sum of negative amounts and sum of positive amounts
  let sumOfNegativeAmounts = 0
  let sumOfPositiveAmounts = 0

  updatedDetails.forEach((row) => {
    const balanceAmount = Number(row.docBalAmt) || 0
    if (balanceAmount < 0) {
      sumOfNegativeAmounts += balanceAmount
    } else if (balanceAmount > 0) {
      sumOfPositiveAmounts += balanceAmount
    }
  })

  // Determine which sum has the lower absolute value (lowest amount)
  const absNegativeSum = Math.abs(sumOfNegativeAmounts)
  const absPositiveSum = Math.abs(sumOfPositiveAmounts)
  const lowestAmount =
    absNegativeSum < absPositiveSum ? absNegativeSum : absPositiveSum

  // Separate rows into negatives and positives
  const negativeRows: IApDocSetOffDt[] = []
  const positiveRows: IApDocSetOffDt[] = []

  updatedDetails.forEach((row) => {
    const balanceAmount = Number(row.docBalAmt) || 0
    if (balanceAmount < 0) {
      negativeRows.push(row)
    } else if (balanceAmount > 0) {
      positiveRows.push(row)
    } else {
      // Zero balance, no allocation
      row.allocAmt = 0
    }
  })

  // Allocate based on which sum is lower (unified logic)
  // If negative sum is lower: allocate all negatives fully, then allocate positives up to that amount
  // If positive sum is lower: allocate all positives fully, then allocate negatives up to that amount
  const isNegativeSumLower = absNegativeSum < absPositiveSum

  // Allocate the side with lower sum fully
  if (isNegativeSumLower) {
    negativeRows.forEach((row) => {
      row.allocAmt = Number(row.docBalAmt) || 0
    })
  } else {
    positiveRows.forEach((row) => {
      row.allocAmt = Number(row.docBalAmt) || 0
    })
  }

  // Allocate the other side up to the lowest amount
  let remaining = lowestAmount
  const rowsToAllocate = isNegativeSumLower ? positiveRows : negativeRows

  rowsToAllocate.forEach((row) => {
    const balanceAmount = Number(row.docBalAmt) || 0
    const absBalance = Math.abs(balanceAmount)

    if (remaining <= 0) {
      row.allocAmt = 0
      return
    }

    if (remaining >= absBalance) {
      row.allocAmt = balanceAmount // Full amount
      remaining = decimals
        ? calculateSubtractionAmount(remaining, absBalance, decimals.amtDec)
        : remaining - absBalance
    } else {
      // Partial allocation
      row.allocAmt = isNegativeSumLower ? remaining : -remaining
      remaining = 0
    }
  })

  return {
    updatedDetails,
  }
}

export const calauteLocalAmtandGainLoss = (
  details: IApDocSetOffDt[],
  rowNumber: number,
  exhRate: number,
  decimals: IDecimal
) => {
  if (!details || rowNumber < 0 || rowNumber >= details.length) {
    return details?.[rowNumber]
  }

  const allocAmt = Number(details[rowNumber].allocAmt) || 0
  const docBalAmt = Number(details[rowNumber].docBalAmt) || 0
  const docBalLocalAmt = Number(details[rowNumber].docBalLocalAmt) || 0

  if (allocAmt === 0) {
    details[rowNumber].allocLocalAmt = 0
    details[rowNumber].docAllocAmt = 0
    details[rowNumber].docAllocLocalAmt = 0
    details[rowNumber].centDiff = 0
    details[rowNumber].exhGainLoss = 0
    return details[rowNumber]
  }

  const allocLocalAmt = calculateMultiplierAmount(
    allocAmt,
    exhRate,
    decimals.locAmtDec
  )

  const docAllocAmt = allocAmt

  const isFullBalanceAllocation =
    calculateSubtractionAmount(docBalAmt, allocAmt, decimals.amtDec) === 0

  const docAllocLocalAmt = isFullBalanceAllocation
    ? docBalLocalAmt
    : calculateMultiplierAmount(
        allocAmt,
        details[rowNumber].docExhRate,
        decimals.locAmtDec
      )

  // Calculate exchange gain/loss: docAllocLocalAmt - allocLocalAmt
  // Note: Preserve the sign (positive or negative) - do not use Math.abs()
  // Positive = gain, Negative = loss
  const exhGainLoss = calculateSubtractionAmount(
    docAllocLocalAmt,
    allocLocalAmt,
    decimals.locAmtDec
  )
  // centDiff is always set to 0
  const centDiff = 0

  details[rowNumber].allocLocalAmt = allocLocalAmt
  details[rowNumber].docAllocAmt = docAllocAmt
  details[rowNumber].docAllocLocalAmt = docAllocLocalAmt
  details[rowNumber].centDiff = centDiff
  // Note: Preserve the sign of exhGainLoss (positive or negative) - do not use Math.abs()
  details[rowNumber].exhGainLoss = exhGainLoss

  return details[rowNumber]
}

export const calculateManualAllocation = (
  details: IApDocSetOffDt[],
  rowNumber: number,
  allocAmt: number,
  totAmt?: number,
  decimals?: IDecimal
): { result: IApDocSetOffDt; wasAutoSetToZero: boolean } => {
  if (!details || rowNumber < 0 || rowNumber >= details.length) {
    console.log("calculateManualAllocation not valid", details, rowNumber)
    return { result: details[rowNumber], wasAutoSetToZero: false }
  }

  const currentBalance = Number(details[rowNumber].docBalAmt) || 0
  let finalAllocation = Number(allocAmt) || 0
  const originalRequestedAllocation = finalAllocation
  let wasAutoSetToZero = false

  // Helper function to subtract amount from remaining with decimals support
  const subtractFromRemaining = (remaining: number, amount: number) => {
    return decimals
      ? calculateSubtractionAmount(remaining, amount, decimals.amtDec)
      : remaining - amount
  }

  // Helper function to validate and clamp allocation to balance limits
  const clampAllocationToBalance = (allocation: number, balance: number) => {
    if (balance === 0) return 0

    const maxAbsBalance = Math.abs(balance)
    const absAllocation = Math.abs(allocation)
    if (absAllocation > maxAbsBalance) {
      return Math.sign(balance) * maxAbsBalance
    }
    return allocation
  }

  // If totAmt is provided, calculate with negatives-first logic
  if (totAmt !== undefined && totAmt > 0) {
    console.log("calculateManualAllocation totAmt", totAmt)
    let remainingAllocationAmt = Number(totAmt) || 0
    console.log(
      "calculateManualAllocation remainingAllocationAmt",
      remainingAllocationAmt
    )

    // Process all other rows to calculate remaining allocation
    details.forEach((row, idx) => {
      if (idx === rowNumber) return // Skip current row

      const rowBalance = Number(row.docBalAmt) || 0
      const rowAllocatedAmt = Number(row.allocAmt) || 0

      // First, handle unallocated negative balances (adds to remaining)
      if (rowBalance < 0 && rowAllocatedAmt === 0) {
        console.log("rowBalance", rowBalance)
        remainingAllocationAmt = subtractFromRemaining(
          remainingAllocationAmt,
          rowBalance
        )
      }

      // Then, subtract already allocated amounts
      if (rowAllocatedAmt !== 0) {
        console.log("rowAllocatedAmt", rowAllocatedAmt)
        remainingAllocationAmt = subtractFromRemaining(
          remainingAllocationAmt,
          rowAllocatedAmt
        )
      }
    })

    // Handle current row based on its balance type

    // For positive balance, validate against remaining amount
    finalAllocation = clampAllocationToBalance(finalAllocation, currentBalance)

    // Check if allocation is valid against remaining amount
    if (
      remainingAllocationAmt <= 0 ||
      finalAllocation > remainingAllocationAmt
    ) {
      // Only mark as auto-set if user actually requested an allocation
      if (originalRequestedAllocation > 0 && remainingAllocationAmt <= 0) {
        wasAutoSetToZero = true
      }
      finalAllocation = 0
      wasAutoSetToZero = true
    } else {
      // Valid allocation, reduce remaining
      remainingAllocationAmt = subtractFromRemaining(
        remainingAllocationAmt,
        finalAllocation
      )
    }
  } else {
    // No totAmt validation, just enforce basic constraints
    finalAllocation = clampAllocationToBalance(finalAllocation, currentBalance)
  }

  details[rowNumber].allocAmt = finalAllocation
  return { result: details[rowNumber], wasAutoSetToZero }
}
