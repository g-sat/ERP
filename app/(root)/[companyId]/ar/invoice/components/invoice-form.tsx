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
} from "@/helpers/ar-invoice-calculations"
import { IArInvoiceDt } from "@/interfaces"
import {
  IBankLookup,
  ICreditTermLookup,
  ICurrencyLookup,
  ICustomerLookup,
  IJobOrderLookup,
} from "@/interfaces/lookup"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import { ArInvoiceDtSchemaType, ArInvoiceHdSchemaType } from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { format, isValid, parse } from "date-fns"
import { FormProvider, UseFormReturn, useWatch } from "react-hook-form"

import { clientDateFormat, parseDate } from "@/lib/date-utils"
import { useGetDynamicLookup } from "@/hooks/use-lookup"
import {
  BankAutocomplete,
  CreditTermAutocomplete,
  CurrencyAutocomplete,
  CustomerAutocomplete,
  DynamicCustomerAutocomplete,
  JobOrderAutocomplete,
  PortAutocomplete,
} from "@/components/autocomplete"
import DynamicVesselAutocomplete from "@/components/autocomplete/autocomplete-dynamic-vessel"
import ServiceTypeAutocomplete from "@/components/autocomplete/autocomplete-servicetype"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import CustomInput from "@/components/custom/custom-input"
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomTextarea from "@/components/custom/custom-textarea"

interface InvoiceFormProps {
  form: UseFormReturn<ArInvoiceHdSchemaType>
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

  const { data: dynamicLookup } = useGetDynamicLookup()
  const isDynamicCustomer = dynamicLookup?.isCustomer ?? false

  const dateFormat = React.useMemo(
    () => decimals[0]?.dateFormat || clientDateFormat,
    [decimals]
  )

  const parseWithFallback = React.useCallback(
    (value: string): Date | null => {
      if (!value) return null

      const parsedByDateFormat = parse(value, dateFormat, new Date())
      if (isValid(parsedByDateFormat)) {
        return parsedByDateFormat
      }

      const fallback = parseDate(value)
      return fallback ?? null
    },
    [dateFormat]
  )

  // Watch account date to use as minDate for due date
  const accountDateValue = useWatch({
    control: form.control,
    name: "accountDate",
  })
  const dueDateMinDate = React.useMemo(() => {
    if (!accountDateValue) return new Date()

    // Parse account date string to Date object if needed
    const accountDateObj =
      typeof accountDateValue === "string"
        ? parseWithFallback(accountDateValue)
        : accountDateValue

    return accountDateObj && !isNaN(accountDateObj.getTime())
      ? accountDateObj
      : new Date()
  }, [accountDateValue, parseWithFallback])

  // Refs to store original values on focus for comparison on change
  const originalExhRateRef = React.useRef<number>(0)
  const originalCtyExhRateRef = React.useRef<number>(0)

  const onSubmit = async () => {
    await onSuccessAction("save")
  }

  // Helper function to calculate and set due date
  const calculateAndSetDueDate = React.useCallback(async () => {
    const creditTermId = form.getValues("creditTermId")
    const accountDate = form.getValues("accountDate")
    const deliveryDate = form.getValues("deliveryDate")

    console.log("creditTermId", creditTermId)
    console.log("accountDate", accountDate)
    console.log("deliveryDate", deliveryDate)
    if (creditTermId && creditTermId > 0) {
      console.log(
        "Credit term available - calculate due date based on credit term"
      )
      // Credit term available - calculate due date based on credit term
      await setDueDate(form)
    } else if (accountDate) {
      console.log("No credit term - set due date to account date")
      // No credit term - set due date to account date
      const dueDateValue =
        typeof accountDate === "string"
          ? accountDate
          : format(accountDate, dateFormat)
      form.setValue("dueDate", dueDateValue)
      form.trigger("dueDate")
    } else {
      console.log("No account date either - set to today")
      // No account date either - set to today
      const todayValue = format(new Date(), dateFormat)
      form.setValue("dueDate", todayValue)
      form.trigger("dueDate")
    }
    console.log("dueDate", form.getValues("dueDate"))
  }, [form, dateFormat])

