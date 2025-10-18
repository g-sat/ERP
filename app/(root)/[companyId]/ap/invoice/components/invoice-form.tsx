"use client"

import * as React from "react"
import {
  EntityType,
  setAddressContactDetails,
  setDueDate,
  setExchangeRate,
  setExchangeRateLocal,
  setGSTPercentage,
} from "@/helpers/account"
import {
  calculateCountryAmounts,
  calculateLocalAmounts,
  calculateTotalAmounts,
  recalculateAllDetailAmounts,
} from "@/helpers/ap-invoice-calculations"
import { IApInvoiceDt } from "@/interfaces/ap-invoice"
import {
  IBankLookup,
  ICreditTermLookup,
  ICurrencyLookup,
  ISupplierLookup,
} from "@/interfaces/lookup"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  ApInvoiceDtSchemaType,
  ApInvoiceHdSchemaType,
} from "@/schemas/ap-invoice"
import { useAuthStore } from "@/stores/auth-store"
import { format } from "date-fns"
import { FormProvider, UseFormReturn } from "react-hook-form"

import { clientDateFormat } from "@/lib/date-utils"
import { CompanySupplierAutocomplete } from "@/components/autocomplete"
import BankAutocomplete from "@/components/autocomplete/autocomplete-bank"
import CreditTermAutocomplete from "@/components/autocomplete/autocomplete-creditterm"
import CurrencyAutocomplete from "@/components/autocomplete/autocomplete-currency"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import CustomInput from "@/components/custom/custom-input"
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomTextarea from "@/components/custom/custom-textarea"

interface InvoiceFormProps {
  form: UseFormReturn<ApInvoiceHdSchemaType>
  onSuccessAction: (action: string) => Promise<void>
  isEdit: boolean
  visible: IVisibleFields
  required: IMandatoryFields
  companyId: number
  defaultCurrencyId?: number
}

