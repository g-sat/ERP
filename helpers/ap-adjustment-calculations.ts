import {
  calculateAdditionAmount,
  calculateMultiplierAmount,
  calculatePercentagecAmount,
  calculateSubtractionAmount,
  mathRound,
} from "@/helpers/account"
import { IApAdjustmentDt, IDecimal } from "@/interfaces"

/**
 * Calculate total amounts (base currency)
 */
export const calculateTotalAmounts = (
  details: IApAdjustmentDt[],
  amtDec: number
) => {
  const totals = {
    totAmt: 0,
    gstAmt: 0,
    totAmtAftGst: 0,
  }

  details.forEach((detail) => {
    totals.totAmt = calculateAdditionAmount(
      totals.totAmt,
      Number(detail.totAmt) || 0,
      amtDec
    )
    totals.gstAmt = calculateAdditionAmount(
      totals.gstAmt,
      Number(detail.gstAmt) || 0,
      amtDec
    )
  })

  return {
    totAmt: totals.totAmt,
    gstAmt: totals.gstAmt,
    totAmtAftGst: calculateAdditionAmount(totals.totAmt, totals.gstAmt, amtDec),
  }
}

/**
 * Calculate local currency amounts
 */
export const calculateLocalAmounts = (
  details: IApAdjustmentDt[],
  locAmtDec: number
) => {
  const totals = {
    totLocalAmt: 0,
    gstLocalAmt: 0,
    totLocalAmtAftGst: 0,
  }

  details.forEach((detail) => {
    totals.totLocalAmt = calculateAdditionAmount(
      totals.totLocalAmt,
      Number(detail.totLocalAmt) || 0,
      locAmtDec
    )
    totals.gstLocalAmt = calculateAdditionAmount(
      totals.gstLocalAmt,
      Number(detail.gstLocalAmt) || 0,
      locAmtDec
    )
  })

  return {
    totLocalAmt: totals.totLocalAmt,
    gstLocalAmt: totals.gstLocalAmt,
    totLocalAmtAftGst: calculateAdditionAmount(
      totals.totLocalAmt,
      totals.gstLocalAmt,
      locAmtDec
    ),
  }
}

/**
 * Calculate country currency amounts
 */
