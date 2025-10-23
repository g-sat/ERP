import { mathRound } from "@/helpers/account"
import { IArReceiptDt, IDecimal } from "@/interfaces"

/**
 * Calculate total amounts (base currency)
 */
export const calculateTotalAmounts = (
  details: IArReceiptDt[],
  amtDec: number
) => {
  const totals = {
    totAmt: 0,
  }

  details.forEach((detail) => {
    totals.totAmt += Number(detail.docTotAmt) || 0
  })

  return {
    totAmt: mathRound(totals.totAmt, amtDec),
  }
}

/**
 * Calculate local currency amounts
 */
export const calculateLocalAmounts = (
  details: IArReceiptDt[],
  locAmtDec: number
) => {
  const totals = {
    totLocalAmt: 0,
  }

  details.forEach((detail) => {
    totals.totLocalAmt += Number(detail.docTotLocalAmt) || 0
  })

  return {
    totLocalAmt: mathRound(totals.totLocalAmt, locAmtDec),
  }
}

/**
 * Calculate country currency amounts
 */
export const calculateCountryAmounts = (
  details: IArReceiptDt[],
  ctyAmtDec: number
) => {
  const totals = {
    totCtyAmt: 0,
  }

  details.forEach((detail) => {
    totals.totCtyAmt += Number(detail.docTotAmt) || 0
  })

  return {
    totCtyAmt: mathRound(totals.totCtyAmt, ctyAmtDec),
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
 * Calculate country amount based on total amount and city exchange rate
 */
export const calculateCountryAmount = (
  totAmt: number,
  cityExchangeRate: number,
  decimals: IDecimal
) => {
  const countryAmt = totAmt * cityExchangeRate
  return mathRound(countryAmt, decimals.ctyAmtDec)
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

/**
 * Recalculate all amounts for a detail row based on exchange rates
 */
export const recalculateDetailAmounts = (
  detail: IArReceiptDt,
  exchangeRate: number,
  decimals: IDecimal
) => {
  const totAmt = detail.docTotAmt || 0

  // Calculate local amounts
  const totLocalAmt = calculateLocalAmount(totAmt, exchangeRate, decimals)

  return {
    ...detail,
    totLocalAmt,
  }
}

/**
 * Recalculate all amounts for all detail rows based on exchange rates
 */
export const recalculateAllDetailAmounts = (
  details: IArReceiptDt[],
  exchangeRate: number,
  decimals: IDecimal
) => {
  return details.map((detail) =>
    recalculateDetailAmounts(detail, exchangeRate, decimals)
  )
}

/**
 * Calculate allocation amounts and exchange gain/loss for auto-allocated transactions
 */
export const calculateAllocationAmounts = (
  allocAmt: number,
  exhRate: number,
  docExhRate: number,
  docTotLocalAmt: number,
  decimals: IDecimal
) => {
  // Calculate allocation amounts
  const allocLocalAmt = mathRound(allocAmt * exhRate, decimals.locAmtDec)
  const docAllocAmt = allocAmt
  const docAllocLocalAmt = mathRound(allocAmt * docExhRate, decimals.locAmtDec)

  // Calculate cent difference
  const centDiff = mathRound(
    docAllocLocalAmt - allocLocalAmt,
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

/**
 * Calculate total exchange gain/loss from all details
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

/**
 * Calculate total allocation amounts from details
 */
export const calculateTotalAllocationAmounts = (
  details: IArReceiptDt[],
  decimals: IDecimal
) => {
  const totalAllocAmt = details.reduce((sum, detail) => {
    return sum + (Number(detail.allocAmt) || 0)
  }, 0)

  const totalAllocLocalAmt = details.reduce((sum, detail) => {
    return sum + (Number(detail.allocLocalAmt) || 0)
  }, 0)

  return {
    totalAllocAmt: mathRound(totalAllocAmt, decimals.amtDec),
    totalAllocLocalAmt: mathRound(totalAllocLocalAmt, decimals.locAmtDec),
  }
}

/**
 * Calculate unallocated amounts for proportional allocation
 */
export const calculateUnallocatedAmounts = (
  details: IArReceiptDt[],
  totAmt: number,
  exchangeRate: number,
  decimals: IDecimal
) => {
  const { totalAllocAmt } = calculateTotalAllocationAmounts(details, decimals)
  const unAllocAmt = totAmt - totalAllocAmt
  const unAllocLocalAmt = mathRound(
    unAllocAmt * exchangeRate,
    decimals.locAmtDec
  )

  return {
    unAllocAmt: mathRound(unAllocAmt, decimals.amtDec),
    unAllocLocalAmt,
  }
}

/**
 * Calculate header amounts for full allocation (totAmt = 0)
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
 */
export const calculateHeaderAmountsForProportionalAllocation = (
  details: IArReceiptDt[],
  totAmt: number,
  exchangeRate: number,
  decimals: IDecimal
) => {
  const { unAllocAmt, unAllocLocalAmt } = calculateUnallocatedAmounts(
    details,
    totAmt,
    exchangeRate,
    decimals
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
 */
export const calculateReceiptTotalsFromTotAmt = (
  totAmt: number,
  exchangeRate: number,
  decimals: IDecimal
) => {
  const totLocalAmt = mathRound(totAmt * exchangeRate, decimals.locAmtDec)
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
 * Calculate totAmt from recTotAmt (when currencies are different)
 */
export const calculateTotAmtFromRecTotAmt = (
  recTotAmt: number,
  recExchangeRate: number,
  exchangeRate: number,
  decimals: IDecimal
) => {
  const recTotLocalAmt = mathRound(
    recTotAmt * recExchangeRate,
    decimals.locAmtDec
  )
  const totAmt =
    exchangeRate > 0
      ? mathRound(recTotLocalAmt / exchangeRate, decimals.amtDec)
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
 * Calculate unallocated local amount from unallocated amount
 */
export const calculateUnallocatedLocalAmount = (
  unAllocTotAmt: number,
  exchangeRate: number,
  decimals: IDecimal
) => {
  return mathRound(unAllocTotAmt * exchangeRate, decimals.locAmtDec)
}

/**
 * SEQUENCE 1: Validation for allocation
 */
export const validateAllocation = (details: IArReceiptDt[]): boolean => {
  return details.length > 0
}

/**
 * SEQUENCE 2: Calculate item allocation amounts
 */
export const calculateItemAllocationSequence = (
  item: IArReceiptDt,
  allocAmt: number,
  decimals: IDecimal
) => {
  return calculateAllocationAmounts(
    allocAmt,
    item.docExhRate || 1,
    item.docExhRate || 1,
    item.docTotLocalAmt || 0,
    decimals
  )
}

/**
 * SEQUENCE 3: Calculate total allocations
 */
export const calculateTotalAllocationsSequence = calculateTotalAllocationAmounts

/**
 * SEQUENCE 4: Calculate header amounts for full allocation
 */
export const calculateHeaderAmountsSequence =
  calculateHeaderAmountsForFullAllocation

/**
 * SEQUENCE 5: Calculate unallocated amounts for proportional allocation
 */
export const calculateUnallocatedAmountsSequence =
  calculateHeaderAmountsForProportionalAllocation

/**
 * SEQUENCE 6: Calculate exchange gain/loss
 */
export const calculateExchangeGainLossSequence = calculateTotalExchangeGainLoss
