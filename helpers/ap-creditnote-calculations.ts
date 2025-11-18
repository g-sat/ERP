import {
  calculateAdditionAmount,
  calculateMultiplierAmount,
} from "@/helpers/account"
import { IApCreditNoteDt, IDecimal } from "@/interfaces"
import { IVisibleFields } from "@/interfaces/setting"
import { UseFormReturn } from "react-hook-form"

export const calculateTotalAmounts = (
  details: IApCreditNoteDt[],
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

export const calculateLocalAmounts = (
  details: IApCreditNoteDt[],
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

export const calculateCtyAmounts = (
  details: IApCreditNoteDt[],
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

export const calculateLocalAmount = (
  totAmt: number,
  exchangeRate: number,
  decimals: IDecimal
) => {
  return calculateMultiplierAmount(totAmt, exchangeRate, decimals.locAmtDec)
}

export const calculateCtyAmount = (
  totAmt: number,
  cityExchangeRate: number,
  decimals: IDecimal
) => {
  return calculateMultiplierAmount(totAmt, cityExchangeRate, decimals.ctyAmtDec)
}

export const recalculateDetailAmounts = (
  detail: IApCreditNoteDt,
  exchangeRate: number,
  cityExchangeRate: number,
  decimals: IDecimal,
  hasCountryCurrency: boolean
) => {
  const totAmt = detail.totAmt || 0
  // Preserve existing gstAmt instead of recalculating from percentage
  const gstAmt = detail.gstAmt || 0

  // Calculate local amounts
  const totLocalAmt = calculateLocalAmount(totAmt, exchangeRate, decimals)
  const gstLocalAmt = calculateLocalAmount(gstAmt, exchangeRate, decimals)

  // Calculate country amounts if enabled
  let totCtyAmt = 0
  let gstCtyAmt = 0
  if (hasCountryCurrency) {
    totCtyAmt = calculateCtyAmount(totAmt, cityExchangeRate, decimals)
    gstCtyAmt = calculateCtyAmount(gstAmt, cityExchangeRate, decimals)
  } else {
    // If m_CtyCurr is false, city amounts = local amounts
    totCtyAmt = totLocalAmt
    gstCtyAmt = gstLocalAmt
  }

  return {
    ...detail,
    gstAmt, // Preserve existing gstAmt
    totLocalAmt,
    gstLocalAmt,
    totCtyAmt,
    gstCtyAmt,
  }
}

export const recalculateAllDetailsLocalAndCtyAmounts = (
  details: IApCreditNoteDt[],
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

export const recalculateDetailFormAmounts = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dtForm: UseFormReturn<any>, // Generic form type for reusability
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hdForm: UseFormReturn<any>, // Generic form type for reusability
  decimals: IDecimal,
  visible: IVisibleFields,
  exchangeRate?: number,
  cityExchangeRate?: number
) => {
  // Use provided exchange rates or read from form
  const currentExchangeRate =
    exchangeRate !== undefined ? exchangeRate : hdForm.getValues("exhRate") || 0
  const currentCityExchangeRate =
    cityExchangeRate !== undefined
      ? cityExchangeRate
      : hdForm.getValues("ctyExhRate") || 0

  const currentValues = dtForm.getValues()
  const totAmt = currentValues.totAmt || 0
  const gstAmt = currentValues.gstAmt || 0

  // Always recalculate if exchange rate is valid (even if totAmt is 0, we should update local amounts to 0)
  if (currentExchangeRate > 0) {
    // Ensure cityExchangeRate = exchangeRate if m_CtyCurr is false
    const exchangeRateValue = currentExchangeRate
    if (!visible?.m_CtyCurr) {
      hdForm.setValue("ctyExhRate", exchangeRateValue)
    }

    // Recalculate total local amount (preserve existing totAmt)
    const totLocalAmt = calculateMultiplierAmount(
      totAmt,
      exchangeRateValue,
      decimals?.locAmtDec || 2
    )

    // Recalculate total city amount
    const cityExchangeRateValue = visible?.m_CtyCurr
      ? currentCityExchangeRate
      : exchangeRateValue
    let totCtyAmt = 0
    if (visible?.m_CtyCurr) {
      totCtyAmt = calculateMultiplierAmount(
        totAmt,
        cityExchangeRateValue,
        decimals?.ctyAmtDec || 2
      )
    } else {
      totCtyAmt = totLocalAmt
    }

    // Recalculate GST local amount (preserve existing gstAmt, don't recalculate from percentage)
    const gstLocalAmt = calculateMultiplierAmount(
      gstAmt,
      exchangeRateValue,
      decimals?.locAmtDec || 2
    )

    // Recalculate GST city amount
    let gstCtyAmt = 0
    if (visible?.m_CtyCurr) {
      gstCtyAmt = calculateMultiplierAmount(
        gstAmt,
        cityExchangeRateValue,
        decimals?.ctyAmtDec || 2
      )
    } else {
      gstCtyAmt = gstLocalAmt
    }

    // Update form with recalculated local and city amounts
    dtForm.setValue("totLocalAmt", totLocalAmt, {
      shouldValidate: false,
      shouldDirty: true,
    })
    dtForm.setValue("totCtyAmt", totCtyAmt, {
      shouldValidate: false,
      shouldDirty: true,
    })
    dtForm.setValue("gstLocalAmt", gstLocalAmt, {
      shouldValidate: false,
      shouldDirty: true,
    })
    dtForm.setValue("gstCtyAmt", gstCtyAmt, {
      shouldValidate: false,
      shouldDirty: true,
    })

    // Trigger form update to ensure UI reflects changes
    dtForm.trigger(["totLocalAmt", "totCtyAmt", "gstLocalAmt", "gstCtyAmt"])

    return {
      totLocalAmt,
      totCtyAmt,
      gstLocalAmt,
      gstCtyAmt,
    }
  }

  return null
}

export const recalculateAndSetHeaderTotals = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>,
  details: IApCreditNoteDt[],
  decimals: IDecimal,
  visible: IVisibleFields
) => {
  if (details.length === 0) {
    // Reset all amounts to 0 if no details
    form.setValue("totAmt", 0)
    form.setValue("gstAmt", 0)
    form.setValue("totAmtAftGst", 0)
    form.setValue("totLocalAmt", 0)
    form.setValue("gstLocalAmt", 0)
    form.setValue("totLocalAmtAftGst", 0)
    if (visible?.m_CtyCurr) {
      form.setValue("totCtyAmt", 0)
      form.setValue("gstCtyAmt", 0)
      form.setValue("totCtyAmtAftGst", 0)
    }
    return
  }

  const amtDec = decimals?.amtDec || 2
  const locAmtDec = decimals?.locAmtDec || 2
  const ctyAmtDec = decimals?.ctyAmtDec || 2

  // Calculate base currency totals
  const totals = calculateTotalAmounts(details, amtDec)
  form.setValue("totAmt", totals.totAmt)
  form.setValue("gstAmt", totals.gstAmt)
  form.setValue("totAmtAftGst", totals.totAmtAftGst)

  // Calculate local currency totals (always calculate)
  const localAmounts = calculateLocalAmounts(details, locAmtDec)
  form.setValue("totLocalAmt", localAmounts.totLocalAmt)
  form.setValue("gstLocalAmt", localAmounts.gstLocalAmt)
  form.setValue("totLocalAmtAftGst", localAmounts.totLocalAmtAftGst)

  // Calculate country currency totals (always calculate)
  // If m_CtyCurr is false, country amounts = local amounts
  const countryAmounts = calculateCtyAmounts(
    details,
    visible?.m_CtyCurr ? ctyAmtDec : locAmtDec
  )
  form.setValue("totCtyAmt", countryAmounts.totCtyAmt)
  form.setValue("gstCtyAmt", countryAmounts.gstCtyAmt)
  form.setValue("totCtyAmtAftGst", countryAmounts.totCtyAmtAftGst)
}

export const syncCityExchangeRate = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hdForm: UseFormReturn<any>,
  exchangeRate: number,
  visible: IVisibleFields
): number => {
  if (!visible?.m_CtyCurr) {
    hdForm.setValue("ctyExhRate", exchangeRate)
    return exchangeRate
  }
  return hdForm.getValues("ctyExhRate") || exchangeRate
}

export const calculateGstLocalAndCtyAmounts = (
  gstAmt: number,
  exchangeRate: number,
  cityExchangeRate: number,
  decimals: IDecimal,
  visible: IVisibleFields
) => {
  // Calculate GST local amount
  const gstLocalAmt = calculateMultiplierAmount(
    gstAmt,
    exchangeRate,
    decimals?.locAmtDec || 2
  )

  // Calculate GST city amount
  let gstCtyAmt = 0
  if (visible?.m_CtyCurr) {
    gstCtyAmt = calculateMultiplierAmount(
      gstAmt,
      cityExchangeRate,
      decimals?.ctyAmtDec || 2
    )
  } else {
    gstCtyAmt = gstLocalAmt
  }

  return {
    gstLocalAmt,
    gstCtyAmt,
  }
}
