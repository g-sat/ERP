"use client"

import * as React from "react"
import { useCallback } from "react"
import {
  setDueDate,
  setExchangeRate,
  setExchangeRateLocal,
  setPayExchangeRate,
} from "@/helpers/account"
import {
  calculateLocalAmounts,
  calculateTotalAmounts,
  recalculateAllDetailAmounts,
} from "@/helpers/ap-payment-calculations"
import { IApPaymentDt } from "@/interfaces"
import {
  IBankLookup,
  ICurrencyLookup,
  IPaymentTypeLookup,
  ISupplierLookup,
} from "@/interfaces/lookup"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import { ApPaymentDtSchemaType, ApPaymentHdSchemaType } from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { FormProvider, UseFormReturn } from "react-hook-form"

import { usePaymentTypeLookup } from "@/hooks/use-lookup"
import {
  BankAutocomplete,
  BankChartOfAccountAutocomplete,
  CompanySupplierAutocomplete,
  CurrencyAutocomplete,
  PaymentTypeAutocomplete,
} from "@/components/autocomplete"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import CustomInput from "@/components/custom/custom-input"
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomTextarea from "@/components/custom/custom-textarea"

interface PaymentFormProps {
  form: UseFormReturn<ApPaymentHdSchemaType>
  onSuccessAction: (action: string) => Promise<void>
  isEdit: boolean
  visible: IVisibleFields
  required: IMandatoryFields
  companyId: number
}