  // Handle transaction date selection
  const handleTrnDateChange = React.useCallback(
    async (_selectedTrnDate: Date | null) => {
      // Additional logic when transaction date changes
      const { trnDate } = form?.getValues()

      // Format trnDate to string if it's a Date object
      const trnDateStr =
        typeof trnDate === "string"
          ? trnDate
          : format(trnDate || new Date(), dateFormat)

      form.setValue("gstClaimDate", trnDateStr)
      form?.trigger("gstClaimDate")
      form.setValue("accountDate", trnDateStr)
      form.setValue("deliveryDate", trnDateStr)
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
    [decimals, exhRateDec, form, visible, dateFormat]
  )

  // Handle account date selection
  const handleAccountDateChange = React.useCallback(
    async (selectedAccountDate: Date | null) => {
      // Get the updated account date from form (should be set by CustomDateNew)
      const accountDate = form?.getValues("accountDate") || selectedAccountDate

      if (accountDate) {
        // Format account date to string if it's a Date object
        const accountDateStr =
          typeof accountDate === "string"
            ? accountDate
            : format(accountDate, dateFormat)

        // Set gstClaimDate and deliveryDate to the new account date (as strings)
        form.setValue("gstClaimDate", accountDateStr)
        form?.trigger("gstClaimDate")

        form.setValue("deliveryDate", accountDateStr)
        form?.trigger("deliveryDate")

        // Ensure accountDate is set in form (as string) and trigger to ensure it's updated
        if (selectedAccountDate) {
          const accountDateValue =
            typeof selectedAccountDate === "string"
              ? selectedAccountDate
              : format(selectedAccountDate, dateFormat)
          form.setValue("accountDate", accountDateValue)
          form.trigger("accountDate")
        }

        // Wait a tick to ensure form state is updated before calling setExchangeRate
        await new Promise((resolve) => setTimeout(resolve, 0))

        await setExchangeRate(form, exhRateDec, visible)
        if (visible?.m_CtyCurr) {
          await setExchangeRateLocal(form, exhRateDec)
        }

        // Calculate and set due date
        await calculateAndSetDueDate()
      }
    },
    [exhRateDec, form, visible, calculateAndSetDueDate, dateFormat]
  )

  // Handle customer selection
  const handleCustomerChange = React.useCallback(
    async (selectedCustomer: ICustomerLookup | null) => {
      if (selectedCustomer) {
        // ✅ Customer selected - populate related fields
        if (!isEdit) {
          form.setValue("currencyId", selectedCustomer.currencyId || 0)
          form.setValue("creditTermId", selectedCustomer.creditTermId || 0)
          form.setValue("bankId", selectedCustomer.bankId || 0)
        }

        await setExchangeRate(form, exhRateDec, visible)
        await setExchangeRateLocal(form, exhRateDec)
        await setAddressContactDetails(form, EntityType.CUSTOMER)

        // Calculate and set due date after customer fields are set
        await calculateAndSetDueDate()
      } else {
        // ✅ Customer cleared - reset all related fields
        if (!isEdit) {
          // Clear customer-related fields, use default currency if available
          form.setValue("currencyId", defaultCurrencyId)
          form.setValue("creditTermId", 0)
          form.setValue("bankId", 0)
        }

        // Clear exchange rates
        form.setValue("exhRate", 0)
        form.setValue("ctyExhRate", 0)

        // Calculate and set due date (will use account date if available, otherwise today)
        await calculateAndSetDueDate()

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
    [
      exhRateDec,
      form,
      isEdit,
      visible,
      defaultCurrencyId,
      calculateAndSetDueDate,
    ]
  )

  // Handle credit term selection
  const handleCreditTermChange = React.useCallback(
    async (_selectedCreditTerm: ICreditTermLookup | null) => {
      // Calculate and set due date when credit term changes
      await calculateAndSetDueDate()
    },
    [calculateAndSetDueDate]
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

  // Handle job order selection
  const handleJobOrderChange = React.useCallback(
    (selectedJobOrder: IJobOrderLookup | null) => {
      if (selectedJobOrder) {
        // Set vesselId and portId from selected job order
        form.setValue("vesselId", selectedJobOrder.vesselId || 0)
        form.setValue("portId", selectedJobOrder.portId || 0)

        // Trigger validation for the updated fields
        form.trigger("vesselId")
        form.trigger("portId")
      } else {
        // Clear vesselId and portId when job order is cleared
        form.setValue("vesselId", 0)
        form.setValue("portId", 0)

        // Trigger validation for the cleared fields
        form.trigger("vesselId")
        form.trigger("portId")
      }
    },
    [form]
  )

  // Set default currency when form is initialized (not in edit mode)
  React.useEffect(() => {
    // Only run when defaultCurrencyId is loaded and we're not in edit mode
    if (!isEdit && defaultCurrencyId > 0) {
      const currentCurrencyId = form.getValues("currencyId")
      const currentCustomerId = form.getValues("customerId")

      console.log("Invoice Form - Checking defaults:", {
        currentCurrencyId,
        currentCustomerId,
        defaultCurrencyId,
        isEdit,
      })

      // Only set default if no currency is set and no customer is selected
      if (
        (!currentCurrencyId || currentCurrencyId === 0) &&
        (!currentCustomerId || currentCustomerId === 0)
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
      formDetails as unknown as IArInvoiceDt[],
      amtDec
    )
    form.setValue("totAmt", totals.totAmt)
    form.setValue("gstAmt", totals.gstAmt)
    form.setValue("totAmtAftGst", totals.totAmtAftGst)

    // Calculate local currency totals (always calculate)
    const localAmounts = calculateLocalAmounts(
      formDetails as unknown as IArInvoiceDt[],
      locAmtDec
    )
    form.setValue("totLocalAmt", localAmounts.totLocalAmt)
    form.setValue("gstLocalAmt", localAmounts.gstLocalAmt)
    form.setValue("totLocalAmtAftGst", localAmounts.totLocalAmtAftGst)

    // Calculate country currency totals (always calculate)
    // If m_CtyCurr is false, country amounts = local amounts
    const countryAmounts = calculateCountryAmounts(
      formDetails as unknown as IArInvoiceDt[],
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
          formDetails as unknown as IArInvoiceDt[],
          exchangeRate,
          cityExchangeRate,
          decimals[0],
          !!visible?.m_CtyCurr
        )

        // Update form with recalculated details
        form.setValue(
          "data_details",
          updatedDetails as unknown as ArInvoiceDtSchemaType[],
          { shouldDirty: true, shouldTouch: true }
        )

        // Recalculate header totals from updated details
        recalculateHeaderTotals()
      }
    },
    [decimals, exhRateDec, form, recalculateHeaderTotals, visible]
  )

  // Handle exchange rate focus - capture original value
  const handleExchangeRateFocus = React.useCallback(() => {
    originalExhRateRef.current = form.getValues("exhRate") || 0
    console.log(
      "handleExchangeRateFocus - original value:",
      originalExhRateRef.current
    )
  }, [form])

  // Handle exchange rate blur - recalculate amounts when user leaves the field
  const handleExchangeRateBlur = React.useCallback(
    (_e: React.FocusEvent<HTMLInputElement>) => {
      const exchangeRate = form.getValues("exhRate") || 0
      const originalExhRate = originalExhRateRef.current

      console.log("handleExchangeRateBlur", {
        newValue: exchangeRate,
        originalValue: originalExhRate,
        isDifferent: exchangeRate !== originalExhRate,
      })

      // Only recalculate if value is different from original
      if (exchangeRate === originalExhRate) {
        console.log("Exchange Rate unchanged - skipping recalculation")
        return
      }

      console.log("Exchange Rate changed - recalculating amounts")

      const formDetails = form.getValues("data_details")

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
        formDetails as unknown as IArInvoiceDt[],
        exchangeRate,
        cityExchangeRate,
        decimals[0],
        !!visible?.m_CtyCurr
      )

      // Update form with recalculated details
      form.setValue(
        "data_details",
        updatedDetails as unknown as ArInvoiceDtSchemaType[],
        { shouldDirty: true, shouldTouch: true }
      )

      // Recalculate header totals from updated details
      recalculateHeaderTotals()
    },
    [decimals, form, recalculateHeaderTotals, visible?.m_CtyCurr]
  )

  // Handle city exchange rate focus - capture original value
  const handleCityExchangeRateFocus = React.useCallback(() => {
    originalCtyExhRateRef.current = form.getValues("ctyExhRate") || 0
    console.log(
      "handleCityExchangeRateFocus - original value:",
      originalCtyExhRateRef.current
    )
  }, [form])

  // Handle city exchange rate blur - recalculate amounts when user leaves the field
  const handleCityExchangeRateBlur = React.useCallback(
    (_e: React.FocusEvent<HTMLInputElement>) => {
      const cityExchangeRate = form.getValues("ctyExhRate") || 0
      const originalCtyExhRate = originalCtyExhRateRef.current

      console.log("handleCityExchangeRateBlur", {
        newValue: cityExchangeRate,
        originalValue: originalCtyExhRate,
        isDifferent: cityExchangeRate !== originalCtyExhRate,
      })

      // Only recalculate if value is different from original
      if (cityExchangeRate === originalCtyExhRate) {
        console.log("City Exchange Rate unchanged - skipping recalculation")
        return
      }

      console.log("City Exchange Rate changed - recalculating amounts")

      const formDetails = form.getValues("data_details")
      const exchangeRate = form.getValues("exhRate") || 0

      if (!formDetails || formDetails.length === 0) {
        return
      }

      // Recalculate all details with new city exchange rate
      const updatedDetails = recalculateAllDetailAmounts(
        formDetails as unknown as IArInvoiceDt[],
        exchangeRate,
        cityExchangeRate,
        decimals[0],
        !!visible?.m_CtyCurr
      )

      // Update form with recalculated details
      form.setValue(
        "data_details",
        updatedDetails as unknown as ArInvoiceDtSchemaType[],
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
        className="grid grid-cols-12 rounded-md p-2"
      >
        <div className="col-span-10 grid grid-cols-6 gap-1 gap-y-1">
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
          <CustomDateNew
            form={form}
            name="accountDate"
            label="Account Date"
            isRequired={true}
            onChangeEvent={handleAccountDateChange}
            isFutureShow={false}
          />

          {/* Customer */}
          {isDynamicCustomer ? (
            <DynamicCustomerAutocomplete
              form={form}
              name="customerId"
              label="Customer-D"
              isRequired={true}
              onChangeEvent={handleCustomerChange}
            />
          ) : (
            <CustomerAutocomplete
              form={form}
              name="customerId"
              label="Customer-S"
              isRequired={true}
              onChangeEvent={handleCustomerChange}
            />
          )}

          {/* customerInvoiceNo */}
          <CustomInput
            form={form}
            name="suppInvoiceNo"
            label="Customer Invoice No."
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
            isFutureShow={true}
            minDate={dueDateMinDate}
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
            onFocusEvent={handleExchangeRateFocus}
            onBlurEvent={handleExchangeRateBlur}
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
                onFocusEvent={handleCityExchangeRateFocus}
                onBlurEvent={handleCityExchangeRateBlur}
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
              isFutureShow={true}
            />
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

          {/* Job Order */}
          {visible?.m_JobOrderIdHd && (
            <JobOrderAutocomplete
              form={form}
              name="jobOrderId"
              label="Job Order"
              onChangeEvent={handleJobOrderChange}
            />
          )}

          {/* Vessel */}
          {visible?.m_VesselIdHd && (
            <DynamicVesselAutocomplete
              form={form}
              name="vesselId"
              label="Vessel"
            />
          )}

          {/* Port */}
          {visible?.m_PortIdHd && (
            <PortAutocomplete form={form} name="portId" label="Port" />
          )}

          {/* Service Type */}
          {visible?.m_ServiceTypeId && (
            <ServiceTypeAutocomplete
              form={form}
              name="serviceTypeId"
              label="Service Type"
              isRequired={true}
            />
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

        {/* {form.watch("invoiceId") != "0" && (
          <>
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
                <div className="font-bold text-blue-900">
                  {(form.watch("payAmt") || 0).toLocaleString(undefined, {
                    minimumFractionDigits: amtDec,
                    maximumFractionDigits: amtDec,
                  })}
                </div>
                <div className="font-bold text-blue-900">
                  {(form.watch("balAmt") || 0).toLocaleString(undefined, {
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
                <div className="font-bold text-blue-800">Payment</div>
                <div className="font-bold text-blue-800">Balance</div>
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
                <div className="font-bold text-blue-900">
                  {(form.watch("payLocalAmt") || 0).toLocaleString(undefined, {
                    minimumFractionDigits: locAmtDec,
                    maximumFractionDigits: locAmtDec,
                  })}
                </div>
                <div className="font-bold text-blue-900">
                  {(form.watch("balLocalAmt") || 0).toLocaleString(undefined, {
                    minimumFractionDigits: locAmtDec,
                    maximumFractionDigits: locAmtDec,
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
