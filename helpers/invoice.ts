import { calculateMultiplierAmount } from "./account"

export const handleInvoiceDetailsUpdate = (
  hdForm: any,
  dtForm: any,
  decimals: any
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

export const calculateInvoice = (
  form: any,
  data: any[],
  invoice: any | null,
  decimals: any
) => {
  const { ctyExhRate, exhRate, data_details } = form?.getValues()
  const newInvoice: any[] = []

  data?.map((inv: any) => {
    newInvoice.push({
      ...inv,
      gstCtyAmt: +Number(inv.gstAmt * ctyExhRate).toFixed(decimals?.amtDec),
      gstLocalAmt: +Number(inv.gstAmt * exhRate).toFixed(decimals?.locAmtDec),
      totLocalAmt: +Number(inv.totAmt * exhRate).toFixed(decimals?.locAmtDec),
      totCtyAmt: +Number(inv.totAmt * ctyExhRate).toFixed(decimals?.ctyAmtDec),
    })
  })

  const totals = toGetInvoiceDetailsSum(newInvoice, decimals)

  form.setValue("data_details", newInvoice)
  form.setValue("gstLocalAmt", totals?.gstLocalAmt)
  form.setValue("gstCtyAmt", totals?.gstCtyAmt)
  form.setValue("totLocalAmt", totals?.totLocalAmt)
  form.setValue("totCtyAmt", totals?.totCtyAmt)
  form.setValue("totAmt", totals?.totAmt)
  form.setValue("gstAmt", totals?.gstAmt)
  form.setValue(
    "totAmtAftGst",
    +Number(totals?.totAmt + totals?.gstAmt).toFixed(decimals?.amtDec)
  )
  form.setValue(
    "totLocalAmtAftGst",
    +Number(totals?.gstLocalAmt + totals?.totLocalAmt).toFixed(
      decimals?.locAmtDec
    )
  )
  form.setValue(
    "totCtyAmtAftGst",
    +Number(totals?.gstCtyAmt + totals?.totCtyAmt).toFixed(decimals?.ctyAmtDec)
  )

  if (!invoice && data_details.length === 0) {
  } else {
    form.trigger()
  }
}

export const toGetInvoiceDetailsSum = (
  invoices: any[],
  decimals: any | undefined
) => {
  let gstLocalAmt = 0
  let gstCtyAmt = 0
  let totLocalAmt = 0
  let totCtyAmt = 0
  let totAmt = 0
  let gstAmt = 0

  invoices.forEach((item: any) => {
    gstLocalAmt += item.gstLocalAmt
    gstCtyAmt += item.gstCtyAmt
    totLocalAmt += item.totLocalAmt
    totCtyAmt += item.totCtyAmt
    totAmt += item.totAmt
    gstAmt += item.gstAmt
  })

  return {
    gstLocalAmt: +Number(gstLocalAmt).toFixed(decimals?.locAmtDec),
    gstCtyAmt: +Number(gstCtyAmt).toFixed(decimals?.ctyAmtDec),
    totLocalAmt: +Number(totLocalAmt).toFixed(decimals?.locAmtDec),
    totCtyAmt: +Number(totCtyAmt).toFixed(decimals?.ctyAmtDec),
    totAmt: +Number(totAmt).toFixed(decimals?.amtDec),
    gstAmt: +Number(gstAmt).toFixed(decimals?.amtDec),
  }
}
