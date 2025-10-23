import {
  calculateAdditionAmount,
  calculateDivisionAmount,
  calculateMultiplierAmount,
  calculateSubtractionAmount,
  mathRound,
} from "@/helpers/account"
import { IArReceiptDt, IDecimal } from "@/interfaces"

// ============================================================================
// NEW/IMPORTANT FUNCTIONS (TOP SECTION)
// ============================================================================

/**
 * 1. Calculate local amount = amount × exchangeRate
 * Used for: Converting any currency amounts to local currency
 * Formula: localAmount = amount × exchangeRate
 * Covers: totLocalAmt, recTotLocalAmt, allocLocalAmt, etc.
 */
export const calculateLocalAmount = (
  amount: number,
  exchangeRate: number,
  decimals: IDecimal
) => {
  return calculateMultiplierAmount(amount, exchangeRate, decimals.locAmtDec)
}

/**
 * 2. Alias for calculateLocalAmount (for backward compatibility)
 * Used for: Converting receipt currency amounts to local currency
 */
export const calculateRecLocalAmount = calculateLocalAmount

/**
 * 3. Calculate totAmt from recTotAmt (when currencies are different)
 * Calculates: totAmt, totLocalAmt, recTotLocalAmt, unAllocTotAmt, unAllocTotLocalAmt
 * Used for: Currency conversion scenarios when recTotAmt is entered manually
 */
export const calculateTotAmtFromRecTotAmt = (
  recTotAmt: number,
  recExchangeRate: number,
  exchangeRate: number,
  decimals: IDecimal
) => {
  // Use multiplier helper for receipt local amount
  const recTotLocalAmt = calculateMultiplierAmount(
    recTotAmt,
    recExchangeRate,
    decimals.locAmtDec
  )

  // Use division helper for totAmt calculation
  const totAmt =
    exchangeRate > 0
      ? calculateDivisionAmount(recTotLocalAmt, exchangeRate, decimals.amtDec)
      : 0

  const totLocalAmt = recTotLocalAmt
  const unAllocTotAmt = totAmt
  const unAllocTotLocalAmt = totLocalAmt

  return {
    totAmt,
    totLocalAmt,
    recTotLocalAmt,
    unAllocTotAmt,
    unAllocTotLocalAmt,
  }
}

/**
 * 5. Sum of allocAmt & allocLocalAmt from all details
 * Calculates: Total allocation amounts = Σ(allocAmt), Σ(allocLocalAmt)
 * Used for: Header total calculations and unallocated amount calculations
 */
export const calculateTotalAllocationAmounts = (
  details: IArReceiptDt[],
  decimals: IDecimal
) => {
  let totalAllocAmt = 0
  let totalAllocLocalAmt = 0

  // Use addition helper for each detail
  details.forEach((detail) => {
    const allocAmt = Number(detail.allocAmt) || 0
    const allocLocalAmt = Number(detail.allocLocalAmt) || 0

    totalAllocAmt = calculateAdditionAmount(
      totalAllocAmt,
      allocAmt,
      decimals.amtDec
    )
    totalAllocLocalAmt = calculateAdditionAmount(
      totalAllocLocalAmt,
      allocLocalAmt,
      decimals.locAmtDec
    )
  })

  return {
    totalAllocAmt,
    totalAllocLocalAmt,
  }
}

/**
 * 6. Sum of all centDiff (exchange gain/loss) from all details
 * Calculates: Total exchange gain/loss = Σ(centDiff) for all details
 * Used for: Header exhGainLoss calculation
 */
export const calculateTotalExchangeGainLoss = (
  details: IArReceiptDt[],
  decimals: IDecimal
) => {
  const totalExhGainLoss = details.reduce((sum, detail) => {
    return sum + (Number(detail.exhGainLoss) || 0)
  }, 0)

  return mathRound(totalExhGainLoss, decimals.amtDec)
}

// ============================================================================
// OLD/UTILITY FUNCTIONS (BOTTOM SECTION)
// ============================================================================

/**
 * Calculate header amounts for full allocation (totAmt = 0)
 * Updates: totAmt, totLocalAmt, recTotAmt, recTotLocalAmt, exhGainLoss
 * Used for: Auto allocation when totAmt = 0
 */
export const calculateHeaderAmountsForFullAllocation = (
  details: IArReceiptDt[],
  decimals: IDecimal
) => {
  const { totalAllocAmt, totalAllocLocalAmt } = calculateTotalAllocationAmounts(
    details,
    decimals
  )
  const totalExhGainLoss = calculateTotalExchangeGainLoss(details, decimals)

  return {
    totAmt: totalAllocAmt,
    totLocalAmt: totalAllocLocalAmt,
    recTotAmt: totalAllocAmt,
    recTotLocalAmt: totalAllocLocalAmt,
    exhGainLoss: totalExhGainLoss,
  }
}

/**
 * Calculate header amounts for proportional allocation (totAmt > 0)
 * Updates: unAllocTotAmt, unAllocTotLocalAmt, exhGainLoss
 * Used for: Proportional allocation when totAmt > 0
 */
export const calculateHeaderAmountsForProportionalAllocation = (
  details: IArReceiptDt[],
  totAmt: number,
  exchangeRate: number,
  decimals: IDecimal
) => {
  // Calculate unallocated amounts inline
  const { totalAllocAmt } = calculateTotalAllocationAmounts(details, decimals)
  const unAllocAmt = calculateSubtractionAmount(
    totAmt,
    totalAllocAmt,
    decimals.amtDec
  )
  const unAllocLocalAmt = calculateMultiplierAmount(
    unAllocAmt,
    exchangeRate,
    decimals.locAmtDec
  )

  const totalExhGainLoss = calculateTotalExchangeGainLoss(details, decimals)

  return {
    unAllocTotAmt: unAllocAmt,
    unAllocTotLocalAmt: unAllocLocalAmt,
    exhGainLoss: totalExhGainLoss,
  }
}

