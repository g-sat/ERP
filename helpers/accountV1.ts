import { IDecimal } from "@/interfaces/auth"
import { IVisibleFields } from "@/interfaces/setting"
import { addDays, format, parse } from "date-fns"

import { getData } from "@/lib/api-client"
import { BasicSetting } from "@/lib/api-routes"
import { clientDateFormat } from "@/lib/date-utils"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HdForm = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DtRowData = any

export const mathRound = (amtValue: number, precision: number): number => {
  const factor = Math.pow(10, precision)
  return Math.round(amtValue * factor) / factor
}

export const calculateMultiplierAmount = (
  baseAmount: number,
  multiplier: number,
  precision: number
): number => {
  const total = baseAmount * multiplier
  const rounded = mathRound(total, precision)
  return Number(rounded)
}

export const calculateAdditionAmount = (
  baseAmount: number,
  additionamt: number,
  precision: number
): number => {
  const total = baseAmount + additionamt
  const rounded = mathRound(total, precision)
  return Number(rounded)
}

export const calculatePercentagecAmount = (
  baseAmount: number,
  percentage: number,
  precision: number
): number => {
  const total = (baseAmount * percentage) / 100
  const rounded = mathRound(total, precision)
  return Number(rounded)
}

export const calculateDivisionAmount = (
  baseAmount: number,
  divisor: number,
  precision: number
): number => {
  const total = baseAmount / divisor
  const rounded = mathRound(total, precision)
  return Number(rounded)
}

export const calculateSubtractionAmount = (
  baseAmount: number,
  subtractAmt: number,
  precision: number
): number => {
  const total = baseAmount - subtractAmt
  const rounded = mathRound(total, precision)
  return Number(rounded)
}

export const handleQtyChange = (
  hdForm: HdForm,
  rowData: DtRowData,
  decimals: IDecimal,
  visible: IVisibleFields,
  value: number
) => {
  const billQty = value
  const unitPrice = rowData?.unitPrice
  const exchangeRate = hdForm.getValues()?.exhRate
  if (billQty && unitPrice) {
    const totAmt = calculateMultiplierAmount(
      billQty,
      unitPrice,
      decimals?.amtDec
    )
    rowData.totAmt = totAmt
    if (exchangeRate) {
      handleTotalamountChange(hdForm, rowData, decimals, visible)
    }
  }
}

export const handleTotalamountChange = (
  hdForm: HdForm,
  rowData: DtRowData,
  decimals: IDecimal,
  visible: IVisibleFields
) => {
  const totAmt = rowData?.totAmt
  const exchangeRate = hdForm.getValues()?.exhRate

  if (exchangeRate) {
    const totLocalAmt = calculateMultiplierAmount(
      totAmt,
      exchangeRate,
      decimals?.locAmtDec
    )
    rowData.totLocalAmt = totLocalAmt

    handleTotalCityamountChange(hdForm, rowData, decimals, visible)

    if (totAmt) {
      handleGstPercentageChange(hdForm, rowData, decimals, visible)
    }
  }
}

export const handleGstPercentageChange = (
  hdForm: HdForm,
  rowData: DtRowData,
  decimals: IDecimal,
  visible: IVisibleFields
) => {
  const totAmt = rowData?.totAmt
  const gstRate = rowData?.gstPercentage

  if (totAmt) {
    const gstAmt = calculatePercentagecAmount(totAmt, gstRate, decimals?.amtDec)
    rowData.gstAmt = gstAmt

    const exchangeRate = hdForm.getValues()?.exhRate
    if (exchangeRate) {
      const gstLocalAmt = calculateMultiplierAmount(
        gstAmt,
        exchangeRate,
        decimals?.locAmtDec
      )
      rowData.gstLocalAmt = gstLocalAmt

      handleGstCityPercentageChange(hdForm, rowData, decimals, visible)
    }
  }
}

export const handleTotalCityamountChange = (
  hdForm: HdForm,
  rowData: DtRowData,
  decimals: IDecimal,
  visible: IVisibleFields
) => {
  const totAmt = rowData?.totAmt
  const exchangeRate = hdForm.getValues()?.exhRate
  const cityExchangeRate = hdForm.getValues()?.ctyExhRate
  let totCtyAmt = 0

  if (visible?.m_CtyCurr) {
    totCtyAmt = calculateMultiplierAmount(
      totAmt,
      cityExchangeRate,
      decimals?.locAmtDec
    )
  } else {
    totCtyAmt = calculateMultiplierAmount(
      totAmt,
      exchangeRate,
      decimals?.locAmtDec
    )
  }

  rowData.totCtyAmt = totCtyAmt
}

export const handleGstCityPercentageChange = (
  hdForm: HdForm,
  rowData: DtRowData,
  decimals: IDecimal,
  visible: IVisibleFields
) => {
  const gstAmt = rowData?.gstAmt
  const exchangeRate = hdForm.getValues()?.exhRate
  const cityExchangeRate = hdForm.getValues()?.ctyExhRate
  let gstCtyAmt = 0

  if (visible?.m_CtyCurr) {
    gstCtyAmt = calculateMultiplierAmount(
      gstAmt,
      cityExchangeRate,
      decimals?.locAmtDec
    )
  } else {
    gstCtyAmt = calculateMultiplierAmount(
      gstAmt,
      exchangeRate,
      decimals?.locAmtDec
    )
  }
  rowData.gstCtyAmt = gstCtyAmt
}