export const calculateCtyAmounts = (
  details: IApAdjustmentDt[],
  ctyAmtDec: number
) => {
  const totals = {
    totCtyAmt: 0,
    gstCtyAmt: 0,
    totCtyAmtAftGst: 0,
  }

  details.forEach((detail) => {
    totals.totCtyAmt = calculateAdditionAmount(
      totals.totCtyAmt,
      Number(detail.totCtyAmt) || 0,
      ctyAmtDec
    )
    totals.gstCtyAmt = calculateAdditionAmount(
      totals.gstCtyAmt,
      Number(detail.gstCtyAmt) || 0,
      ctyAmtDec
    )
  })

  return {
    totCtyAmt: totals.totCtyAmt,
    gstCtyAmt: totals.gstCtyAmt,
    totCtyAmtAftGst: calculateAdditionAmount(
      totals.totCtyAmt,
      totals.gstCtyAmt,
      ctyAmtDec
    ),
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
 * Calculate country amount based on total amount and city exchange rate
 */
export const calculateCtyAmount = (
  totAmt: number,
  cityExchangeRate: number,
  decimals: IDecimal
) => {
  return calculateMultiplierAmount(totAmt, cityExchangeRate, decimals.ctyAmtDec)
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

/**
 * Recalculate all amounts for a detail row based on exchange rates
 */
export const recalculateDetailAmounts = (
  detail: IApAdjustmentDt,
  exchangeRate: number,
  cityExchangeRate: number,
  decimals: IDecimal,
  hasCountryCurrency: boolean
) => {
  const totAmt = detail.totAmt || 0
  const gstPercentage = detail.gstPercentage || 0

  // Calculate GST amount
  const gstAmt = calculateGstAmount(totAmt, gstPercentage, decimals)

  // Calculate local amounts
  const totLocalAmt = calculateLocalAmount(totAmt, exchangeRate, decimals)
  const gstLocalAmt = calculateLocalAmount(gstAmt, exchangeRate, decimals)

  // Calculate country amounts if enabled
  let totCtyAmt = 0
  let gstCtyAmt = 0
  if (hasCountryCurrency) {
    totCtyAmt = calculateCtyAmount(totAmt, cityExchangeRate, decimals)
    gstCtyAmt = calculateCtyAmount(gstAmt, cityExchangeRate, decimals)
  }

  return {
    ...detail,
    gstAmt,
    totLocalAmt,
    gstLocalAmt,
    totCtyAmt,
    gstCtyAmt,
  }
}

/**
 * Recalculate all amounts for all detail rows based on exchange rates
 */
export const recalculateAllDetailAmounts = (
  details: IApAdjustmentDt[],
  exchangeRate: number,
  cityExchangeRate: number,
  decimals: IDecimal,
  hasCountryCurrency: boolean
) => {
  return details.map((detail) =>
    recalculateDetailAmounts(
      detail,
      exchangeRate,
      cityExchangeRate,
      decimals,
      hasCountryCurrency
    )
  )
}

// type AdjustmentTotalsAccumulator = {
//   totAmt: number
//   gstAmt: number
//   totLocalAmt: number
//   gstLocalAmt: number
//   totCtyAmt: number
//   gstCtyAmt: number
// }

// const createEmptyAccumulator = (): AdjustmentTotalsAccumulator => ({
//   totAmt: 0,
//   gstAmt: 0,
//   totLocalAmt: 0,
//   gstLocalAmt: 0,
//   totCtyAmt: 0,
//   gstCtyAmt: 0,
// })

// const accumulateTotals = (
//   accumulator: AdjustmentTotalsAccumulator,
//   detail: IApAdjustmentDt
// ) => {
//   accumulator.totAmt += Number(detail.totAmt) || 0
//   accumulator.gstAmt += Number(detail.gstAmt) || 0
//   accumulator.totLocalAmt += Number(detail.totLocalAmt) || 0
//   accumulator.gstLocalAmt += Number(detail.gstLocalAmt) || 0
//   accumulator.totCtyAmt += Number(detail.totCtyAmt) || 0
//   accumulator.gstCtyAmt += Number(detail.gstCtyAmt) || 0
// }

// export const calculateAdjustmentHeaderTotals = (
//   details: IApAdjustmentDt[],
//   decimals: IDecimal,
//   hasCountryCurrency: boolean
// ) => {
//   if (!details || details.length === 0) {
//     return {
//       isDebit: false,
//       totAmt: 0,
//       gstAmt: 0,
//       totAmtAftGst: 0,
//       totLocalAmt: 0,
//       gstLocalAmt: 0,
//       totLocalAmtAftGst: 0,
//       totCtyAmt: 0,
//       gstCtyAmt: 0,
//       totCtyAmtAftGst: 0,
//     }
//   }

//   const debitTotals = createEmptyAccumulator()
//   const creditTotals = createEmptyAccumulator()

//   details.forEach((detail) => {
//     if (detail.isDebit) {
//       accumulateTotals(debitTotals, detail)
//     } else {
//       accumulateTotals(creditTotals, detail)
//     }
//   })

//   const net = {
//     totAmt: debitTotals.totAmt - creditTotals.totAmt,
//     gstAmt: debitTotals.gstAmt - creditTotals.gstAmt,
//     totLocalAmt: debitTotals.totLocalAmt - creditTotals.totLocalAmt,
//     gstLocalAmt: debitTotals.gstLocalAmt - creditTotals.gstLocalAmt,
//     totCtyAmt: debitTotals.totCtyAmt - creditTotals.totCtyAmt,
//     gstCtyAmt: debitTotals.gstCtyAmt - creditTotals.gstCtyAmt,
//   }

//   const amtDec = decimals.amtDec ?? 2
//   const locDec = decimals.locAmtDec ?? amtDec
//   const ctyDec = decimals.ctyAmtDec ?? locDec

//   const isDebit = net.totAmt < 0

//   const normalized = {
//     totAmt: mathRound(Math.abs(net.totAmt), amtDec),
//     gstAmt: mathRound(Math.abs(net.gstAmt), amtDec),
//     totAmtAftGst: mathRound(Math.abs(net.totAmt + net.gstAmt), amtDec),
//     totLocalAmt: mathRound(Math.abs(net.totLocalAmt), locDec),
//     gstLocalAmt: mathRound(Math.abs(net.gstLocalAmt), locDec),
//     totLocalAmtAftGst: mathRound(
//       Math.abs(net.totLocalAmt + net.gstLocalAmt),
//       locDec
//     ),
//     totCtyAmt: hasCountryCurrency
//       ? mathRound(Math.abs(net.totCtyAmt), ctyDec)
//       : 0,
//     gstCtyAmt: hasCountryCurrency
//       ? mathRound(Math.abs(net.gstCtyAmt), ctyDec)
//       : 0,
//     totCtyAmtAftGst: hasCountryCurrency
//       ? mathRound(Math.abs(net.totCtyAmt + net.gstCtyAmt), ctyDec)
//       : 0,
//   }

//   return {
//     isDebit,
//     ...normalized,
//   }
// }

type AdjustmentTotalsAccumulator = {
  totAmt: number
  gstAmt: number
  totLocalAmt: number
  gstLocalAmt: number
  totCtyAmt: number
  gstCtyAmt: number
}

const createEmptyAccumulator = (): AdjustmentTotalsAccumulator => ({
  totAmt: 0,
  gstAmt: 0,
  totLocalAmt: 0,
  gstLocalAmt: 0,
  totCtyAmt: 0,
  gstCtyAmt: 0,
})

const accumulateTotals = (
  accumulator: AdjustmentTotalsAccumulator,
  detail: IApAdjustmentDt,
  decimals: IDecimal
) => {
  accumulator.totAmt = calculateAdditionAmount(
    accumulator.totAmt,
    Number(detail.totAmt) || 0,
    decimals.amtDec
  )
  accumulator.gstAmt = calculateAdditionAmount(
    accumulator.gstAmt,
    Number(detail.gstAmt) || 0,
    decimals.amtDec
  )
  accumulator.totLocalAmt = calculateAdditionAmount(
    accumulator.totLocalAmt,
    Number(detail.totLocalAmt) || 0,
    decimals.locAmtDec
  )
  accumulator.gstLocalAmt = calculateAdditionAmount(
    accumulator.gstLocalAmt,
    Number(detail.gstLocalAmt) || 0,
    decimals.locAmtDec
  )
  accumulator.totCtyAmt = calculateAdditionAmount(
    accumulator.totCtyAmt,
    Number(detail.totCtyAmt) || 0,
    decimals.ctyAmtDec
  )
  accumulator.gstCtyAmt = calculateAdditionAmount(
    accumulator.gstCtyAmt,
    Number(detail.gstCtyAmt) || 0,
    decimals.ctyAmtDec
  )
}

export const calculateAdjustmentHeaderTotals = (
  details: IApAdjustmentDt[],
  decimals: IDecimal,
  hasCountryCurrency: boolean
) => {
  if (!details || details.length === 0) {
    return {
      isDebit: false,
      totAmt: 0,
      gstAmt: 0,
      totAmtAftGst: 0,
      totLocalAmt: 0,
      gstLocalAmt: 0,
      totLocalAmtAftGst: 0,
      totCtyAmt: 0,
      gstCtyAmt: 0,
      totCtyAmtAftGst: 0,
    }
  }

  const debitTotals = createEmptyAccumulator()
  const creditTotals = createEmptyAccumulator()

  details.forEach((detail) => {
    if (detail.isDebit) {
      accumulateTotals(debitTotals, detail, decimals)
    } else {
      accumulateTotals(creditTotals, detail, decimals)
    }
  })

  const amtDec = decimals.amtDec ?? 2
  const locDec = decimals.locAmtDec ?? amtDec
  const ctyDec = decimals.ctyAmtDec ?? locDec

  const net = {
    totAmt: calculateSubtractionAmount(
      debitTotals.totAmt,
      creditTotals.totAmt,
      amtDec
    ),
    gstAmt: calculateSubtractionAmount(
      debitTotals.gstAmt,
      creditTotals.gstAmt,
      amtDec
    ),
    totLocalAmt: calculateSubtractionAmount(
      debitTotals.totLocalAmt,
      creditTotals.totLocalAmt,
      locDec
    ),
    gstLocalAmt: calculateSubtractionAmount(
      debitTotals.gstLocalAmt,
      creditTotals.gstLocalAmt,
      locDec
    ),
    totCtyAmt: calculateSubtractionAmount(
      debitTotals.totCtyAmt,
      creditTotals.totCtyAmt,
      ctyDec
    ),
    gstCtyAmt: calculateSubtractionAmount(
      debitTotals.gstCtyAmt,
      creditTotals.gstCtyAmt,
      ctyDec
    ),
  }

  const isDebit = net.totAmt < 0

  const normalized = {
    totAmt: mathRound(Math.abs(net.totAmt), amtDec),
    gstAmt: mathRound(Math.abs(net.gstAmt), amtDec),
    totAmtAftGst: mathRound(
      Math.abs(calculateAdditionAmount(net.totAmt, net.gstAmt, amtDec)),
      amtDec
    ),
    totLocalAmt: mathRound(Math.abs(net.totLocalAmt), locDec),
    gstLocalAmt: mathRound(Math.abs(net.gstLocalAmt), locDec),
    totLocalAmtAftGst: mathRound(
      Math.abs(
        calculateAdditionAmount(net.totLocalAmt, net.gstLocalAmt, locDec)
      ),
      locDec
    ),
    totCtyAmt: hasCountryCurrency
      ? mathRound(Math.abs(net.totCtyAmt), ctyDec)
      : 0,
    gstCtyAmt: hasCountryCurrency
      ? mathRound(Math.abs(net.gstCtyAmt), ctyDec)
      : 0,
    totCtyAmtAftGst: hasCountryCurrency
      ? mathRound(
          Math.abs(
            calculateAdditionAmount(net.totCtyAmt, net.gstCtyAmt, ctyDec)
          ),
          ctyDec
        )
      : 0,
  }

  return {
    isDebit,
    ...normalized,
  }
}
