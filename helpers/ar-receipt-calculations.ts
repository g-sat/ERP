import {
  calculateAdditionAmount,
  calculateDivisionAmount,
  calculateMultiplierAmount,
  calculateSubtractionAmount,
} from "@/helpers/account"
import { IArReceiptDt, IDecimal } from "@/interfaces"

// ============================================================================
// HEADER CALCULATIONS (IArReceiptHd)
// ============================================================================

/**
 * 1. totLocalAmt = totAmt * exhRate
 */
export const calculateTotLocalAmt = (
  totAmt: number,
  exhRate: number,
  decimals: IDecimal
): number => {
  return calculateMultiplierAmount(totAmt, exhRate, decimals.locAmtDec)
}

/**
 * 2.1 recTotLocalAmt = recTotAmt * recExhRate
 */
export const calculateRecTotLocalAmt = (
  recTotAmt: number,
  recExhRate: number,
  decimals: IDecimal
): number => {
  return calculateMultiplierAmount(recTotAmt, recExhRate, decimals.locAmtDec)
}

/**
 * 3. unAllocTotAmt = totAmt - allocAmtHd
 */
export const calculateUnAllocTotAmt = (
  totAmt: number,
  allocAmtHd: number,
  decimals: IDecimal
): number => {
  return calculateSubtractionAmount(totAmt, allocAmtHd, decimals.amtDec)
}

/**
 * 3.1 unAllocTotLocalAmt = totLocalAmt - allocLocalAmtHd
 */
export const calculateUnAllocTotLocalAmt = (
  totLocalAmt: number,
  allocLocalAmtHd: number,
  decimals: IDecimal
): number => {
  return calculateSubtractionAmount(
    totLocalAmt,
    allocLocalAmtHd,
    decimals.locAmtDec
  )
}

/**
 * 4. totAmt = recTotLocalAmt / exhRate
 */
export const calculateTotAmtFromRecTotLocalAmt = (
  recTotLocalAmt: number,
  exhRate: number,
  decimals: IDecimal
): number => {
  return exhRate > 0
    ? calculateDivisionAmount(recTotLocalAmt, exhRate, decimals.amtDec)
    : 0
}

/**
 * 4.1 totLocalAmt = recTotLocalAmt
 */
export const calculateTotLocalAmtFromRecTotLocalAmt = (
  recTotLocalAmt: number
): number => {
  return recTotLocalAmt
}

// ============================================================================
// DETAIL CALCULATIONS (IArReceiptDt)
// ============================================================================

/**
 * i. allocLocalAmt = allocAmt * ExhRate
 */
export const calculateAllocLocalAmt = (
  allocAmt: number,
  exhRate: number,
  decimals: IDecimal
): number => {
  return calculateMultiplierAmount(allocAmt, exhRate, decimals.locAmtDec)
}

/**
 * ii. docAllocAmt = allocAmt & docAllocLocalAmt = docAllocAmt * docExhRate
 */
export const calculateDocAllocAmounts = (
  allocAmt: number,
  docExhRate: number,
  decimals: IDecimal
) => {
  const docAllocAmt = allocAmt
  const docAllocLocalAmt = calculateMultiplierAmount(
    allocAmt,
    docExhRate,
    decimals.locAmtDec
  )

  return {
    docAllocAmt,
    docAllocLocalAmt,
  }
}

/**
 * iii. exhGainLoss = docAllocLocalAmt - allocLocalAmt
 */
export const calculateExhGainLoss = (
  docAllocLocalAmt: number,
  allocLocalAmt: number,
  decimals: IDecimal
): number => {
  return calculateSubtractionAmount(
    docAllocLocalAmt,
    allocLocalAmt,
    decimals.locAmtDec
  )
}

/**
 * iv. sum of allocAmt & allocLocalAmt
 */
export const calculateSumAllocationAmounts = (
  details: IArReceiptDt[],
  decimals: IDecimal
) => {
  let sumAllocAmt = 0
  let sumAllocLocalAmt = 0

  details.forEach((detail) => {
    const allocAmt = Number(detail.allocAmt) || 0
    const allocLocalAmt = Number(detail.allocLocalAmt) || 0

    sumAllocAmt = calculateAdditionAmount(
      sumAllocAmt,
      allocAmt,
      decimals.amtDec
    )
    sumAllocLocalAmt = calculateAdditionAmount(
      sumAllocLocalAmt,
      allocLocalAmt,
      decimals.locAmtDec
    )
  })

  return {
    sumAllocAmt,
    sumAllocLocalAmt,
  }
}

/**
 * v. sum of exhGainLoss
 */
