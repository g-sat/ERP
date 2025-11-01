import {
  calculateDivisionAmount,
  calculateMultiplierAmount,
  calculateSubtractionAmount,
} from "@/helpers/account"
import { IArReceiptDt, IDecimal } from "@/interfaces"

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const validateAllocation = (details: IArReceiptDt[]): boolean => {
  return details.length > 0
}

// ============================================================================
// HEADER CALCULATIONS
// ============================================================================

/**
 * Same Currency scenario
 * Inputs: totAmt, exhRate
 * Outputs: { totAmt, totLocalAmt, recTotAmt, recTotLocalAmt }
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
  const recTotAmt = totAmt
  const recTotLocalAmt = totLocalAmt

  return {
    totAmt,
    totLocalAmt,
    recTotAmt,
    recTotLocalAmt,
  }
}

/**
 * Different Currency scenario
 * Inputs: recTotAmt, recExhRate, exhRate
 * Outputs: { recTotAmt, recTotLocalAmt, totAmt, totLocalAmt }
 */
export const calculateDiffCurrency = (
  recTotAmt: number,
  recExhRate: number,
  exhRate: number,
  decimals: IDecimal
) => {
  const recTotLocalAmt = calculateMultiplierAmount(
    recTotAmt,
    recExhRate,
    decimals.locAmtDec
  )
  const totAmt = calculateDivisionAmount(
    recTotLocalAmt,
    exhRate,
    decimals.amtDec
  )
  const totLocalAmt = calculateMultiplierAmount(
    totAmt,
    exhRate,
    decimals.locAmtDec
  )

  return {
    recTotAmt,
    recTotLocalAmt,
    totAmt,
    totLocalAmt,
  }
}

/**
 * Unallocated Amounts
 * Inputs: totAmt, totLocalAmt, allocTotAmt, allocTotLocalAmt
 * Outputs: { unAllocAmt, unAllocLocalAmt }
 */
export const calculateUnallocated = (
  totAmt: number,
  totLocalAmt: number,
  allocTotAmt: number,
  allocTotLocalAmt: number,
  decimals: IDecimal
) => {
  const unAllocAmt = calculateSubtractionAmount(
    totAmt,
    allocTotAmt,
    decimals.amtDec
  )
  const unAllocLocalAmt = calculateSubtractionAmount(
    totLocalAmt,
    allocTotLocalAmt,
    decimals.locAmtDec
  )

  return {
    unAllocAmt,
    unAllocLocalAmt,
  }
}

// ============================================================================
// AUTO ALLOCATION
// ============================================================================

/**
 * Auto allocation over details.
 * Conditions:
 * 1) If totAmt == 0: set allocAmt = docBalAmt for all rows
 * 2) If totAmt > 0: sort rows placing negative docBalAmt first, then allocate
 *    by consuming remaining amount across positives; negatives are fully taken first
 * After allocation, computes local amounts, doc allocations, gain/loss, sums, and unallocated.
 */
export const autoAllocateAmounts = (
  details: IArReceiptDt[],
  totAmt: number,
  decimals?: IDecimal
) => {
  const updatedDetails = (details || []).map((d) => ({ ...d }))

  if (totAmt === 0) {
    // Rule 1: totAmt == 0 → allocAmt = docBalAmt for all
    updatedDetails.forEach((row) => {
      const balanceAmount = Number(row.docBalAmt) || 0
      row.allocAmt = balanceAmount
    })
  } else {
    // Rule 2: totAmt <> 0 → allocate with negatives first
    let remainingAllocationAmt = Number(totAmt) || 0

    // Keep original order reference
    const byItemNo = new Map<number, IArReceiptDt>()
    updatedDetails.forEach((r) => byItemNo.set(r.itemNo, r))

    // Sort: negatives first, keep relative order otherwise
    const sorted = [...updatedDetails].sort((a, b) => {
      const aBal = Number(a.docBalAmt) || 0
      const bBal = Number(b.docBalAmt) || 0
      if (aBal < 0 && bBal >= 0) return -1
      if (aBal >= 0 && bBal < 0) return 1
      return 0
    })

    sorted.forEach((row) => {
      const balanceAmount = Number(row.docBalAmt) || 0

      if (balanceAmount < 0) {
        // Fully take negatives first; increases remaining
        row.allocAmt = balanceAmount
        remainingAllocationAmt = decimals
          ? calculateSubtractionAmount(
              remainingAllocationAmt,
              balanceAmount,
              decimals.amtDec
            )
          : remainingAllocationAmt - balanceAmount // subtracting a negative adds
        return
      }

      if (remainingAllocationAmt <= 0) {
        row.allocAmt = 0
        return
      }

      if (remainingAllocationAmt >= balanceAmount) {
        row.allocAmt = balanceAmount
        remainingAllocationAmt = decimals
          ? calculateSubtractionAmount(
              remainingAllocationAmt,
              balanceAmount,
              decimals.amtDec
            )
          : remainingAllocationAmt - balanceAmount
      } else {
        row.allocAmt = remainingAllocationAmt
        remainingAllocationAmt = 0
      }
    })

    // Write back allocations to objects in original order
    sorted.forEach((r) => {
      const target = byItemNo.get(r.itemNo)
      if (target) target.allocAmt = r.allocAmt
    })
  }

  return {
    updatedDetails,
  }
}