export const handleDetailsChange = (
  hdForm: HdForm,
  dtForm: HdForm,
  decimals: IDecimal
) => {
  const formData = hdForm.getValues()
  const detailsData = dtForm.getValues()

  if (detailsData.amount) {
    detailsData.localAmount = calculateMultiplierAmount(
      detailsData.amount,
      formData.exhRate,
      decimals?.locAmtDec
    )
  }

  if (detailsData.gstAmount) {
    detailsData.gstLocalAmount = calculateMultiplierAmount(
      detailsData.gstAmount,
      formData.exhRate,
      decimals?.locAmtDec
    )
  }

  if (formData.ctyExhRate && detailsData.amount) {
    detailsData.ctyAmount = calculateMultiplierAmount(
      detailsData.amount,
      formData.ctyExhRate,
      decimals?.ctyAmtDec
    )
  }

  if (formData.ctyExhRate && detailsData.gstAmount) {
    detailsData.gstCtyAmount = calculateMultiplierAmount(
      detailsData.gstAmount,
      formData.ctyExhRate,
      decimals?.ctyAmtDec
    )
  }
  dtForm.reset(detailsData)
}

export const setGSTPercentage = async (
  hdForm: HdForm,
  dtForm: HdForm,
  decimals: IDecimal,
  visible: IVisibleFields
) => {
  const { gstId } = dtForm?.getValues()
  const { accountDate } = hdForm?.getValues()

  if (accountDate && gstId) {
    try {
      const dt = format(
        parse(accountDate, clientDateFormat, new Date()),
        "yyyy-MM-dd"
      )

      const res = await getData(
        `${BasicSetting.getGstPercentage}/${gstId}/${dt}`
      )
      const gstPercentage = res?.data as number
      dtForm?.setValue("gstPercentage", gstPercentage)
      dtForm.trigger("gstPercentage")
      handleGstPercentageChange(hdForm, dtForm, decimals, visible)
    } catch (error) {
      console.error("Error fetching GST percentage:", error)
    }
  }
}

export const setDueDate = async (form: HdForm) => {
  const { accountDate, creditTermId, deliveryDate } = form?.getValues()

  if (deliveryDate && creditTermId) {
    try {
      const dt = format(
        parse(accountDate, clientDateFormat, new Date()),
        "yyyy-MM-dd"
      )
      const res = await getData(
        `${BasicSetting.getDaysfromCreditTerm}/${creditTermId}/${dt}`
      )

      const days = res?.data as number
      const dueDate = addDays(deliveryDate, days)

      form.setValue("dueDate", format(dueDate, clientDateFormat))
      form.trigger("dueDate")
    } catch {}
  }
}

export const setExchangeRate = async (
  form: HdForm,
  round: number | 6,
  visible: IVisibleFields
) => {
  const { accountDate, currencyId } = form?.getValues()
  if (accountDate && currencyId) {
    try {
      const dt = format(
        parse(accountDate, clientDateFormat, new Date()),
        "yyyy-MM-dd"
      )
      const res = await getData(
        `${BasicSetting.getExchangeRate}/${currencyId}/${dt}`
      )

      const exhRate = res?.data

      form.setValue("exhRate", +Number(exhRate).toFixed(round))
      if (!visible?.m_CtyCurr) {
        form.setValue("ctyExhRate", +Number(exhRate).toFixed(round))
        form.trigger("ctyExhRate")
      }
      form.trigger("exhRate")
    } catch {}
  }
}

export const setExchangeRateLocal = async (form: HdForm, round: number | 6) => {
  const { accountDate, currencyId } = form?.getValues()
  if (accountDate && currencyId) {
    try {
      const dt = format(
        parse(accountDate, clientDateFormat, new Date()),
        "yyyy-MM-dd"
      )
      const res = await getData(
        `${BasicSetting.getExchangeRateLocal}/${currencyId}/${dt}`
      )
      const exhRate = res?.data
      form.setValue("ctyExhRate", +Number(exhRate).toFixed(round))
      form.trigger("ctyExhRate")
    } catch {}
  }
}

export const setRecExchangeRate = async (form: HdForm, round: number | 6) => {
  const { accountDate, currencyId } = form?.getValues()
  if (accountDate && currencyId) {
    try {
      const dt = format(
        parse(accountDate, clientDateFormat, new Date()),
        "yyyy-MM-dd"
      )
      const res = await getData(
        `${BasicSetting.getExchangeRate}/${currencyId}/${dt}`
      )

      const exhRate = res?.data
      form.setValue("recExhRate", +Number(exhRate).toFixed(round))
      form.setValue("payExhRate", +Number(exhRate).toFixed(round))
    } catch {}
  }
}
