"use client"

import * as React from "react"
import {
  handleTotalamountChange,
  setAddressContactDetails,
  setDueDate,
  setExchangeRate,
  setExchangeRateLocal,
  setGSTPercentage,
} from "@/helpers/account"
import { calculateInvoice } from "@/helpers/invoice"
import {
  IInvoiceDetail,
  calculateCountryAmounts,
  calculateLocalAmounts,
  calculateTotalAmounts,
  recalculateAllDetailAmounts,
} from "@/helpers/invoice-calculations"
import {
  IBankLookup,
  ICreditTermLookup,
  ICurrencyLookup,
  ICustomerLookup,
} from "@/interfaces/lookup"
import { IVisibleFields } from "@/interfaces/setting"
import { ArInvoiceDtSchemaType, ArInvoiceHdSchemaType } from "@/schemas/invoice"
import { useAuthStore } from "@/stores/auth-store"
import { FormProvider, UseFormReturn } from "react-hook-form"

import BankAutocomplete from "@/components/autocomplete/autocomplete-bank"
import CreditTermAutocomplete from "@/components/autocomplete/autocomplete-creditterm"
import CurrencyAutocomplete from "@/components/autocomplete/autocomplete-currency"
import CustomerAutocomplete from "@/components/autocomplete/autocomplete-customer"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import CustomInput from "@/components/custom/custom-input"
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomTextarea from "@/components/custom/custom-textarea"

interface InvoiceFormProps {
  form: UseFormReturn<ArInvoiceHdSchemaType>
  onSuccess: (action: string) => Promise<void>
  isEdit: boolean
  visible: IVisibleFields
}

