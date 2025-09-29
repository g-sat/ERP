import { IDecimal } from "@/interfaces/auth"
import { IVisibleFields } from "@/interfaces/setting"
import { ArInvoiceDtSchemaType, ArInvoiceHdSchemaType } from "@/schemas/invoice"
import { addDays, format, parse } from "date-fns"
import { UseFormReturn } from "react-hook-form"

import { getData } from "@/lib/api-client"
import { BasicSetting, Lookup } from "@/lib/api-routes"
import { clientDateFormat } from "@/lib/format"

export type Decimals = IDecimal

export const mathRound = (amtValue: number, precision: number): number => {
  const factor = Math.pow(10, precision)
  return Math.round(amtValue * factor) / factor
}

// General function to calculate multiplier amount and precision
export const calculateMultiplierAmount = (
  baseAmount: number,
  multiplier: number,
  precision: number
  // isMultiply?: boolean
): number => {
  // const total = isMultiply ? baseAmount * multiplier : baseAmount / multiplier;
  const total = baseAmount * multiplier
  const rounded = mathRound(total, precision)
  //const rounded = Math.round(total * Math.pow(10, precision)) / Math.pow(10, precision);
  return Number(rounded)
}

// General function to calculate addition amount and precision
export const calculateAdditionAmount = (
  baseAmount: number,
  additionamt: number,
  precision: number
): number => {
  const total = baseAmount + additionamt
  const rounded = mathRound(total, precision)
  //const rounded = Math.round(total * Math.pow(10, precision)) / Math.pow(10, precision);
  return Number(rounded)
}

// General function to calculate percentage amount and precision
export const calculatePercentagecAmount = (
  baseAmount: number,
  percentage: number,
  precision: number
): number => {
  const total = (baseAmount * percentage) / 100
  const rounded = mathRound(total, precision)
  return Number(rounded)
}

// General function to calculate division amount and precision
export const calculateDivisionAmount = (
  baseAmount: number,
  divisor: number,
  precision: number
): number => {
  const total = baseAmount / divisor
  const rounded = mathRound(total, precision)
  return Number(rounded)
}

// General function to calculate subtraction amount and precision
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
  hdForm: UseFormReturn<ArInvoiceHdSchemaType>,
  rowData: Partial<ArInvoiceDtSchemaType>,
  decimals: IDecimal,
  visible: IVisibleFields
) => {
  const billQty = rowData?.billQTY
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
  hdForm: any,
  rowData: any,
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
  hdForm: any,
  rowData: any,
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
  hdForm: any,
  rowData: any,
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
  hdForm: any,
  rowData: any,
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
  hdForm: any,
  dtForm: any,
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
  hdForm: any,
  dtForm: any,
  decimals: IDecimal,
  visible: IVisibleFields
) => {
  //
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
      console.log("res", res)
      const gstPercentage = res?.data as number
      dtForm?.setValue("gstPercentage", gstPercentage)
      dtForm.trigger("gstPercentage")
      handleGstPercentageChange(hdForm, dtForm, decimals, visible)
    } catch (error) {
      console.error("Error fetching GST percentage:", error)
    }
  }
}

export const setDueDate = async (form: any) => {
  //to set due date
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
  form: any,
  round: number | 2,
  visible: IVisibleFields
) => {
  // to set exhange rate
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
      console.log(form?.getValues())
    } catch {}
  }
}

export const setExchangeRateLocal = async (form: any, round: number | 2) => {
  // to set exhange rate
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

export const setRecExchangeRate = async (form: any, round: number | 2) => {
  // to set recving exhange rate for the receipt
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

export const setAddressContactDetails = async (form: any) => {
  const { customerId } = form?.getValues()

  if (customerId !== 0) {
    try {
      const addresses = await getData(
        `${Lookup.getCustomerAddress}/${customerId}`
      )
      const contacts = await getData(
        `${Lookup.getCustomerContact}/${customerId}`
      )

      if (addresses && addresses.length !== 0) {
        const data = addresses[0]

        await form.setValue("addressId", data?.addressId)
        await form.setValue("address1", data?.address1)
        await form.setValue("address2", data?.address2)
        await form.setValue("address3", data?.address3)
        await form.setValue("address4", data?.address4)
        await form.setValue("pinCode", data?.pinCode)
        await form.setValue("countryId", data?.countryId)
        await form.setValue("phoneNo", data?.phoneNo)

        await form?.trigger("addressId")
        await form?.trigger("address1")
        await form?.trigger("address2")
        await form?.trigger("address3")
        await form?.trigger("address4")
        await form?.trigger("pinCode")
        await form?.trigger("countryId")
        await form?.trigger("phoneNo")

        await form?.clearErrors()
      } else {
        await form.setValue("addressId", 0)
        await form.setValue("address1", "")
        await form.setValue("address2", "")
        await form.setValue("address3", "")
        await form.setValue("address4", "")
        await form.setValue("pinCode", "")
        await form.setValue("countryId", 0)
        await form.setValue("phoneNo", "")

        await form?.trigger("addressId")
        await form?.trigger("address1")
        await form?.trigger("address2")
        await form?.trigger("address3")
        await form?.trigger("address4")
        await form?.trigger("pinCode")
        await form?.trigger("countryId")
        await form?.trigger("phoneNo")

        await form?.clearErrors()
      }

      if (contacts && contacts.length !== 0) {
        const data = contacts[0]

        await form.setValue("contactId", data?.contactId)
        await form.setValue("contactName", data?.contactName)
        await form.setValue("mobileNo", data?.mobileNo)
        await form.setValue("emailAdd", data?.emailAdd)
        await form.setValue("faxNo", data?.faxNo)

        await form?.trigger("contactId")
        await form?.trigger("contactName")
        await form?.trigger("mobileNo")
        await form?.trigger("emailAdd")
        await form?.trigger("faxNo")

        await form?.clearErrors()
      } else {
        await form.setValue("contactId", 0)
        await form.setValue("contactName", "")
        await form.setValue("mobileNo", "")
        await form.setValue("emailAdd", "")
        await form.setValue("faxNo", "")

        await form?.trigger("contactId")
        await form?.trigger("contactName")
        await form?.trigger("mobileNo")
        await form?.trigger("emailAdd")
        await form?.trigger("faxNo")

        await form?.clearErrors()
      }
    } catch (error) {
      console.error("Error fetching customer address and contact", error)
    }
  }
  console.log({ values: form?.getValues() })
}