/**
 * Calculate receipt totals when manually entering totAmt
 * Updates: totLocalAmt, recTotAmt, recTotLocalAmt, unAllocTotAmt, unAllocTotLocalAmt
 * Used for: Manual totAmt entry scenarios
 */
export const calculateReceiptTotalsFromTotAmt = (
  totAmt: number,
  exchangeRate: number,
  decimals: IDecimal
) => {
  // Use multiplier helper for local amount calculation
  const totLocalAmt = calculateMultiplierAmount(
    totAmt,
    exchangeRate,
    decimals.locAmtDec
  )
  const unAllocTotAmt = totAmt
  const unAllocTotLocalAmt = totLocalAmt

  return {
    totLocalAmt,
    recTotAmt: totAmt,
    recTotLocalAmt: totLocalAmt,
    unAllocTotAmt,
    unAllocTotLocalAmt,
  }
}

/**
 * Recalculate all detail amounts when exchange rate changes
 * Updates: totLocalAmt for all details using new exchange rate
 * Used for: Exchange rate change handlers
 */
export const recalculateAllDetailAmounts = (
  details: IArReceiptDt[],
  exchangeRate: number,
  decimals: IDecimal
) => {
  return details.map((detail) => {
    const totAmt = detail.docTotAmt || 0
    const totLocalAmt = calculateLocalAmount(totAmt, exchangeRate, decimals)

    return {
      ...detail,
      totLocalAmt,
    }
  })
}

/**
 * COMPREHENSIVE: Recalculate all amounts when exchange rate changes
 * Updates: totLocalAmt, unAllocTotLocalAmt, all details local amounts, centDiff, exhGainLoss
 * Excludes: recTotLocalAmt (receipt currency amounts)
 * Used for: Main exchange rate change handler
 */
export const recalculateAllAmountsOnExchangeRateChange = (
  details: IArReceiptDt[],
  totAmt: number,
  unAllocTotAmt: number,
  exchangeRate: number,
  decimals: IDecimal
) => {
  // 1. Calculate header amounts using existing functions
  const totLocalAmt = calculateLocalAmount(totAmt, exchangeRate, decimals)
  const unAllocTotLocalAmt = calculateLocalAmount(
    unAllocTotAmt,
    exchangeRate,
    decimals
  )

  // 2. Recalculate all details with totLocalAmt, allocLocalAmt, docAllocLocalAmt, and centDiff
  const updatedDetails = details.map((detail) => {
    const totAmt = detail.docTotAmt || 0
    const allocAmt = detail.allocAmt || 0
    const docExhRate = detail.docExhRate || 1

    // Calculate allocLocalAmt with new exchange rate
    const allocLocalAmt = calculateLocalAmount(allocAmt, exchangeRate, decimals)

    // Calculate docAllocLocalAmt with document exchange rate
    const docAllocLocalAmt = calculateLocalAmount(
      allocAmt,
      docExhRate,
      decimals
    )

    // Calculate centDiff = docAllocLocalAmt - allocLocalAmt
    const centDiff = calculateSubtractionAmount(
      docAllocLocalAmt,
      allocLocalAmt,
      decimals.locAmtDec
    )

    return {
      ...detail,
      totLocalAmt: calculateLocalAmount(totAmt, exchangeRate, decimals),
      allocLocalAmt,
      docAllocLocalAmt,
      centDiff,
      exhGainLoss: centDiff,
    }
  })

  // 3. Calculate allocation amounts using existing function
  const { totalAllocAmt, totalAllocLocalAmt } = calculateTotalAllocationAmounts(
    updatedDetails,
    decimals
  )

  // 4. Calculate exchange gain/loss using existing function
  const totalExhGainLoss = calculateTotalExchangeGainLoss(
    updatedDetails,
    decimals
  )

  return {
    // Header amounts
    totLocalAmt,
    unAllocTotLocalAmt,

    // Updated details
    updatedDetails,

    // Sum calculations
    totalAllocAmt,
    totalAllocLocalAmt,
    totalExhGainLoss,
  }
}

/**
 * SEQUENCE 1: Validation for allocation
 * Checks: If details exist for allocation
 * Used for: Pre-allocation validation
 */
export const validateAllocation = (details: IArReceiptDt[]): boolean => {
  return details.length > 0
}

/**
 * SEQUENCE 2: Calculate item allocation amounts
 * Calculates: allocLocalAmt, docAllocLocalAmt, centDiff, exhGainLoss for single item
 * Used for: Individual item allocation calculations
 */
export const calculateItemAllocationSequence = (
  item: IArReceiptDt,
  allocAmt: number,
  decimals: IDecimal
) => {
  const exhRate = item.docExhRate || 1
  const docExhRate = item.docExhRate || 1

  // Calculate allocation amounts using account helpers
  const allocLocalAmt = calculateMultiplierAmount(
    allocAmt,
    exhRate,
    decimals.locAmtDec
  )
  const docAllocAmt = allocAmt
  const docAllocLocalAmt = calculateMultiplierAmount(
    allocAmt,
    docExhRate,
    decimals.locAmtDec
  )

  // Calculate cent difference using subtraction helper
  const centDiff = calculateSubtractionAmount(
    docAllocLocalAmt,
    allocLocalAmt,
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