export default function InvoiceForm({
  form,
  onSuccess,
  isEdit,
  visible,
}: InvoiceFormProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const ctyAmtDec = decimals[0]?.ctyAmtDec || 2
  const exhRateDec = decimals[0]?.exhRateDec || 6
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"

  const onSubmit = async () => {
    await onSuccess("save")
  }

  // Handle transaction date selection
  const handleTrnDateChange = React.useCallback(
    async (selectedTrnDate: Date | null) => {
      // Additional logic when transaction date changes
      console.log("Selected transaction date:", selectedTrnDate)
      const { trnDate } = form?.getValues()
      form.setValue("gstClaimDate", trnDate)
      form?.trigger("gstClaimDate")
      form.setValue("accountDate", trnDate)
      form.setValue("deliveryDate", trnDate)
      form?.trigger("accountDate")
      form?.trigger("deliveryDate")
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
      await setDueDate(form)
    },
    [decimals, exhRateDec, form, visible]
  )

  // Handle customer selection
  const handleCustomerChange = React.useCallback(
    async (selectedCustomer: ICustomerLookup | null) => {
      // Additional logic when customer changes
      console.log("Selected customer:", selectedCustomer)
      if (!isEdit) {
        form.setValue("currencyId", selectedCustomer?.currencyId || 0)
        form.setValue("creditTermId", selectedCustomer?.creditTermId || 0)
        form.setValue("bankId", selectedCustomer?.bankId || 0)
        form.setValue("currencyId", selectedCustomer?.currencyId || 0)
      }

      await setDueDate(form)
      await setExchangeRate(form, exhRateDec, visible)
      await setExchangeRateLocal(form, exhRateDec)
      await setAddressContactDetails(form)
    },
    [exhRateDec, form, isEdit, visible]
  )

  // Handle transaction date selection
  const handleAccountDateChange = React.useCallback(
    async (selectedAccountDate: Date | null) => {
      // Additional logic when transaction date changes
      console.log("Selected transaction date:", selectedAccountDate)
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
      await setDueDate(form)
    },
    [decimals, exhRateDec, form, visible]
  )

  // Handle credit term selection
  const handleCreditTermChange = React.useCallback(
    (selectedCreditTerm: ICreditTermLookup | null) => {
      // Additional logic when credit term changes
      console.log("Selected credit term:", selectedCreditTerm)
      setDueDate(form)
    },
    [form]
  )

  // Handle bank selection
  const handleBankChange = React.useCallback(
    (selectedBank: IBankLookup | null) => {
      // Additional logic when bank changes
      console.log("Selected bank:", selectedBank)
    },
    []
  )

  // Handle delivery date change
  const handleDeliveryDateChange = React.useCallback(
    async (selectedDeliveryDate: Date | null) => {
      console.log("Delivery date changed:", selectedDeliveryDate)
      await setDueDate(form)
    },
    [form]
  )

  // Handle currency selection
  const handleCurrencyChange = React.useCallback(
    async (selectedCurrency: ICurrencyLookup | null) => {
      // Additional logic when currency changes
      console.log("Selected currency:", selectedCurrency)
      const currencyId = selectedCurrency?.currencyId || 0
      const accountDate = form.getValues("accountDate")

      if (currencyId && accountDate) {
        // First update exchange rates
        await setExchangeRate(form, exhRateDec, visible)
        if (visible?.m_CtyCurr) {
          await setExchangeRateLocal(form, exhRateDec)
        }

        // Get current details and ensure they exist
        const details = form.getValues("data_details") as IInvoiceDetail[]
        if (!details || details.length === 0) {
          console.log("No details available for calculation")
          return
        }

        // Recalculate all details with new exchange rates
        const exchangeRate = form.getValues("exhRate") || 0
        const cityExchangeRate = form.getValues("ctyExhRate") || 0

        const updatedDetails = recalculateAllDetailAmounts(
          details,
          exchangeRate,
          cityExchangeRate,
          {
            amtDec: decimals[0]?.amtDec || 2,
            locAmtDec: decimals[0]?.locAmtDec || 2,
            ctyAmtDec: decimals[0]?.ctyAmtDec || 2,
          },
          !!visible?.m_CtyCurr
        )

        // Update form with recalculated details
        form.setValue(
          "data_details",
          updatedDetails as unknown as ArInvoiceDtSchemaType[]
        )

        // Calculate and update local amounts
        const localAmounts = calculateLocalAmounts(updatedDetails, locAmtDec)
        form.setValue("totLocalAmt", localAmounts.totLocalAmt)
        form?.trigger("totLocalAmt")
        form.setValue("gstLocalAmt", localAmounts.gstLocalAmt)
        form?.trigger("gstLocalAmt")
        form.setValue("totLocalAmtAftGst", localAmounts.totLocalAmtAftGst)
        form?.trigger("totLocalAmtAftGst")
        // Calculate and update country amounts if visible
        if (visible?.m_CtyCurr) {
          const countryAmounts = calculateCountryAmounts(
            updatedDetails,
            ctyAmtDec
          )
          form.setValue("totCtyAmt", countryAmounts.totCtyAmt)
          form?.trigger("totCtyAmt")
          form.setValue("gstCtyAmt", countryAmounts.gstCtyAmt)
          form?.trigger("gstCtyAmt")
          form.setValue("totCtyAmtAftGst", countryAmounts.totCtyAmtAftGst)
          form?.trigger("totCtyAmtAftGst")
        }

        // Calculate header amounts
        const totals = calculateTotalAmounts(updatedDetails, amtDec)
        form.setValue("totAmt", totals.totAmt)
        form?.trigger("totAmt")
        form.setValue("gstAmt", totals.gstAmt)
        form?.trigger("gstAmt")
        form.setValue("totAmtAftGst", totals.totAmtAftGst)
        form?.trigger("totAmtAftGst")
      }
    },
    [amtDec, ctyAmtDec, decimals, exhRateDec, form, locAmtDec, visible]
  )

  // Handle exchange rate change
  const handleExchangeRateChange = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      console.log("Exchange rate changed:", e.target.value)
      const details = form.getValues("data_details") as IInvoiceDetail[]
      const exchangeRate = parseFloat(e.target.value) || 0
      const cityExchangeRate = form.getValues("ctyExhRate") || 0

      // Recalculate all details with new exchange rate
      const updatedDetails = recalculateAllDetailAmounts(
        details,
        exchangeRate,
        cityExchangeRate,
        decimals[0],
        !!visible?.m_CtyCurr
      )

      // Update form with recalculated details
      form.setValue(
        "data_details",
        updatedDetails as unknown as ArInvoiceDtSchemaType[]
      )

      // Calculate and update local amounts
      const localAmounts = calculateLocalAmounts(updatedDetails, locAmtDec)

      form.setValue("totLocalAmt", localAmounts.totLocalAmt)
      form?.trigger("totLocalAmt")
      form.setValue("gstLocalAmt", localAmounts.gstLocalAmt)
      form?.trigger("gstLocalAmt")
      form.setValue("totLocalAmtAftGst", localAmounts.totLocalAmtAftGst)
      form?.trigger("totLocalAmtAftGst")

      // Calculate and update country amounts if visible
      if (visible?.m_CtyCurr) {
        const countryAmounts = calculateCountryAmounts(
          updatedDetails,
          ctyAmtDec
        )
        form.setValue("totCtyAmt", countryAmounts.totCtyAmt)
        form?.trigger("totCtyAmt")
        form.setValue("gstCtyAmt", countryAmounts.gstCtyAmt)
        form?.trigger("gstCtyAmt")
        form.setValue("totCtyAmtAftGst", countryAmounts.totCtyAmtAftGst)
        form?.trigger("totCtyAmtAftGst")
      }

      // Recalculate totals
      //calculateInvoice(form, updatedDetails, form, decimals[0])
      //handleDetailsChange(form, form, decimals[0])
      // handleTotalamountChange(form, form, decimals[0], visible)
    },
    [ctyAmtDec, decimals, form, locAmtDec, visible?.m_CtyCurr]
  )

  // Handle city exchange rate change
  const handleCityExchangeRateChange = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      console.log("City exchange rate changed:", e.target.value)
      const details = form.getValues("data_details") as IInvoiceDetail[]
      const exchangeRate = form.getValues("exhRate") || 0
      const cityExchangeRate = parseFloat(e.target.value) || 0

      // Recalculate all details with new city exchange rate
      const updatedDetails = recalculateAllDetailAmounts(
        details,
        exchangeRate,
        cityExchangeRate,
        {
          amtDec: decimals[0]?.amtDec || 2,
          locAmtDec: decimals[0]?.locAmtDec || 2,
          ctyAmtDec: decimals[0]?.ctyAmtDec || 2,
        },
        !!visible?.m_CtyCurr
      )

      // Update form with recalculated details
      form.setValue(
        "data_details",
        updatedDetails as unknown as ArInvoiceDtSchemaType[]
      )

      // Recalculate totals
      calculateInvoice(form, updatedDetails, form, decimals[0])
      handleTotalamountChange(form, form, decimals[0], visible)
    },
    [decimals, form, visible]
  )

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-7 gap-2 rounded-md p-2"
      >
        {/* Transaction Date */}
        <CustomDateNew
          form={form}
          name="trnDate"
          label="Transaction Date"
          isRequired={true}
          dateFormat={dateFormat}
          onChangeEvent={handleTrnDateChange}
        />

        {/* Customer */}
        <CustomerAutocomplete
          form={form}
          name="customerId"
          label="Customer"
          isRequired={true}
          onChangeEvent={handleCustomerChange}
        />

        {/* Reference No */}
        <CustomInput form={form} name="referenceNo" label="Reference No." />

        {/* Account Date */}
        <CustomDateNew
          form={form}
          name="accountDate"
          label="Account Date"
          isRequired={true}
          dateFormat={dateFormat}
          onChangeEvent={handleAccountDateChange}
        />

        {/* Credit Terms */}
        <CreditTermAutocomplete
          form={form}
          name="creditTermId"
          label="Credit Terms"
          isRequired={true}
          onChangeEvent={handleCreditTermChange}
        />

        {/* Due Date */}
        <CustomDateNew
          form={form}
          name="dueDate"
          label="Due Date"
          isRequired={true}
          dateFormat={dateFormat}
        />

        {/* Bank */}
        <BankAutocomplete
          form={form}
          name="bankId"
          label="Bank"
          isRequired={true}
          onChangeEvent={handleBankChange}
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

        {/* Delivery Date */}
        <CustomDateNew
          form={form}
          name="deliveryDate"
          label="Delivery Date"
          dateFormat={dateFormat}
          onChangeEvent={handleDeliveryDateChange}
        />

        {/* GST Claim Date */}
        <CustomDateNew
          form={form}
          name="gstClaimDate"
          label="GST Claim Date"
          dateFormat={dateFormat}
        />

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
          label="GST Local Amount"
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
              round={amtDec}
              isDisabled={true}
              className="text-right"
            />
          </>
        )}

        {visible?.m_CtyCurr && (
          <>
            {/* GST Country Amount */}
            <CustomNumberInput
              form={form}
              name="gstCtyAmt"
              label="GST Country Amount"
              isDisabled={true}
              round={amtDec}
              className="text-right"
            />
          </>
        )}

        {visible?.m_CtyCurr && (
          <>
            {/* Total Country Amount After GST */}
            <CustomNumberInput
              form={form}
              name="totCtyAmtAftGst"
              label="Total Country Amount After GST"
              isDisabled={true}
              round={amtDec}
              className="text-right"
            />
          </>
        )}

        {/* Remarks */}
        <CustomTextarea
          form={form}
          name="remarks"
          label="Remarks"
          className="col-span-2"
        />
      </form>
    </FormProvider>
  )
}
