import {
  calculateAdditionAmount,
  calculateMultiplierAmount,
} from "@/helpers/account"
import { IArDebitNoteDt, IDecimal } from "@/interfaces"
import { IVisibleFields } from "@/interfaces/setting"
import { UseFormReturn } from "react-hook-form"

//used for cloning invoice & recalculateAndSetHeaderTotals invoice function
export const calculateTotalAmounts = (
  details: IArDebitNoteDt[],
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

//used for cloning invoice & recalculateAndSetHeaderTotals invoice function
export const calculateLocalAmounts = (
  details: IArDebitNoteDt[],
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

//used for cloning invoice & recalculateAndSetHeaderTotals invoice function
export const calculateCtyAmounts = (
  details: IArDebitNoteDt[],
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

//used for cloning invoice & recalculateAndSetHeaderTotals invoice function
export const calculateLocalAmount = (
  totAmt: number,
  exchangeRate: number,
  decimals: IDecimal
) => {
  return calculateMultiplierAmount(totAmt, exchangeRate, decimals.locAmtDec)
}

//used for cloning invoice & recalculateAndSetHeaderTotals invoice function
export const calculateCtyAmount = (
  totAmt: number,
  countryExchangeRate: number,
  decimals: IDecimal
) => {
  return calculateMultiplierAmount(
    totAmt,
    countryExchangeRate,
    decimals.ctyAmtDec
  )
}

export const recalculateDetailLocalAndCtyAmounts = (
  detail: IArDebitNoteDt,
  exchangeRate: number,
  countryExchangeRate: number,
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
    totCtyAmt = calculateCtyAmount(totAmt, countryExchangeRate, decimals)
    gstCtyAmt = calculateCtyAmount(gstAmt, countryExchangeRate, decimals)
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
  details: IArDebitNoteDt[],
  exchangeRate: number,
  countryExchangeRate: number,
  decimals: IDecimal,
  hasCountryCurrency: boolean
) => {
  return details.map((detail) =>
    recalculateDetailLocalAndCtyAmounts(
      detail,
      exchangeRate,
      countryExchangeRate,
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
  countryExchangeRate?: number
) => {
  // Use provided exchange rates or read from form
  const currentExchangeRate =
    exchangeRate !== undefined ? exchangeRate : hdForm.getValues("exhRate") || 0

  // Always recalculate if exchange rate is valid (even if totAmt is 0, we should update local amounts to 0)
  if (currentExchangeRate > 0) {
    // Use provided countryExchangeRate if available, otherwise sync with exchange rate
    let finalCountryExchangeRate: number
    if (countryExchangeRate !== undefined && visible?.m_CtyCurr) {
      finalCountryExchangeRate = countryExchangeRate
    } else {
      // Sync city exchange rate with exchange rate if needed
      finalCountryExchangeRate = syncCountryExchangeRate(
        hdForm,
        currentExchangeRate,
        visible
      )
    }

    // Get current form values
    const currentValues = dtForm.getValues()
    const detail: IArDebitNoteDt = {
      ...currentValues,
      totAmt: currentValues.totAmt || 0,
      gstAmt: currentValues.gstAmt || 0,
    }

    // Recalculate local and city amounts using the shared function
    const recalculatedDetail = recalculateDetailLocalAndCtyAmounts(
      detail,
      currentExchangeRate,
      finalCountryExchangeRate,
      decimals,
      !!visible?.m_CtyCurr
    )

    // Update form with recalculated local and city amounts
    dtForm.setValue("totLocalAmt", recalculatedDetail.totLocalAmt, {
      shouldValidate: false,
      shouldDirty: true,
    })
    dtForm.setValue("totCtyAmt", recalculatedDetail.totCtyAmt, {
      shouldValidate: false,
      shouldDirty: true,
    })
    dtForm.setValue("gstLocalAmt", recalculatedDetail.gstLocalAmt, {
      shouldValidate: false,
      shouldDirty: true,
    })
    dtForm.setValue("gstCtyAmt", recalculatedDetail.gstCtyAmt, {
      shouldValidate: false,
      shouldDirty: true,
    })

    // Trigger form update to ensure UI reflects changes
    dtForm.trigger(["totLocalAmt", "totCtyAmt", "gstLocalAmt", "gstCtyAmt"])

    return {
      totLocalAmt: recalculatedDetail.totLocalAmt,
      totCtyAmt: recalculatedDetail.totCtyAmt,
      gstLocalAmt: recalculatedDetail.gstLocalAmt,
      gstCtyAmt: recalculatedDetail.gstCtyAmt,
    }
  }

  return null
}

//recalculate and set header totals on invoice form
export const recalculateAndSetHeaderTotals = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>,
  details: IArDebitNoteDt[],
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

//sync city exchange rate with exchange rate if needed
export const syncCountryExchangeRate = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>,
  exchangeRate: number,
  visible: IVisibleFields
): number => {
  if (!visible?.m_CtyCurr) {
    form.setValue("ctyExhRate", exchangeRate)
    return exchangeRate
  }
  return form.getValues("ctyExhRate") || exchangeRate
}

//calculate GST local and cty amounts on detail form
export const calculateGstLocalAndCtyAmounts = (
  gstAmt: number,
  exchangeRate: number,
  countryExchangeRate: number,
  decimals: IDecimal,
  visible: IVisibleFields
) => {
  // Only calculate GST if visible?.m_GstId is true
  if (!visible?.m_GstId) {
    return {
      gstLocalAmt: 0,
      gstCtyAmt: 0,
    }
  }

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
      countryExchangeRate,
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