export default function InvoiceForm({
  form,
  onSuccessAction,
  isEdit,
  visible,
  required,
  companyId: _companyId,
  defaultCurrencyId = 0,
}: InvoiceFormProps) {
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
      // Additional logic when transaction date changes
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
  const handleSupplierChange = React.useCallback(
    async (selectedSupplier: ISupplierLookup | null) => {
      if (selectedSupplier) {
        // ✅ Supplier selected - populate related fields
        if (!isEdit) {
          form.setValue("currencyId", selectedSupplier.currencyId || 0)
          form.setValue("creditTermId", selectedSupplier.creditTermId || 0)
          form.setValue("bankId", selectedSupplier.bankId || 0)
        }

        await setDueDate(form)
        await setExchangeRate(form, exhRateDec, visible)
        await setExchangeRateLocal(form, exhRateDec)
        await setAddressContactDetails(form, EntityType.SUPPLIER)
      } else {
        // ✅ Supplier cleared - reset all related fields
        if (!isEdit) {
          // Clear supplier-related fields, use default currency if available
          form.setValue("currencyId", defaultCurrencyId)
          form.setValue("creditTermId", 0)
          form.setValue("bankId", 0)
        }

        // Clear exchange rates
        form.setValue("exhRate", 0)
        form.setValue("ctyExhRate", 0)

        // Clear due date
        form.setValue("dueDate", format(new Date(), clientDateFormat))

        // Clear address fields
        form.setValue("addressId", 0)
        form.setValue("address1", "")
        form.setValue("address2", "")
        form.setValue("address3", "")
        form.setValue("address4", "")
        form.setValue("pinCode", "")
        form.setValue("countryId", 0)
        form.setValue("phoneNo", "")

        // Clear contact fields
        form.setValue("contactId", 0)
        form.setValue("contactName", "")
        form.setValue("mobileNo", "")
        form.setValue("emailAdd", "")
        form.setValue("faxNo", "")

        // Trigger validation
        form.trigger()
      }
    },
    [exhRateDec, form, isEdit, visible, defaultCurrencyId]
  )

  // Handle transaction date selection
  const handleAccountDateChange = React.useCallback(
    async (_selectedAccountDate: Date | null) => {
      // Additional logic when transaction date changes
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
    (_selectedCreditTerm: ICreditTermLookup | null) => {
      // Additional logic when credit term changes
      setDueDate(form)
    },
    [form]
  )

  // Handle bank selection
  const handleBankChange = React.useCallback(
    (_selectedBank: IBankLookup | null) => {
      // Additional logic when bank changes
    },
    []
  )

  // Handle delivery date change
  const handleDeliveryDateChange = React.useCallback(
    async (_selectedDeliveryDate: Date | null) => {
      await setDueDate(form)
    },
    [form]
  )

  // Set default currency when form is initialized (not in edit mode)
  React.useEffect(() => {
    // Only run when defaultCurrencyId is loaded and we're not in edit mode
    if (!isEdit && defaultCurrencyId > 0) {
      const currentCurrencyId = form.getValues("currencyId")
      const currentSupplierId = form.getValues("supplierId")

      console.log("Invoice Form - Checking defaults:", {
        currentCurrencyId,
        currentSupplierId,
        defaultCurrencyId,
        isEdit,
      })

      // Only set default if no currency is set and no supplier is selected
      if (
        (!currentCurrencyId || currentCurrencyId === 0) &&
        (!currentSupplierId || currentSupplierId === 0)
      ) {
        console.log(
          "Invoice Form - Setting default currency:",
          defaultCurrencyId
        )
        form.setValue("currencyId", defaultCurrencyId)
        // Trigger exchange rate fetch when default currency is set
        setExchangeRate(form, exhRateDec, visible)
        if (visible?.m_CtyCurr) {
          setExchangeRateLocal(form, exhRateDec)
        }
      }
    }
    // Only depend on values that should trigger this effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCurrencyId, isEdit])

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
      formDetails as unknown as IApInvoiceDt[],
      amtDec
    )
    form.setValue("totAmt", totals.totAmt)
    form.setValue("gstAmt", totals.gstAmt)
    form.setValue("totAmtAftGst", totals.totAmtAftGst)

    // Calculate local currency totals (always calculate)
    const localAmounts = calculateLocalAmounts(
      formDetails as unknown as IApInvoiceDt[],
      locAmtDec
    )
    form.setValue("totLocalAmt", localAmounts.totLocalAmt)
    form.setValue("gstLocalAmt", localAmounts.gstLocalAmt)
    form.setValue("totLocalAmtAftGst", localAmounts.totLocalAmtAftGst)

    // Calculate country currency totals (always calculate)
    // If m_CtyCurr is false, country amounts = local amounts
    const countryAmounts = calculateCountryAmounts(
      formDetails as unknown as IApInvoiceDt[],
      visible?.m_CtyCurr ? ctyAmtDec : locAmtDec
    )
    form.setValue("totCtyAmt", countryAmounts.totCtyAmt)
    form.setValue("gstCtyAmt", countryAmounts.gstCtyAmt)
    form.setValue("totCtyAmtAftGst", countryAmounts.totCtyAmtAftGst)
  }, [amtDec, ctyAmtDec, form, locAmtDec, visible?.m_CtyCurr])

  // Handle currency selection
  const handleCurrencyChange = React.useCallback(
    async (selectedCurrency: ICurrencyLookup | null) => {
      // Additional logic when currency changes
      const currencyId = selectedCurrency?.currencyId || 0
      const accountDate = form.getValues("accountDate")

      if (currencyId && accountDate) {
        // First update exchange rates
        await setExchangeRate(form, exhRateDec, visible)
        if (visible?.m_CtyCurr) {
          await setExchangeRateLocal(form, exhRateDec)
        }

        // Get current details and ensure they exist
        const formDetails = form.getValues("data_details")
        if (!formDetails || formDetails.length === 0) {
          return
        }

        // Get updated exchange rates
        const exchangeRate = form.getValues("exhRate") || 0
        const cityExchangeRate = form.getValues("ctyExhRate") || 0

        // Recalculate all details with new exchange rates
        const updatedDetails = recalculateAllDetailAmounts(
          formDetails as unknown as IApInvoiceDt[],
          exchangeRate,
          cityExchangeRate,
          decimals[0],
          !!visible?.m_CtyCurr
        )

        // Update form with recalculated details
        form.setValue(
          "data_details",
          updatedDetails as unknown as ApInvoiceDtSchemaType[],
          { shouldDirty: true, shouldTouch: true }
        )

        // Recalculate header totals from updated details
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

      // If m_CtyCurr is false, set cityExchangeRate = exchangeRate
      let cityExchangeRate = form.getValues("ctyExhRate") || 0
      if (!visible?.m_CtyCurr) {
        cityExchangeRate = exchangeRate
        form.setValue("ctyExhRate", exchangeRate)
      }

      if (!formDetails || formDetails.length === 0) {
        return
      }

      // Recalculate all details with new exchange rate
      const updatedDetails = recalculateAllDetailAmounts(
        formDetails as unknown as IApInvoiceDt[],
        exchangeRate,
        cityExchangeRate,
        decimals[0],
        !!visible?.m_CtyCurr
      )

      // Update form with recalculated details
      form.setValue(
        "data_details",
        updatedDetails as unknown as ApInvoiceDtSchemaType[],
        { shouldDirty: true, shouldTouch: true }
      )

      // Recalculate header totals from updated details
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

      // Recalculate all details with new city exchange rate
      const updatedDetails = recalculateAllDetailAmounts(
        formDetails as unknown as IApInvoiceDt[],
        exchangeRate,
        cityExchangeRate,
        decimals[0],
        !!visible?.m_CtyCurr
      )

      // Update form with recalculated details
      form.setValue(
        "data_details",
        updatedDetails as unknown as ApInvoiceDtSchemaType[],
        { shouldDirty: true, shouldTouch: true }
      )

      // Recalculate header totals from updated details
      recalculateHeaderTotals()
    },
    [decimals, form, recalculateHeaderTotals, visible?.m_CtyCurr]
  )

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-12 gap-2 rounded-md p-2"
      >
        <div className="col-span-10 grid grid-cols-6 gap-2 space-y-2">
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

          {/* Supplier */}
          <CompanySupplierAutocomplete
            form={form}
            name="supplierId"
            label="Supplier"
            isRequired={true}
            onChangeEvent={handleSupplierChange}
            companyId={_companyId}
          />
          {/* supplierInvoiceNo */}
          <CustomInput
            form={form}
            name="suppInvoiceNo"
            label="Supplier Invoice No."
            isRequired={required?.m_SuppInvoiceNo}
          />

          {/* Reference No */}
          <CustomInput
            form={form}
            name="referenceNo"
            label="Reference No."
            isRequired={required?.m_ReferenceNo}
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

          {/* Delivery Date */}
          {visible?.m_DeliveryDate && (
            <CustomDateNew
              form={form}
              name="deliveryDate"
              label="Delivery Date"
              isRequired={required?.m_DeliveryDate}
              onChangeEvent={handleDeliveryDateChange}
            />
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
            isRequired={required?.m_Remarks_Hd}
            className="col-span-2"
          />
        </div>

        {/* Summary Box */}
        {/* Right Section: Summary Box */}
        <div className="col-span-2 flex flex-col justify-start">
          <div className="w-full rounded-md border border-blue-200 bg-blue-50 p-4 shadow-sm">
            <h3 className="mb-2 text-center font-semibold text-blue-800">
              Financial Summary
            </h3>

            {/* 3-column grid: [Amt] [Label] [Base] */}
            <div className="grid grid-cols-3 gap-x-2 text-sm">
              {/* Column 1: Foreign Amounts (Amt) */}
              <div className="space-y-1 text-right">
                <div className="font-medium text-gray-700">
                  {form.watch("totAmt")?.toLocaleString() || "0"}
                </div>
                <div className="font-medium text-gray-700">
                  {form.watch("gstAmt")?.toLocaleString() || "0"}
                </div>
                <hr className="my-1 border-blue-300" />
                <div className="font-bold text-blue-900">
                  {form.watch("totAmtAftGst")?.toLocaleString() || "0"}
                </div>
              </div>

              {/* Column 2: Labels ("Amt", "Gst", "Total") */}
              <div className="space-y-1 text-center">
                <div className="font-medium text-blue-600">Amt</div>
                <div className="font-medium text-blue-600">Gst</div>
                <div></div> {/* Empty spacer for hr alignment */}
                <div className="font-bold text-blue-800">Total</div>
              </div>

              {/* Column 3: Local/Base Amounts */}
              <div className="space-y-1 text-right">
                <div className="font-medium text-gray-700">
                  {form.watch("totLocalAmt")?.toLocaleString() || "0"}
                </div>
                <div className="font-medium text-gray-700">
                  {form.watch("gstLocalAmt")?.toLocaleString() || "0"}
                </div>
                <hr className="my-1 border-blue-300" />
                <div className="font-bold text-blue-900">
                  {form.watch("totLocalAmtAftGst")?.toLocaleString() || "0"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