export const calculateSumExhGainLoss = (
  details: IArReceiptDt[],
  decimals: IDecimal
): number => {
  let sumExhGainLoss = 0

  details.forEach((detail) => {
    const exhGainLoss = Number(detail.exhGainLoss) || 0
    sumExhGainLoss = calculateAdditionAmount(
      sumExhGainLoss,
      exhGainLoss,
      decimals.amtDec
    )
  })

  return sumExhGainLoss
}

// ============================================================================
// SCENARIO IMPLEMENTATIONS
// ============================================================================

/**
 * Scenario A: (currency == recCurrencyId) && (data_details.length == 0 || sum(allocAmt) == 0)
 * => then pass totAmt to function 1
 * => then pass totAmt to recTotAmt into function 2 => 2.1
 * => then pass totAmt to unAllocTotAmt into function 3 => 3.1
 */
export const handleScenarioA = (
  totAmt: number,
  exhRate: number,
  decimals: IDecimal
) => {
  // 1. totLocalAmt = totAmt * exhRate
  const totLocalAmt = calculateTotLocalAmt(totAmt, exhRate, decimals)

  // 2. recTotAmt = totAmt
  const recTotAmt = totAmt

  //2.1 recTotLocalAmt
  const recTotLocalAmt = totLocalAmt

  // 3. unAllocTotAmt = totAmt
  const unAllocTotAmt = totAmt

  // 3.1 unAllocTotLocalAmt = totLocalAmt
  const unAllocTotLocalAmt = totLocalAmt

  return {
    totLocalAmt,
    recTotAmt,
    recTotLocalAmt,
    unAllocTotAmt,
    unAllocTotLocalAmt,
  }
}

/**
 * Scenario B: (currency != recCurrencyId) && (data_details.length == 0 || sum(allocAmt) == 0)
 * => then pass recTotAmt to function 2.1
 * => then pass recTotAmt to function 4 => 4.1 => 3 => 3.1
 */
export const handleScenarioB = (
  recTotAmt: number,
  recExhRate: number,
  exhRate: number,
  decimals: IDecimal
) => {
  // 2.1 recTotLocalAmt = recTotAmt * recExhRate
  const recTotLocalAmt = calculateRecTotLocalAmt(
    recTotAmt,
    recExhRate,
    decimals
  )

  // 4. totAmt = recTotLocalAmt / exhRate
  const totAmt = calculateTotAmtFromRecTotLocalAmt(
    recTotLocalAmt,
    exhRate,
    decimals
  )

  // 4.1 totLocalAmt = recTotLocalAmt
  const totLocalAmt = calculateTotLocalAmtFromRecTotLocalAmt(recTotLocalAmt)

  // 3. unAllocTotAmt = totAmt - allocAmtHd (allocAmtHd = 0 in this scenario)
  const unAllocTotAmt = calculateUnAllocTotAmt(totAmt, 0, decimals)

  // 3.1 unAllocTotLocalAmt = totLocalAmt - allocLocalAmtHd (allocLocalAmtHd = 0 in this scenario)
  const unAllocTotLocalAmt = calculateUnAllocTotLocalAmt(
    totLocalAmt,
    0,
    decimals
  )

  return {
    totAmt,
    totLocalAmt,
    recTotAmt,
    recTotLocalAmt,
    unAllocTotAmt,
    unAllocTotLocalAmt,
  }
}

/**
 * Scenario C: (data_details.length != 0 || sum(allocAmt) != 0)
 * => then call i=>ii=> iii => iv => v => 3 => 3.1
 */
