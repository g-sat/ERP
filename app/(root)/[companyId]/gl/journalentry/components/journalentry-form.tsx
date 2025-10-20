"use client"

import * as React from "react"
import {
  setExchangeRate,
  setExchangeRateLocal,
  setGSTPercentage,
} from "@/helpers/account"
import {
  calculateCountryAmounts,
  calculateLocalAmounts,
  calculateTotalAmounts,
  recalculateAllDetailAmounts,
} from "@/helpers/gl-journalentry-calculations"
import { IGLJournalDt } from "@/interfaces/gl-journalentry"
import { ICurrencyLookup } from "@/interfaces/lookup"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  GLJournalDtSchemaType,
  GLJournalHdSchemaType,
} from "@/schemas/gl-journalentry"
import { useAuthStore } from "@/stores/auth-store"
import { FormProvider, UseFormReturn } from "react-hook-form"

import { CurrencyAutocomplete } from "@/components/autocomplete"
import CustomCheckbox from "@/components/custom/custom-checkbox"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import CustomInput from "@/components/custom/custom-input"
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomTextarea from "@/components/custom/custom-textarea"

interface JournalFormProps {
  form: UseFormReturn<GLJournalHdSchemaType>
  onSuccessAction: (action: string) => Promise<void>
  isEdit: boolean
  visible: IVisibleFields
  required: IMandatoryFields
  companyId: number
}