export const calauteLocalAmtandGainLoss = (
  details: IArReceiptDt[],
  rowNumber: number,
  exhRate: number,
  decimals: IDecimal
) => {
  if (!details || rowNumber < 0 || rowNumber >= details.length) {
    return details?.[rowNumber]
  }

  const allocAmt = Number(details[rowNumber].allocAmt) || 0
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
  const docAllocLocalAmt = calculateMultiplierAmount(
    allocAmt,
    details[rowNumber].docExhRate,
    decimals.locAmtDec
  )
  const exhGainLoss = calculateSubtractionAmount(
    docAllocLocalAmt,
    allocLocalAmt,
    decimals.locAmtDec
  )
  // centDiff is the same as exhGainLoss in this calculation
  const centDiff = exhGainLoss

  details[rowNumber].allocLocalAmt = allocLocalAmt
  details[rowNumber].docAllocAmt = docAllocAmt
  details[rowNumber].docAllocLocalAmt = docAllocLocalAmt
  details[rowNumber].centDiff = centDiff
  details[rowNumber].exhGainLoss = exhGainLoss
  return details[rowNumber]
}

export const calculateManualAllocation = (
  details: IArReceiptDt[],
  rowNumber: number,
  allocAmt: number,
  totAmt?: number,
  decimals?: IDecimal
) => {
  if (!details || rowNumber < 0 || rowNumber >= details.length) {
    return details[rowNumber]
  }

  const bal = Number(details[rowNumber].docBalAmt) || 0
  let desired = Number(allocAmt) || 0

  if (bal === 0) {
    desired = 0
  } else {
    // Enforce |allocAmt| <= |docBalAmt| and align sign with balance when exceeding
    const maxAbs = Math.abs(bal)
    const absDesired = Math.abs(desired)
    if (absDesired > maxAbs) {
      desired = Math.sign(bal) * maxAbs
    }
  }

  // If totAmt is provided, do the calculation with negatives first
  if (totAmt !== undefined && totAmt > 0) {
    // Calculate remaining amount after processing all negative balances first
    let remainingAllocationAmt = Number(totAmt) || 0

    // First, calculate the sum of all negative balances
    details.forEach((row, idx) => {
      const balanceAmount = Number(row.docBalAmt) || 0
      if (balanceAmount < 0 && idx !== rowNumber) {
        // Subtract negative balance (which adds to remaining)
        remainingAllocationAmt = decimals
          ? calculateSubtractionAmount(
              remainingAllocationAmt,
              balanceAmount,
              decimals.amtDec
            )
          : remainingAllocationAmt - balanceAmount
      }
    })

    // Now check if the desired allocation is valid
    // Check: (remainingAllocationAmt <= allocAmt) && (allocAmt >= balAmt)
    const isValid = desired >= bal && remainingAllocationAmt <= desired

    if (!isValid) {
      desired = 0
    }
  }

  details[rowNumber].allocAmt = desired
  return details[rowNumber]
}