export const handleScenarioC = (
  details: IArReceiptDt[],
  totAmt: number,
  exhRate: number,
  decimals: IDecimal
) => {
  // Process each detail: i => ii => iii
  const updatedDetails = details.map((detail) => {
    const allocAmt = Number(detail.allocAmt) || 0
    const docExhRate = Number(detail.docExhRate) || 1

    // i. allocLocalAmt = allocAmt * ExhRate
    const allocLocalAmt = calculateAllocLocalAmt(allocAmt, exhRate, decimals)

    // ii. docAllocAmt = allocAmt & docAllocLocalAmt = docAllocAmt * docExhRate
    const { docAllocAmt, docAllocLocalAmt } = calculateDocAllocAmounts(
      allocAmt,
      docExhRate,
      decimals
    )

    // iii. exhGainLoss = docAllocLocalAmt - allocLocalAmt
    const exhGainLoss = calculateExhGainLoss(
      docAllocLocalAmt,
      allocLocalAmt,
      decimals
    )

    return {
      ...detail,
      allocLocalAmt,
      docAllocAmt,
      docAllocLocalAmt,
      exhGainLoss,
    }
  })

  // iv. sum of allocAmt & allocLocalAmt
  const { sumAllocAmt, sumAllocLocalAmt } = calculateSumAllocationAmounts(
    updatedDetails,
    decimals
  )

  // v. sum of exhGainLoss
  const sumExhGainLoss = calculateSumExhGainLoss(updatedDetails, decimals)

  // 3. unAllocTotAmt = totAmt - allocAmtHd
  const unAllocTotAmt = calculateUnAllocTotAmt(totAmt, sumAllocAmt, decimals)

  // 3.1 unAllocTotLocalAmt = totLocalAmt - allocLocalAmtHd
  const totLocalAmt = calculateTotLocalAmt(totAmt, exhRate, decimals)
  const unAllocTotLocalAmt = calculateUnAllocTotLocalAmt(
    totLocalAmt,
    sumAllocLocalAmt,
    decimals
  )

  return {
    updatedDetails,
    sumAllocAmt,
    sumAllocLocalAmt,
    sumExhGainLoss,
    unAllocTotAmt,
    unAllocTotLocalAmt,
  }
}

/**
 * Scenario D: Change the exhRate && (currency == recCurrencyId)
 * => 1 => 2 => 2.2 => i=>ii=> iii => iv => v => 3 => 3.1
 */
export const handleScenarioD = (
  details: IArReceiptDt[],
  totAmt: number,
  exhRate: number,
  recExhRate: number,
  decimals: IDecimal
) => {
  // 1. totLocalAmt = totAmt * exhRate
  const totLocalAmt = calculateTotLocalAmt(totAmt, exhRate, decimals)

  // 2. recTotAmt = totAmt
  const recTotAmt = totAmt

  // 2.2 recTotLocalAmt = recTotAmt * recExhRate
  const recTotLocalAmt = calculateRecTotLocalAmt(
    recTotAmt,
    recExhRate,
    decimals
  )

  // Process details: i => ii => iii
  const updatedDetails = details.map((detail) => {
    const allocAmt = Number(detail.allocAmt) || 0
    const docExhRate = Number(detail.docExhRate) || 1

    // i. allocLocalAmt = allocAmt * ExhRate
    const allocLocalAmt = calculateAllocLocalAmt(allocAmt, exhRate, decimals)

    // ii. docAllocAmt = allocAmt & docAllocLocalAmt = docAllocAmt * docExhRate
    const { docAllocAmt, docAllocLocalAmt } = calculateDocAllocAmounts(
      allocAmt,
      docExhRate,
      decimals
    )

    // iii. exhGainLoss = docAllocLocalAmt - allocLocalAmt
    const exhGainLoss = calculateExhGainLoss(
      docAllocLocalAmt,
      allocLocalAmt,
      decimals
    )

    return {
      ...detail,
      allocLocalAmt,
      docAllocAmt,
      docAllocLocalAmt,
      exhGainLoss,
    }
  })

  // iv. sum of allocAmt & allocLocalAmt
  const { sumAllocAmt, sumAllocLocalAmt } = calculateSumAllocationAmounts(
    updatedDetails,
    decimals
  )

  // v. sum of exhGainLoss
  const sumExhGainLoss = calculateSumExhGainLoss(updatedDetails, decimals)

  // 3. unAllocTotAmt = totAmt - allocAmtHd
  const unAllocTotAmt = calculateUnAllocTotAmt(totAmt, sumAllocAmt, decimals)

  // 3.1 unAllocTotLocalAmt = totLocalAmt - allocLocalAmtHd
  const unAllocTotLocalAmt = calculateUnAllocTotLocalAmt(
    totLocalAmt,
    sumAllocLocalAmt,
    decimals
  )

  return {
    totLocalAmt,
    recTotAmt,
    recTotLocalAmt,
    updatedDetails,
    sumAllocAmt,
    sumAllocLocalAmt,
    sumExhGainLoss,
    unAllocTotAmt,
    unAllocTotLocalAmt,
  }
}

/**
 * Scenario E: Change the recExhRate && (currency != recCurrencyId)
 * => 2.1 => 4 => 4.1 => i=>ii=> iii => iv => v => 3 => 3.1
 */
