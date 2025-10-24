import {
  calculateAdditionAmount,
  calculateDivisionAmount,
  calculateMultiplierAmount,
  calculateSubtractionAmount,
} from "@/helpers/account"
import { IArReceiptDt, IDecimal } from "@/interfaces"

// ============================================================================
//  DETAILS CALCULATIONS
// ============================================================================

export const totalAllocationAmount = (
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

export const totalExchangeGainLoss = (
  details: IArReceiptDt[],
  decimals: IDecimal
) => {
  let totalExhGainLoss = 0

  // totalExhGainLoss = details.reduce((sum, detail) => {
  //   return sum + (Number(detail.exhGainLoss) || 0)
  // }, 0)

  // return mathRound(totalExhGainLoss, decimals.amtDec)

  // Use addition helper for each detail
  details.forEach((detail) => {
    const exhGainLoss = Number(detail.exhGainLoss) || 0

    totalExhGainLoss = calculateAdditionAmount(
      totalExhGainLoss,
      exhGainLoss,
      decimals.amtDec
    )
  })

  return {
    totalExhGainLoss,
  }
}

export const computeLocalAmountsAndExchangeGainLoss = (
  details: IArReceiptDt[],
  exchangeRate: number,
  decimals: IDecimal
) => {
  const updatedDetails = details.map((detail) => {
    const allocAmt = detail.allocAmt || 0
    const docExhRate = detail.docExhRate || 1

    // Calculate allocLocalAmt with new exchange rate
    const allocLocalAmt = calculateMultiplierAmount(
      allocAmt,
      exchangeRate,
      decimals.locAmtDec
    )

    // Calculate docAllocLocalAmt with document exchange rate
    const docAllocLocalAmt = calculateMultiplierAmount(
      allocAmt,
      docExhRate,
      decimals.locAmtDec
    )

    // Calculate exhGainLoss = docAllocLocalAmt - allocLocalAmt
    const exhGainLoss = calculateSubtractionAmount(
      docAllocLocalAmt,
      allocLocalAmt,
      decimals.locAmtDec
    )

    return {
      ...detail,
      allocLocalAmt,
      docAllocLocalAmt,
      centDiff: 0,
      exhGainLoss: exhGainLoss,
    }
  })

  return updatedDetails
}

export const calculateItemAllocationSequence = (
  item: IArReceiptDt,
  allocAmt: number,
  exhRate: number,
  decimals: IDecimal
) => {
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
  const exhGainLoss = calculateSubtractionAmount(
    docAllocLocalAmt,
    allocLocalAmt,
    decimals.locAmtDec
  )

  return {
    allocLocalAmt,
    docAllocAmt,
    docAllocLocalAmt,
    centdiff: 0,
    exhGainLoss,
  }
}

//totAmt=0
export const allocateFullAmounts = (
  data: IArReceiptDt[],
  exchangeRate: number,
  decimals: IDecimal
) => {
  return data.map((item) => {
    const allocAmt = item.docBalAmt || 0

    // Calculate allocation amounts using the sequence function
    const calculatedValues = calculateItemAllocationSequence(
      item,
      allocAmt,
      exchangeRate,
      decimals
    )

    return {
      ...item,
      allocAmt,
      allocLocalAmt: calculatedValues.allocLocalAmt,
      docAllocAmt: calculatedValues.docAllocAmt,
      docAllocLocalAmt: calculatedValues.docAllocLocalAmt,
      exhGainLoss: calculatedValues.exhGainLoss,
    }
  })
}

export const calculateHeaderAmountsForProportionalAllocation = (
  details: IArReceiptDt[],
  totAmt: number,
  exchangeRate: number,
  decimals: IDecimal
) => {
  // Calculate unallocated amounts inline
  const { unAllocTotAmt, unAllocTotLocalAmt } = calculateUnallocatedAmounts(
    details,
    totAmt,
    exchangeRate,
    decimals
  )

  const { totalExhGainLoss } = totalExchangeGainLoss(details, decimals)

  return {
    unAllocTotAmt: unAllocTotAmt,
    unAllocTotLocalAmt: unAllocTotLocalAmt,
    exhGainLoss: totalExhGainLoss,
  }
}

// ============================================================================
//  HEADER CALCULATIONS
// ============================================================================

export const calculateUnallocatedAmounts = (
  details: IArReceiptDt[],
  totAmt: number,
  exchangeRate: number,
  decimals: IDecimal
) => {
  const { totalAllocAmt } = totalAllocationAmount(details, decimals)
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

  return {
    unAllocTotAmt: unAllocAmt,
    unAllocTotLocalAmt: unAllocLocalAmt,
  }
}

export const calculateTotAmtFromRecTotAmt = (
  recTotLocalAmt: number,
  exchangeRate: number,
  decimals: IDecimal
) => {
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

export const recalculateAllAmountsOnExchangeRateChange = (
  details: IArReceiptDt[],
  totAmt: number,
  unAllocTotAmt: number,
  exchangeRate: number,
  decimals: IDecimal
) => {
  // 1. Calculate header amounts using existing functions
  const totLocalAmt = calculateMultiplierAmount(
    totAmt,
    exchangeRate,
    decimals.locAmtDec
  )
  const unAllocTotLocalAmt = calculateMultiplierAmount(
    unAllocTotAmt,
    exchangeRate,
    decimals.locAmtDec
  )

  // 2. Recalculate all details with totLocalAmt, allocLocalAmt, docAllocLocalAmt, and centDiff
  const updatedDetails = computeLocalAmountsAndExchangeGainLoss(
    details,
    exchangeRate,
    decimals
  ) as unknown as IArReceiptDt[]

  // 3. Calculate allocation amounts using existing function
  const { totalAllocAmt, totalAllocLocalAmt } = totalAllocationAmount(
    updatedDetails,
    decimals
  )

  // 4. Calculate exchange gain/loss using existing function
  const { totalExhGainLoss } = totalExchangeGainLoss(updatedDetails, decimals)

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

export const validateAllocation = (details: IArReceiptDt[]): boolean => {
  return details.length > 0
}
