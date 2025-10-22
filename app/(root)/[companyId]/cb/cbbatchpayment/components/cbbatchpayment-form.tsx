"use client"

import * as React from "react"
import { setExchangeRate, setExchangeRateLocal } from "@/helpers/account"
import {
  calculateCountryAmounts,
  calculateLocalAmounts,
  calculateTotalAmounts,
  recalculateAllDetailAmounts,
} from "@/helpers/cb-batchpayment-calculations"
import { ICbBatchPaymentDt } from "@/interfaces"
import { IBankLookup, ICurrencyLookup } from "@/interfaces/lookup"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  CbBatchPaymentDtSchemaType,
  CbBatchPaymentHdSchemaType,
} from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { FormProvider, UseFormReturn } from "react-hook-form"

import {
  BankAutocomplete,
  CurrencyAutocomplete,
} from "@/components/autocomplete"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import CustomInput from "@/components/custom/custom-input"
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomTextarea from "@/components/custom/custom-textarea"

interface BatchPaymentFormProps {
  form: UseFormReturn<CbBatchPaymentHdSchemaType>
  onSuccessAction: (action: string) => Promise<void>
  isEdit: boolean
  visible: IVisibleFields
  required: IMandatoryFields
  companyId: number
  defaultCurrencyId?: number
}

export default function BatchPaymentForm({
  form,
  onSuccessAction,
  isEdit: _isEdit,
  visible,
  required,
  companyId: _companyId,
  defaultCurrencyId = 0,
}: BatchPaymentFormProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const ctyAmtDec = decimals[0]?.ctyAmtDec || 2
  const exhRateDec = decimals[0]?.exhRateDec || 6

  // Set default currency when form is initialized (not in edit mode)
  React.useEffect(() => {
    if (!_isEdit && defaultCurrencyId > 0) {
      const currentCurrencyId = form.getValues("currencyId")

      // Only set default if no currency is set
      if (!currentCurrencyId || currentCurrencyId === 0) {
        form.setValue("currencyId", defaultCurrencyId)
        // Trigger exchange rate fetch when default currency is set
        setExchangeRate(form, exhRateDec, visible)
        if (visible?.m_CtyCurr) {
          setExchangeRateLocal(form, exhRateDec)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCurrencyId, _isEdit])

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
      // Note: GST percentage is handled at detail level in CB modules
    },
    [exhRateDec, form, visible]
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
      // Note: GST percentage is handled at detail level in CB modules
    },
    [exhRateDec, form, visible]
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
      formDetails as unknown as ICbBatchPaymentDt[],
      amtDec
    )
    form.setValue("totAmt", totals.totAmt)
    form.setValue("gstAmt", totals.gstAmt)
    form.setValue("totAmtAftGst", totals.totAmtAftGst)

    // Calculate local currency totals
    const localAmounts = calculateLocalAmounts(
      formDetails as unknown as ICbBatchPaymentDt[],
      locAmtDec
    )
    form.setValue("totLocalAmt", localAmounts.totLocalAmt)
    form.setValue("gstLocalAmt", localAmounts.gstLocalAmt)
    form.setValue("totLocalAmtAftGst", localAmounts.totLocalAmtAftGst)

    // Calculate country currency totals
    const countryAmounts = calculateCountryAmounts(
      formDetails as unknown as ICbBatchPaymentDt[],
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
          formDetails as unknown as ICbBatchPaymentDt[],
          exchangeRate,
          cityExchangeRate,
          decimals[0],
          !!visible?.m_CtyCurr
        )

        form.setValue(
          "data_details",
          updatedDetails as unknown as CbBatchPaymentDtSchemaType[],
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
        formDetails as unknown as ICbBatchPaymentDt[],
        exchangeRate,
        cityExchangeRate,
        decimals[0],
        !!visible?.m_CtyCurr
      )

      form.setValue(
        "data_details",
        updatedDetails as unknown as CbBatchPaymentDtSchemaType[],
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
        formDetails as unknown as ICbBatchPaymentDt[],
        exchangeRate,
        cityExchangeRate,
        decimals[0],
        !!visible?.m_CtyCurr
      )

      form.setValue(
        "data_details",
        updatedDetails as unknown as CbBatchPaymentDtSchemaType[],
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
        className="grid grid-cols-12 rounded-md p-2"
      >
        <div className="col-span-10 grid grid-cols-6 gap-2">
          {/* Transaction Date */}
          {visible?.m_TrnDate && (
            <CustomDateNew
              form={form}
              name="trnDate"
              label="Transaction Date"
              isRequired={true}
              onChangeEvent={handleTrnDateChange}
              isFutureShow={false}
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
              isFutureShow={false}
            />
          )}

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
              isFutureShow={true}
            />
          )}

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
        </div>

        {/* Summary Box */}
        {/* Right Section: Summary Box */}
        <div className="col-span-2 ml-2 flex flex-col justify-start">
          <div className="w-full rounded-md border border-blue-200 bg-blue-50 p-3 shadow-sm">
            {/* Header Row */}
            <div className="mb-2 grid grid-cols-3 gap-x-4 border-b border-blue-300 pb-2 text-sm">
              <div className="text-right font-bold text-blue-800">Trns</div>
              <div className="text-center"></div>
              <div className="text-right font-bold text-blue-800">Local</div>
            </div>

            {/* 3-column grid: [Amt] [Label] [Local] */}
            <div className="grid grid-cols-3 gap-x-4 text-sm">
              {/* Column 1: Foreign Amounts (Amt) */}
              <div className="space-y-1 text-right">
                <div className="font-medium text-gray-700">
                  {(form.watch("totAmt") || 0).toLocaleString(undefined, {
                    minimumFractionDigits: amtDec,
                    maximumFractionDigits: amtDec,
                  })}
                </div>
                <div className="font-medium text-gray-700">
                  {(form.watch("gstAmt") || 0).toLocaleString(undefined, {
                    minimumFractionDigits: amtDec,
                    maximumFractionDigits: amtDec,
                  })}
                </div>
                <hr className="my-1 border-blue-300" />
                <div className="font-bold text-blue-900">
                  {(form.watch("totAmtAftGst") || 0).toLocaleString(undefined, {
                    minimumFractionDigits: amtDec,
                    maximumFractionDigits: amtDec,
                  })}
                </div>
              </div>

              {/* Column 2: Labels */}
              <div className="space-y-1 text-center">
                <div className="font-medium text-blue-600">Amt</div>
                <div className="font-medium text-blue-600">Gst</div>
                <div></div>
                <div className="font-bold text-blue-800">Total</div>
              </div>

              {/* Column 3: Local Amounts */}
              <div className="space-y-1 text-right">
                <div className="font-medium text-gray-700">
                  {(form.watch("totLocalAmt") || 0).toLocaleString(undefined, {
                    minimumFractionDigits: locAmtDec,
                    maximumFractionDigits: locAmtDec,
                  })}
                </div>
                <div className="font-medium text-gray-700">
                  {(form.watch("gstLocalAmt") || 0).toLocaleString(undefined, {
                    minimumFractionDigits: locAmtDec,
                    maximumFractionDigits: locAmtDec,
                  })}
                </div>
                <hr className="my-1 border-blue-300" />
                <div className="font-bold text-blue-900">
                  {(form.watch("totLocalAmtAftGst") || 0).toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: locAmtDec,
                      maximumFractionDigits: locAmtDec,
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