export const handleScenarioE = (
  details: IArReceiptDt[],
  recTotAmt: number,
  recExhRate: number,
  exhRate: number,
  decimals: IDecimal
) => {
  // 2.1 recTotLocalAmt = recTotAmt * recExhRate
  const recTotLocalAmt = calculateRecTotLocalAmt(
    recTotAmt,
    recExhRate,
    decimals
  )

  // 4. totAmt = recTotLocalAmt / exhRate
  const totAmt = calculateTotAmtFromRecTotLocalAmt(
    recTotLocalAmt,
    exhRate,
    decimals
  )

  // 4.1 totLocalAmt = recTotLocalAmt
  const totLocalAmt = calculateTotLocalAmtFromRecTotLocalAmt(recTotLocalAmt)

  // Process details: i => ii => iii
  const updatedDetails = details.map((detail) => {
    const allocAmt = Number(detail.allocAmt) || 0
    const docExhRate = Number(detail.docExhRate) || 1

    // i. allocLocalAmt = allocAmt * ExhRate
    const allocLocalAmt = calculateAllocLocalAmt(allocAmt, exhRate, decimals)

    // ii. docAllocAmt = allocAmt & docAllocLocalAmt = docAllocAmt * docExhRate
    const { docAllocAmt, docAllocLocalAmt } = calculateDocAllocAmounts(
      allocAmt,
      docExhRate,
      decimals
    )

    // iii. exhGainLoss = docAllocLocalAmt - allocLocalAmt
    const exhGainLoss = calculateExhGainLoss(
      docAllocLocalAmt,
      allocLocalAmt,
      decimals
    )

    return {
      ...detail,
      allocLocalAmt,
      docAllocAmt,
      docAllocLocalAmt,
      exhGainLoss,
    }
  })

  // iv. sum of allocAmt & allocLocalAmt
  const { sumAllocAmt, sumAllocLocalAmt } = calculateSumAllocationAmounts(
    updatedDetails,
    decimals
  )

  // v. sum of exhGainLoss
  const sumExhGainLoss = calculateSumExhGainLoss(updatedDetails, decimals)

  // 3. unAllocTotAmt = totAmt - allocAmtHd
  const unAllocTotAmt = calculateUnAllocTotAmt(totAmt, sumAllocAmt, decimals)

  // 3.1 unAllocTotLocalAmt = totLocalAmt - allocLocalAmtHd
  const unAllocTotLocalAmt = calculateUnAllocTotLocalAmt(
    totLocalAmt,
    sumAllocLocalAmt,
    decimals
  )

  return {
    totAmt,
    totLocalAmt,
    recTotAmt,
    recTotLocalAmt,
    updatedDetails,
    sumAllocAmt,
    sumAllocLocalAmt,
    sumExhGainLoss,
    unAllocTotAmt,
    unAllocTotLocalAmt,
  }
}

/**
 * Scenario F: Change the currency && (currency != recCurrencyId)
 * => totAmt = recTotLocalAmt / exhRate => 1 => 2 => 2.2 => pass all details allocAmt=0 > i=>ii=> iii => iv => v => 3 => 3.1
 */
export const handleScenarioF = (
  details: IArReceiptDt[],
  recTotLocalAmt: number,
  exhRate: number,
  recExhRate: number,
  decimals: IDecimal
) => {
  // totAmt = recTotLocalAmt / exhRate
  const totAmt = calculateTotAmtFromRecTotLocalAmt(
    recTotLocalAmt,
    exhRate,
    decimals
  )

  // 1. totLocalAmt = totAmt * exhRate
  const totLocalAmt = calculateTotLocalAmt(totAmt, exhRate, decimals)

  // 2. recTotAmt = totAmt
  const recTotAmt = totAmt

  // 2.2 recTotLocalAmt = recTotAmt * recExhRate
  const newRecTotLocalAmt = calculateRecTotLocalAmt(
    recTotAmt,
    recExhRate,
    decimals
  )

  // Process details with allocAmt=0: i => ii => iii
  const updatedDetails = details.map((detail) => {
    const allocAmt = 0 // Set allocAmt to 0 as per specification
    const docExhRate = Number(detail.docExhRate) || 1

    // i. allocLocalAmt = allocAmt * ExhRate
    const allocLocalAmt = calculateAllocLocalAmt(allocAmt, exhRate, decimals)

    // ii. docAllocAmt = allocAmt & docAllocLocalAmt = docAllocAmt * docExhRate
    const { docAllocAmt, docAllocLocalAmt } = calculateDocAllocAmounts(
      allocAmt,
      docExhRate,
      decimals
    )

    // iii. exhGainLoss = docAllocLocalAmt - allocLocalAmt
    const exhGainLoss = calculateExhGainLoss(
      docAllocLocalAmt,
      allocLocalAmt,
      decimals
    )

    return {
      ...detail,
      allocAmt: 0, // Ensure allocAmt is set to 0
      allocLocalAmt,
      docAllocAmt,
      docAllocLocalAmt,
      exhGainLoss,
    }
  })

  // iv. sum of allocAmt & allocLocalAmt
  const { sumAllocAmt, sumAllocLocalAmt } = calculateSumAllocationAmounts(
    updatedDetails,
    decimals
  )

  // v. sum of exhGainLoss
  const sumExhGainLoss = calculateSumExhGainLoss(updatedDetails, decimals)

  // 3. unAllocTotAmt = totAmt - allocAmtHd
  const unAllocTotAmt = calculateUnAllocTotAmt(totAmt, sumAllocAmt, decimals)

  // 3.1 unAllocTotLocalAmt = totLocalAmt - allocLocalAmtHd
  const unAllocTotLocalAmt = calculateUnAllocTotLocalAmt(
    totLocalAmt,
    sumAllocLocalAmt,
    decimals
  )

  return {
    totAmt,
    totLocalAmt,
    recTotAmt,
    recTotLocalAmt: newRecTotLocalAmt,
    updatedDetails,
    sumAllocAmt,
    sumAllocLocalAmt,
    sumExhGainLoss,
    unAllocTotAmt,
    unAllocTotLocalAmt,
  }
}