export default function PaymentForm({
  form,
  onSuccessAction,
  isEdit,
  visible,
  required,
  companyId: _companyId,
}: PaymentFormProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const exhRateDec = decimals[0]?.exhRateDec || 6

  const { data: paymentTypes = [] } = usePaymentTypeLookup()

  // State to track if currencies are the same
  const [areCurrenciesSame, setAreCurrenciesSame] = React.useState(true)

  // State to track if payment type is cheque
  const [isChequePayment, setIsChequePayment] = React.useState(false)

  // Function to check and update currency comparison state
  const updateCurrencyComparison = React.useCallback(() => {
    const currencyId = form.getValues("currencyId") || 0
    const payCurrencyId = form.getValues("payCurrencyId") || 0
    // Disable if both are zero OR if they are the same (and not zero)
    const same = currencyId === payCurrencyId
    setAreCurrenciesSame(same)
    return same
  }, [form])

  // Initialize currency comparison state on component mount and form changes
  React.useEffect(() => {
    updateCurrencyComparison()
  }, [updateCurrencyComparison])

  // Watch paymentTypeId and update cheque payment state
  React.useEffect(() => {
    const paymentTypeId = form.watch("paymentTypeId")

    if (paymentTypeId && paymentTypes.length > 0) {
      const selectedPaymentType = paymentTypes.find(
        (pt) => pt.paymentTypeId === paymentTypeId
      )

      if (selectedPaymentType) {
        const isCheque =
          selectedPaymentType.paymentTypeName
            ?.toLowerCase()
            .includes("cheque") ||
          selectedPaymentType.paymentTypeCode?.toLowerCase().includes("cheque")

        setIsChequePayment(isCheque)
      } else {
        setIsChequePayment(false)
      }
    } else {
      setIsChequePayment(false)
    }
  }, [form, paymentTypes])

  // ==================== REUSABLE CALCULATION FUNCTIONS ====================

  // 1. Clear all total fields
  const clearAllTotals = useCallback(() => {
    form.setValue("totLocalAmt", 0, { shouldDirty: true })
    form.setValue("payTotAmt", 0, { shouldDirty: true })
    form.setValue("payTotLocalAmt", 0, { shouldDirty: true })
    form.setValue("unAllocTotAmt", 0, { shouldDirty: true })
    form.setValue("unAllocTotLocalAmt", 0, { shouldDirty: true })
  }, [form])

  // 2. Calculate unallocated amounts
  const calculateUnallocatedAmounts = useCallback(
    (
      totAmt: number,
      totLocalAmt: number,
      allocTotAmt: number,
      allocTotLocalAmt: number
    ) => {
      const unAllocTotAmt = totAmt - allocTotAmt
      const unAllocTotLocalAmt = totLocalAmt - allocTotLocalAmt
      form.setValue("unAllocTotAmt", unAllocTotAmt, { shouldDirty: true })
      form.setValue("unAllocTotLocalAmt", unAllocTotLocalAmt, {
        shouldDirty: true,
      })
    },
    [form]
  )

  // 3. Handle totAmt changes (same currencies)
  const handleTotAmtChange = useCallback(
    (
      totAmt: number,
      exhRate: number,
      allocTotAmt: number,
      allocTotLocalAmt: number
    ) => {
      if (totAmt === 0) {
        clearAllTotals()
        return
      }

      if (totAmt > 0 && exhRate > 0 && areCurrenciesSame) {
        // totLocalAmt = totAmt * exhRate
        const totLocalAmt = totAmt * exhRate
        form.setValue("totLocalAmt", totLocalAmt, { shouldDirty: true })

        // payTotAmt = totAmt & payTotLocalAmt = totLocalAmt
        form.setValue("payTotAmt", totAmt, { shouldDirty: true })
        form.setValue("payTotLocalAmt", totLocalAmt, { shouldDirty: true })

        // Calculate unallocated amounts
        calculateUnallocatedAmounts(
          totAmt,
          totLocalAmt,
          allocTotAmt,
          allocTotLocalAmt
        )
      }
    },
    [form, areCurrenciesSame, clearAllTotals, calculateUnallocatedAmounts]
  )

  // 4. Handle payTotAmt changes (different currencies)
  const handlePayTotAmtChange = useCallback(
    (
      payTotAmt: number,
      payExhRate: number,
      exhRate: number,
      allocTotAmt: number,
      allocTotLocalAmt: number
    ) => {
      if (payTotAmt > 0 && payExhRate > 0 && !areCurrenciesSame) {
        // payTotLocalAmt = payTotAmt * payExhRate
        const payTotLocalAmt = payTotAmt * payExhRate
        form.setValue("payTotLocalAmt", payTotLocalAmt, { shouldDirty: true })

        // totAmt = (payTotLocalAmt / exhRate) & totLocalAmt = payTotLocalAmt
        const totAmt = payTotLocalAmt / exhRate
        form.setValue("totAmt", totAmt, { shouldDirty: true })
        form.setValue("totLocalAmt", payTotLocalAmt, { shouldDirty: true })

        // Calculate unallocated amounts
        calculateUnallocatedAmounts(
          totAmt,
          payTotLocalAmt,
          allocTotAmt,
          allocTotLocalAmt
        )
      }
    },
    [form, areCurrenciesSame, calculateUnallocatedAmounts]
  )

  // ==================== WATCHERS AND EFFECTS ====================

  // Note: Form values are now accessed directly in field handlers to prevent infinite loops

  // Note: Automatic useEffect calculations removed to prevent infinite loops
  // Calculations now only happen on field blur events via handleTotAmtFieldChange,
  // handlePayTotAmtFieldChange, and handlePayExhRateFieldChange

  // Watch accountDate and sync to chequeDate if chequeDate is empty
  const accountDate = form.watch("accountDate")
  const chequeDate = form.watch("chequeDate")

  React.useEffect(() => {
    // Step 1: Check if chequeDate is empty or null
    if (!chequeDate || chequeDate === "") {
      // Step 2: Set chequeDate to accountDate
      if (accountDate) {
        form.setValue("chequeDate", accountDate, { shouldDirty: true })
      }
    }
  }, [accountDate, chequeDate, form])

  const onSubmit = async () => {
    await onSuccessAction("save")
  }

  // Handle transaction date selection
  const handleTrnDateChange = React.useCallback(
    async (_selectedTrnDate: Date | null) => {
      // Additional logic when transaction date changes
      const { trnDate } = form?.getValues()
      form.setValue("accountDate", trnDate)
      form?.trigger("accountDate")
      await setExchangeRate(form, exhRateDec, visible)
      if (visible?.m_CtyCurr) {
        await setExchangeRateLocal(form, exhRateDec)
      }
      await setDueDate(form)
    },
    [exhRateDec, form, visible]
  )

  // Handle supplier selection
  const handleSupplierChange = React.useCallback(
    async (selectedSupplier: ISupplierLookup | null) => {
      if (selectedSupplier) {
        // ✅ Supplier selected - populate related fields
        if (!isEdit) {
          form.setValue("currencyId", selectedSupplier.currencyId || 0)
          form.setValue("payCurrencyId", selectedSupplier.currencyId || 0)
          form.setValue("bankId", selectedSupplier.bankId || 0)
        }

        await setDueDate(form)

        // Only set exchange rates if currency is available
        if (selectedSupplier.currencyId > 0) {
          await setExchangeRate(form, exhRateDec, visible)
          await setPayExchangeRate(form, exhRateDec)
        } else {
          // If no currency, set exchange rates to zero
          form.setValue("exhRate", 0)
          form.setValue("payExhRate", 0)
        }

        // Update currency comparison state
        updateCurrencyComparison()
      } else {
        // ✅ Supplier cleared - reset all related fields
        if (!isEdit) {
          // Clear supplier-related fields
          form.setValue("currencyId", 0)
          form.setValue("payCurrencyId", 0)
          form.setValue("bankId", 0)
        }

        // Clear exchange rates
        form.setValue("exhRate", 0)
        form.setValue("payExhRate", 0)

        // Update currency comparison state
        updateCurrencyComparison()

        // Trigger validation
        form.trigger()
      }
    },
    [exhRateDec, form, isEdit, visible, updateCurrencyComparison]
  )

  // Handle account date selection
  const handleAccountDateChange = React.useCallback(
    async (_selectedAccountDate: Date | null) => {
      await setExchangeRate(form, exhRateDec, visible)
      await setPayExchangeRate(form, exhRateDec)
    },
    [exhRateDec, form, visible]
  )

  // Common function to check if payTotAmt should be enabled
  const checkPayTotAmtEnable = React.useCallback(() => {
    const currencyId = form.getValues("currencyId") || 0
    const payCurrencyId = form.getValues("payCurrencyId") || 0
    return currencyId !== payCurrencyId
  }, [form])

  // Handle bank selection
  const handleBankChange = React.useCallback(
    async (selectedBank: IBankLookup | null) => {
      const payCurrencyId = selectedBank?.currencyId || 0
      form.setValue("payCurrencyId", payCurrencyId)

      if (selectedBank && payCurrencyId > 0) {
        // Only call setPayExchangeRate if currency is available
        await setPayExchangeRate(form, exhRateDec)
      } else {
        // If no bank selected or no currency, set exchange rate to zero
        form.setValue("payExhRate", 0)
      }

      // Update currency comparison state
      updateCurrencyComparison()

      // Check if payTotAmt should be enabled
      const _shouldEnablePayTotAmt = checkPayTotAmtEnable()
    },
    [exhRateDec, form, checkPayTotAmtEnable, updateCurrencyComparison]
  )

  // Handle pay currency change
  const handlePayCurrencyChange = React.useCallback(
    async (selectedCurrency: ICurrencyLookup | null) => {
      const payCurrencyId = selectedCurrency?.currencyId || 0
      form.setValue("payCurrencyId", payCurrencyId)

      if (selectedCurrency && payCurrencyId > 0) {
        // Only call setPayExchangeRate if currency is available
        await setPayExchangeRate(form, exhRateDec)
      } else {
        // If no currency selected, set exchange rate to zero
        form.setValue("payExhRate", 0)
      }

      // Update currency comparison state
      updateCurrencyComparison()

      // Check if payTotAmt should be enabled
      const _shouldEnablePayTotAmt = checkPayTotAmtEnable()
    },
    [exhRateDec, form, checkPayTotAmtEnable, updateCurrencyComparison]
  )

  // Handle payment type change
  const handlePaymentTypeChange = React.useCallback(
    (selectedPaymentType: IPaymentTypeLookup | null) => {
      if (selectedPaymentType) {
        // Check if payment type is "Cheque"
        const isCheque =
          selectedPaymentType?.paymentTypeName
            ?.toLowerCase()
            .includes("cheque") ||
          selectedPaymentType?.paymentTypeCode?.toLowerCase().includes("cheque")

        setIsChequePayment(isCheque)

        // Clear cheque fields if not cheque payment
        if (!isCheque) {
          form.setValue("chequeNo", "")
          form.setValue("chequeDate", "")
        }
      } else {
        // No payment type selected, hide cheque fields
        setIsChequePayment(false)
        form.setValue("chequeNo", "")
        form.setValue("chequeDate", "")
      }
    },
    [form]
  )

  // Recalculate header totals from details
  const recalculateHeaderTotals = React.useCallback(() => {
    const formDetails = form.getValues("data_details") || []

    if (formDetails.length === 0) {
      // Reset all amounts to 0 if no details
      form.setValue("totAmt", 0)
      form.setValue("totLocalAmt", 0)
      return
    }

    // Calculate base currency totals
    const totals = calculateTotalAmounts(
      formDetails as unknown as IApPaymentDt[],
      amtDec
    )
    form.setValue("totAmt", totals.totAmt)

    // Calculate local currency totals (always calculate)
    const localAmounts = calculateLocalAmounts(
      formDetails as unknown as IApPaymentDt[],
      locAmtDec
    )
    form.setValue("totLocalAmt", localAmounts.totLocalAmt)
  }, [amtDec, form, locAmtDec])

  // 5. Recalculate details with new exchange rate
  const recalculateDetailsWithExchangeRate = useCallback(
    (exchangeRate: number) => {
      const formDetails = form.getValues("data_details")

      if (!formDetails || formDetails.length === 0) {
        return
      }

      // Recalculate all details with new exchange rate
      const updatedDetails = recalculateAllDetailAmounts(
        formDetails as unknown as IApPaymentDt[],
        exchangeRate,
        decimals[0]
      )

      // Update form with recalculated details
      form.setValue(
        "data_details",
        updatedDetails as unknown as ApPaymentDtSchemaType[],
        { shouldDirty: true, shouldTouch: true }
      )

      // Recalculate header totals from updated details
      recalculateHeaderTotals()
    },
    [decimals, form, recalculateHeaderTotals]
  )

  // 6. Handle currency change with recalculations
  const handleCurrencyChangeWithRecalc = useCallback(
    async (currencyId: number, accountDate: string | Date) => {
      if (currencyId && accountDate) {
        // First update exchange rates
        await setExchangeRate(form, exhRateDec, visible)
        if (visible?.m_CtyCurr) {
          await setExchangeRateLocal(form, exhRateDec)
        }

        // Get updated exchange rates and recalculate details
        const exchangeRate = form.getValues("exhRate") || 0
        recalculateDetailsWithExchangeRate(exchangeRate)
      }
    },
    [form, exhRateDec, visible, recalculateDetailsWithExchangeRate]
  )

  // Handle currency selection
  const handleCurrencyChange = React.useCallback(
    async (selectedCurrency: ICurrencyLookup | null) => {
      // Additional logic when currency changes
      const currencyId = selectedCurrency?.currencyId || 0
      const accountDate = form.getValues("accountDate")

      // Handle currency change with recalculations
      await handleCurrencyChangeWithRecalc(currencyId, accountDate)

      // Update currency comparison state
      updateCurrencyComparison()

      // Check if payTotAmt should be enabled
      const _shouldEnablePayTotAmt = checkPayTotAmtEnable()
    },
    [
      form,
      handleCurrencyChangeWithRecalc,
      checkPayTotAmtEnable,
      updateCurrencyComparison,
    ]
  )

  // ==================== SPECIFIC FIELD HANDLERS ====================

  // Handle totAmt field changes
  const handleTotAmtFieldChange = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const totAmt = parseFloat(e.target.value) || 0
      const exhRate = form.getValues("exhRate") || 0
      const allocTotAmt = form.getValues("allocTotAmt") || 0
      const allocTotLocalAmt = form.getValues("allocTotLocalAmt") || 0

      handleTotAmtChange(totAmt, exhRate, allocTotAmt, allocTotLocalAmt)
    },
    [form, handleTotAmtChange]
  )

  // Handle payTotAmt field changes
  const handlePayTotAmtFieldChange = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const payTotAmt = parseFloat(e.target.value) || 0
      const payExhRate = form.getValues("payExhRate") || 0
      const exhRate = form.getValues("exhRate") || 0
      const allocTotAmt = form.getValues("allocTotAmt") || 0
      const allocTotLocalAmt = form.getValues("allocTotLocalAmt") || 0

      handlePayTotAmtChange(
        payTotAmt,
        payExhRate,
        exhRate,
        allocTotAmt,
        allocTotLocalAmt
      )
    },
    [form, handlePayTotAmtChange]
  )

  // Handle payExhRate field changes
  const handlePayExhRateFieldChange = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const payExhRate = parseFloat(e.target.value) || 0
      const payTotAmt = form.getValues("payTotAmt") || 0
      const exhRate = form.getValues("exhRate") || 0
      const allocTotAmt = form.getValues("allocTotAmt") || 0
      const allocTotLocalAmt = form.getValues("allocTotLocalAmt") || 0

      // Only recalculate if currencies are different
      if (!areCurrenciesSame && payTotAmt > 0) {
        handlePayTotAmtChange(
          payTotAmt,
          payExhRate,
          exhRate,
          allocTotAmt,
          allocTotLocalAmt
        )
      }
    },
    [form, areCurrenciesSame, handlePayTotAmtChange]
  )

  // Handle exchange rate change
  const handleExchangeRateChange = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const exchangeRate = parseFloat(e.target.value) || 0
      recalculateDetailsWithExchangeRate(exchangeRate)
    },
    [recalculateDetailsWithExchangeRate]
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

        {/* Supplier */}
        <CompanySupplierAutocomplete
          form={form}
          name="supplierId"
          label="Supplier"
          isRequired={true}
          onChangeEvent={handleSupplierChange}
          companyId={_companyId}
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

        {/* Payment Type */}
        <PaymentTypeAutocomplete
          form={form}
          name="paymentTypeId"
          label="Payment Type"
          isRequired={true}
          onChangeEvent={handlePaymentTypeChange}
        />

        {/* Cheque No - Only show when payment type is cheque */}
        {isChequePayment && (
          <CustomInput
            form={form}
            name="chequeNo"
            label="Cheque No"
            isRequired={true}
          />
        )}

        {/* Cheque Date - Only show when payment type is cheque */}
        {isChequePayment && (
          <CustomDateNew
            form={form}
            name="chequeDate"
            label="Cheque Date"
            isRequired={true}
            isFutureShow={true}
          />
        )}

        {/* Unallocated Amount */}
        <CustomNumberInput
          form={form}
          name="unAllocTotAmt"
          label="Unallocated Amount"
        />

        {/* Unallocated Local Amount */}
        <CustomNumberInput
          form={form}
          name="unAllocTotLocalAmt"
          label="Unallocated Local Amount"
          isDisabled={true}
        />

        {/* Pay Currency */}
        <CurrencyAutocomplete
          form={form}
          name="payCurrencyId"
          label="Pay Currency"
          isDisabled={areCurrenciesSame}
          onChangeEvent={handlePayCurrencyChange}
        />

        {/* Pay Exchange Rate */}
        <CustomNumberInput
          form={form}
          name="payExhRate"
          label="Pay Exchange Rate"
          isDisabled={areCurrenciesSame}
          onBlurEvent={handlePayExhRateFieldChange}
        />

        {/* Pay Total Amount */}
        <CustomNumberInput
          form={form}
          name="payTotAmt"
          label="Pay Total Amount"
          isDisabled={areCurrenciesSame}
          onBlurEvent={handlePayTotAmtFieldChange}
        />

        {/* Pay Total Local Amount */}
        <CustomNumberInput
          form={form}
          name="payTotLocalAmt"
          label="Pay Total Local Amount"
          isDisabled={areCurrenciesSame}
        />

        {/* Total Amount */}
        <CustomNumberInput
          form={form}
          name="totAmt"
          label="Total Amount"
          round={amtDec}
          isDisabled={!areCurrenciesSame}
          className="text-right"
          onBlurEvent={handleTotAmtFieldChange}
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

        {/* Bank Charge GL */}
        <BankChartOfAccountAutocomplete
          form={form}
          name="bankChgGLId"
          label="Bank Charge GL"
          companyId={_companyId}
        />

        {/* Bank Charges Amount */}
        <CustomNumberInput
          form={form}
          name="bankChgAmt"
          label="Bank Charges Amount"
        />

        {/* Bank Charges Local Amount */}
        <CustomNumberInput
          form={form}
          name="bankChgLocalAmt"
          label="Bank Charges Local Amount"
          isDisabled={true}
        />

        {/* Exchange Gain/Loss */}
        <CustomNumberInput
          form={form}
          name="exhGainLoss"
          label="Exchange Gain/Loss"
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