export default function JournalForm({
  form,
  onSuccessAction,
  isEdit: _isEdit,
  visible,
  required,
  companyId: _companyId,
}: JournalFormProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const ctyAmtDec = decimals[0]?.ctyAmtDec || 2
  const exhRateDec = decimals[0]?.exhRateDec || 6

  console.log("amtDec", amtDec)
  console.log("locAmtDec", locAmtDec)
  console.log("ctyAmtDec", ctyAmtDec)
  console.log("exhRateDec", exhRateDec)

  const onSubmit = async () => {
    await onSuccessAction("save")
  }

  // Handle transaction date selection
  const handleTrnDateChange = React.useCallback(
    async (_selectedTrnDate: Date | null) => {
      const { trnDate } = form?.getValues()
      form.setValue("gstClaimDate", trnDate)
      form?.trigger("gstClaimDate")
      form.setValue("accountDate", trnDate)
      form?.trigger("accountDate")
      await setExchangeRate(form, exhRateDec, visible)
      if (visible?.m_CtyCurr) {
        await setExchangeRateLocal(form, exhRateDec)
      }
      await setGSTPercentage(
        form,
        form.getValues("data_details"),
        decimals[0],
        visible
      )
    },
    [decimals, exhRateDec, form, visible]
  )

  // Handle account date change
  const handleAccountDateChange = React.useCallback(
    async (_selectedAccountDate: Date | null) => {
      const { accountDate } = form?.getValues()
      form.setValue("gstClaimDate", accountDate)
      form?.trigger("gstClaimDate")

      await setExchangeRate(form, exhRateDec, visible)
      if (visible?.m_CtyCurr) {
        await setExchangeRateLocal(form, exhRateDec)
      }
      await setGSTPercentage(
        form,
        form.getValues("data_details"),
        decimals[0],
        visible
      )
    },
    [decimals, exhRateDec, form, visible]
  )

  // Recalculate header totals from details
  const recalculateHeaderTotals = React.useCallback(() => {
    const formDetails = form.getValues("data_details") || []

    if (formDetails.length === 0) {
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

    // Calculate base currency totals
    const totals = calculateTotalAmounts(
      formDetails as unknown as IGLJournalDt[],
      amtDec
    )
    form.setValue("totAmt", totals.totAmt)
    form.setValue("gstAmt", totals.gstAmt)
    form.setValue("totAmtAftGst", totals.totAmtAftGst)

    // Calculate local currency totals
    const localAmounts = calculateLocalAmounts(
      formDetails as unknown as IGLJournalDt[],
      locAmtDec
    )
    form.setValue("totLocalAmt", localAmounts.totLocalAmt)
    form.setValue("gstLocalAmt", localAmounts.gstLocalAmt)
    form.setValue("totLocalAmtAftGst", localAmounts.totLocalAmtAftGst)

    // Calculate country currency totals
    const countryAmounts = calculateCountryAmounts(
      formDetails as unknown as IGLJournalDt[],
      visible?.m_CtyCurr ? ctyAmtDec : locAmtDec
    )
    form.setValue("totCtyAmt", countryAmounts.totCtyAmt)
    form.setValue("gstCtyAmt", countryAmounts.gstCtyAmt)
    form.setValue("totCtyAmtAftGst", countryAmounts.totCtyAmtAftGst)
  }, [amtDec, ctyAmtDec, form, locAmtDec, visible?.m_CtyCurr])

  // Handle currency selection
  const handleCurrencyChange = React.useCallback(
    async (selectedCurrency: ICurrencyLookup | null) => {
      const currencyId = selectedCurrency?.currencyId || 0
      const accountDate = form.getValues("accountDate")

      if (currencyId && accountDate) {
        await setExchangeRate(form, exhRateDec, visible)
        if (visible?.m_CtyCurr) {
          await setExchangeRateLocal(form, exhRateDec)
        }

        const formDetails = form.getValues("data_details")
        if (!formDetails || formDetails.length === 0) {
          return
        }

        const exchangeRate = form.getValues("exhRate") || 0
        const cityExchangeRate = form.getValues("ctyExhRate") || 0

        const updatedDetails = recalculateAllDetailAmounts(
          formDetails as unknown as IGLJournalDt[],
          exchangeRate,
          cityExchangeRate,
          decimals[0],
          !!visible?.m_CtyCurr
        )

        form.setValue(
          "data_details",
          updatedDetails as unknown as GLJournalDtSchemaType[],
          { shouldDirty: true, shouldTouch: true }
        )

        recalculateHeaderTotals()
      }
    },
    [decimals, exhRateDec, form, recalculateHeaderTotals, visible]
  )

  // Handle exchange rate change
  const handleExchangeRateChange = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const formDetails = form.getValues("data_details")
      const exchangeRate = parseFloat(e.target.value) || 0

      let cityExchangeRate = form.getValues("ctyExhRate") || 0
      if (!visible?.m_CtyCurr) {
        cityExchangeRate = exchangeRate
        form.setValue("ctyExhRate", exchangeRate)
      }

      if (!formDetails || formDetails.length === 0) {
        return
      }

      const updatedDetails = recalculateAllDetailAmounts(
        formDetails as unknown as IGLJournalDt[],
        exchangeRate,
        cityExchangeRate,
        decimals[0],
        !!visible?.m_CtyCurr
      )

      form.setValue(
        "data_details",
        updatedDetails as unknown as GLJournalDtSchemaType[],
        { shouldDirty: true, shouldTouch: true }
      )

      recalculateHeaderTotals()
    },
    [decimals, form, recalculateHeaderTotals, visible?.m_CtyCurr]
  )

  // Handle city exchange rate change
  const handleCityExchangeRateChange = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const formDetails = form.getValues("data_details")
      const exchangeRate = form.getValues("exhRate") || 0
      const cityExchangeRate = parseFloat(e.target.value) || 0

      if (!formDetails || formDetails.length === 0) {
        return
      }

      const updatedDetails = recalculateAllDetailAmounts(
        formDetails as unknown as IGLJournalDt[],
        exchangeRate,
        cityExchangeRate,
        decimals[0],
        !!visible?.m_CtyCurr
      )

      form.setValue(
        "data_details",
        updatedDetails as unknown as GLJournalDtSchemaType[],
        { shouldDirty: true, shouldTouch: true }
      )

      recalculateHeaderTotals()
    },
    [decimals, form, recalculateHeaderTotals, visible?.m_CtyCurr]
  )

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-7 gap-2 rounded-md p-2"
      >
        {/* Transaction Date */}
        {visible?.m_TrnDate && (
          <CustomDateNew
            form={form}
            name="trnDate"
            label="Transaction Date"
            isRequired={true}
            onChangeEvent={handleTrnDateChange}
          />
        )}

        {/* Account Date */}
        {visible?.m_AccountDate && (
          <CustomDateNew
            form={form}
            name="accountDate"
            label="Account Date"
            isRequired={true}
            onChangeEvent={handleAccountDateChange}
          />
        )}

        {/* Reference No */}
        <CustomInput
          form={form}
          name="referenceNo"
          label="Reference No."
          isRequired={required?.m_ReferenceNo}
        />

        {/* Currency */}
        <CurrencyAutocomplete
          form={form}
          name="currencyId"
          label="Currency"
          isRequired={true}
          onChangeEvent={handleCurrencyChange}
        />

        {/* Exchange Rate */}
        <CustomNumberInput
          form={form}
          name="exhRate"
          label="Exchange Rate"
          isRequired={true}
          round={exhRateDec}
          className="text-right"
          onBlurEvent={handleExchangeRateChange}
        />

        {visible?.m_CtyCurr && (
          <>
            {/* City Exchange Rate */}
            <CustomNumberInput
              form={form}
              name="ctyExhRate"
              label="City Exchange Rate"
              isRequired={true}
              round={exhRateDec}
              className="text-right"
              onBlurEvent={handleCityExchangeRateChange}
            />
          </>
        )}

        {/* GST Claim Date */}
        {visible?.m_GstClaimDate && (
          <CustomDateNew
            form={form}
            name="gstClaimDate"
            label="GST Claim Date"
            isRequired={false}
          />
        )}

        {/* Reverse Journal Entry Checkbox */}
        <CustomCheckbox
          form={form}
          name="isReverse"
          label="Reverse Entry"
          className="col-span-1"
        />

        {/* Reversal Date */}
        {form.watch("isReverse") && (
          <CustomDateNew
            form={form}
            name="revDate"
            label="Reversal Date"
            isRequired={false}
          />
        )}

        {/* Recurrency Checkbox */}
        <CustomCheckbox
          form={form}
          name="isRecurrency"
          label="Recurring Entry"
          className="col-span-1"
        />

        {/* Recurrence Until Date */}
        {form.watch("isRecurrency") && (
          <CustomDateNew
            form={form}
            name="recurrenceUntil"
            label="Recurrence Until"
            isRequired={false}
          />
        )}

        {/* Total Amount */}
        <CustomNumberInput
          form={form}
          name="totAmt"
          label="Total Amount"
          round={amtDec}
          isDisabled={true}
          className="text-right"
        />

        {/* GST Amount */}
        <CustomNumberInput
          form={form}
          name="gstAmt"
          label="GST Amount"
          round={amtDec}
          isDisabled={true}
          className="text-right"
        />

        {/* Total Amount After GST */}
        <CustomNumberInput
          form={form}
          name="totAmtAftGst"
          label="Total Amount After GST"
          round={amtDec}
          isDisabled={true}
          className="text-right"
        />

        {/* Total Local Amount */}
        <CustomNumberInput
          form={form}
          name="totLocalAmt"
          label="Total Local Amount"
          round={locAmtDec}
          isDisabled={true}
          className="text-right"
        />

        {/* GST Local Amount */}
        <CustomNumberInput
          form={form}
          name="gstLocalAmt"
          label="GST Local Amt"
          round={locAmtDec}
          isDisabled={true}
          className="text-right"
        />

        {/* Total Local Amount After GST */}
        <CustomNumberInput
          form={form}
          name="totLocalAmtAftGst"
          label="Total Local Amount After GST"
          round={locAmtDec}
          isDisabled={true}
          className="text-right"
        />

        {visible?.m_CtyCurr && (
          <>
            {/* Total Country Amount */}
            <CustomNumberInput
              form={form}
              name="totCtyAmt"
              label="Total Country Amount"
              round={ctyAmtDec}
              isDisabled={true}
              className="text-right"
            />

            {/* GST Country Amount */}
            <CustomNumberInput
              form={form}
              name="gstCtyAmt"
              label="GST Country Amount"
              isDisabled={true}
              round={ctyAmtDec}
              className="text-right"
            />

            {/* Total Country Amount After GST */}
            <CustomNumberInput
              form={form}
              name="totCtyAmtAftGst"
              label="Total Country Amount After GST"
              isDisabled={true}
              round={ctyAmtDec}
              className="text-right"
            />
          </>
        )}

        {/* Remarks */}
        <CustomTextarea
          form={form}
          name="remarks"
          label="Remarks"
          isRequired={required?.m_Remarks_Hd}
          className="col-span-2"
        />
      </form>
    </FormProvider>
  )
}