/**
 * Scenario G: Change the recCurrency && (currency != recCurrencyId)
 * => recTotAmt = totAmt * exhRate => 2.1 => 4 => 4.1 => pass all details allocAmt=0 => i=>ii=> iii => iv => v => 3 => 3.1
 */
export const handleScenarioG = (
  details: IArReceiptDt[],
  totAmt: number,
  exhRate: number,
  recExhRate: number,
  decimals: IDecimal
) => {
  // recTotAmt = totAmt * exhRate
  const recTotAmt = calculateTotLocalAmt(totAmt, exhRate, decimals)

  // 2.1 recTotLocalAmt = recTotAmt * recExhRate
  const recTotLocalAmt = calculateRecTotLocalAmt(
    recTotAmt,
    recExhRate,
    decimals
  )

  // 4. totAmt = recTotLocalAmt / exhRate
  const newTotAmt = calculateTotAmtFromRecTotLocalAmt(
    recTotLocalAmt,
    exhRate,
    decimals
  )

  // 4.1 totLocalAmt = recTotLocalAmt
  const totLocalAmt = calculateTotLocalAmtFromRecTotLocalAmt(recTotLocalAmt)

  // Process details with allocAmt=0: i => ii => iii
  const updatedDetails = details.map((detail) => {
    const allocAmt = 0 // Set allocAmt to 0 as per specification
    const docExhRate = Number(detail.docExhRate) || 1

    // i. allocLocalAmt = allocAmt * ExhRate
    const allocLocalAmt = calculateAllocLocalAmt(allocAmt, exhRate, decimals)

    // ii. docAllocAmt = allocAmt & docAllocLocalAmt = docAllocAmt * docExhRate
    const { docAllocAmt, docAllocLocalAmt } = calculateDocAllocAmounts(
      allocAmt,
      docExhRate,
      decimals
    )

    // iii. exhGainLoss = docAllocLocalAmt - allocLocalAmt
    const exhGainLoss = calculateExhGainLoss(
      docAllocLocalAmt,
      allocLocalAmt,
      decimals
    )

    return {
      ...detail,
      allocAmt: 0, // Ensure allocAmt is set to 0
      allocLocalAmt,
      docAllocAmt,
      docAllocLocalAmt,
      exhGainLoss,
    }
  })

  // iv. sum of allocAmt & allocLocalAmt
  const { sumAllocAmt, sumAllocLocalAmt } = calculateSumAllocationAmounts(
    updatedDetails,
    decimals
  )

  // v. sum of exhGainLoss
  const sumExhGainLoss = calculateSumExhGainLoss(updatedDetails, decimals)

  // 3. unAllocTotAmt = totAmt - allocAmtHd
  const unAllocTotAmt = calculateUnAllocTotAmt(newTotAmt, sumAllocAmt, decimals)

  // 3.1 unAllocTotLocalAmt = totLocalAmt - allocLocalAmtHd
  const unAllocTotLocalAmt = calculateUnAllocTotLocalAmt(
    totLocalAmt,
    sumAllocLocalAmt,
    decimals
  )

  return {
    totAmt: newTotAmt,
    totLocalAmt,
    recTotAmt,
    recTotLocalAmt,
    updatedDetails,
    sumAllocAmt,
    sumAllocLocalAmt,
    sumExhGainLoss,
    unAllocTotAmt,
    unAllocTotLocalAmt,
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const validateAllocation = (details: IArReceiptDt[]): boolean => {
  return details.length > 0
}
