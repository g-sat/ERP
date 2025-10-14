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
} from "@/helpers/cb-genpayment-calculations"
import { ICbGenPaymentDt } from "@/interfaces/cb-genpayment"
import {
  IBankLookup,
  ICurrencyLookup,
  IPaymentTypeLookup,
} from "@/interfaces/lookup"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  CbGenPaymentDtSchemaType,
  CbGenPaymentHdSchemaType,
} from "@/schemas/cb-genpayment"
import { useAuthStore } from "@/stores/auth-store"
import { FormProvider, UseFormReturn } from "react-hook-form"

import BankAutocomplete from "@/components/autocomplete/autocomplete-bank"
import ChartofAccountAutocomplete from "@/components/autocomplete/autocomplete-chartofaccount"
import CurrencyAutocomplete from "@/components/autocomplete/autocomplete-currency"
import PaymentTypeAutocomplete from "@/components/autocomplete/autocomplete-paymenttype"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import CustomInput from "@/components/custom/custom-input"
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomTextarea from "@/components/custom/custom-textarea"

interface PaymentFormProps {
  form: UseFormReturn<CbGenPaymentHdSchemaType>
  onSuccessAction: (action: string) => Promise<void>
  isEdit: boolean
  visible: IVisibleFields
  required: IMandatoryFields
  companyId: number
}

export default function PaymentForm({
  form,
  onSuccessAction,
  isEdit: _isEdit,
  visible,
  required,
  companyId: _companyId,
}: PaymentFormProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const ctyAmtDec = decimals[0]?.ctyAmtDec || 2
  const exhRateDec = decimals[0]?.exhRateDec || 6

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

  // Handle payment type selection
  const handlePaymentTypeChange = React.useCallback(
    (_selectedPaymentType: IPaymentTypeLookup | null) => {
      // Additional logic when payment type changes if needed
    },
    []
  )

  // Handle bank selection
  const handleBankChange = React.useCallback(
    (_selectedBank: IBankLookup | null) => {
      // Additional logic when bank changes if needed
    },
    []
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
      formDetails as unknown as ICbGenPaymentDt[],
      amtDec
    )
    form.setValue("totAmt", totals.totAmt)
    form.setValue("gstAmt", totals.gstAmt)
    form.setValue("totAmtAftGst", totals.totAmtAftGst)

    // Calculate local currency totals
    const localAmounts = calculateLocalAmounts(
      formDetails as unknown as ICbGenPaymentDt[],
      locAmtDec
    )
    form.setValue("totLocalAmt", localAmounts.totLocalAmt)
    form.setValue("gstLocalAmt", localAmounts.gstLocalAmt)
    form.setValue("totLocalAmtAftGst", localAmounts.totLocalAmtAftGst)

    // Calculate country currency totals
    const countryAmounts = calculateCountryAmounts(
      formDetails as unknown as ICbGenPaymentDt[],
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
          formDetails as unknown as ICbGenPaymentDt[],
          exchangeRate,
          cityExchangeRate,
          decimals[0],
          !!visible?.m_CtyCurr
        )

        form.setValue(
          "data_details",
          updatedDetails as unknown as CbGenPaymentDtSchemaType[],
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
        formDetails as unknown as ICbGenPaymentDt[],
        exchangeRate,
        cityExchangeRate,
        decimals[0],
        !!visible?.m_CtyCurr
      )

      form.setValue(
        "data_details",
        updatedDetails as unknown as CbGenPaymentDtSchemaType[],
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
        formDetails as unknown as ICbGenPaymentDt[],
        exchangeRate,
        cityExchangeRate,
        decimals[0],
        !!visible?.m_CtyCurr
      )

      form.setValue(
        "data_details",
        updatedDetails as unknown as CbGenPaymentDtSchemaType[],
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

        {/* Payment Type */}
        <PaymentTypeAutocomplete
          form={form}
          name="paymentTypeId"
          label="Payment Type"
          isRequired={true}
          onChangeEvent={handlePaymentTypeChange}
        />

        {/* Reference No */}
        <CustomInput
          form={form}
          name="referenceNo"
          label="Reference No."
          isRequired={required?.m_ReferenceNo}
        />

        {/* Bank */}
        {visible?.m_BankId && (
          <BankAutocomplete
            form={form}
            name="bankId"
            label="Bank"
            isRequired={required?.m_BankId}
            onChangeEvent={handleBankChange}
          />
        )}

        {/* Cheque No */}
        <CustomInput form={form} name="chequeNo" label="Cheque No." />

        {/* Cheque Date */}
        <CustomDateNew form={form} name="chequeDate" label="Cheque Date" />

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

        {/* Bank Charge GL */}
        <ChartofAccountAutocomplete
          form={form}
          name="bankChgGLId"
          label="Bank Charge GL"
        />

        {/* Bank Charge Amount */}
        <CustomNumberInput
          form={form}
          name="bankChgAmt"
          label="Bank Charge Amount"
          round={amtDec}
          className="text-right"
        />

        {/* Bank Charge Local Amount */}
        <CustomNumberInput
          form={form}
          name="bankChgLocalAmt"
          label="Bank Charge Local Amount"
          round={locAmtDec}
          className="text-right"
        />

        {/* GST Claim Date */}
        {visible?.m_GstClaimDate && (
          <CustomDateNew
            form={form}
            name="gstClaimDate"
            label="GST Claim Date"
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

        {/* Payee To */}
        <CustomInput
          form={form}
          name="payeeTo"
          label="Payee To"
          isRequired={true}
          className="col-span-2"
        />

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
