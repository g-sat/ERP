"use client"

import * as React from "react"
import {
  setDueDate,
  setExchangeRate,
  setExchangeRateLocal,
  setRecExchangeRate,
} from "@/helpers/account"
import {
  calculateLocalAmounts,
  calculateTotalAmounts,
  recalculateAllDetailAmounts,
} from "@/helpers/ar-receipt-calculations"
import { IArReceiptDt } from "@/interfaces"
import {
  IBankLookup,
  ICurrencyLookup,
  ICustomerLookup,
  IPaymentTypeLookup,
} from "@/interfaces/lookup"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import { ArReceiptDtSchemaType, ArReceiptHdSchemaType } from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { FormProvider, UseFormReturn } from "react-hook-form"

import { usePaymentTypeLookup } from "@/hooks/use-lookup"
import {
  BankAutocomplete,
  BankChartOfAccountAutocomplete,
  CompanyCustomerAutocomplete,
  CurrencyAutocomplete,
  PaymentTypeAutocomplete,
} from "@/components/autocomplete"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import CustomInput from "@/components/custom/custom-input"
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomTextarea from "@/components/custom/custom-textarea"

interface ReceiptFormProps {
  form: UseFormReturn<ArReceiptHdSchemaType>
  onSuccessAction: (action: string) => Promise<void>
  isEdit: boolean
  visible: IVisibleFields
  required: IMandatoryFields
  companyId: number
}

export default function ReceiptForm({
  form,
  onSuccessAction,
  isEdit,
  visible,
  required,
  companyId: _companyId,
}: ReceiptFormProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const exhRateDec = decimals[0]?.exhRateDec || 6

  const { data: paymentTypes = [] } = usePaymentTypeLookup()

  // State to track if currencies are the same
  const [isCurrenciesEqual, setIsCurrenciesEqual] = React.useState(true)

  // State to track if receipt type is cheque
  const [isChequeReceipt, setIsChequeReceipt] = React.useState(false)

  // Ref to prevent infinite loops during programmatic updates
  const isUpdatingRef = React.useRef(false)

  // Function to check currency comparison without setting state
  const checkCurrencyComparison = React.useCallback(() => {
    const currencyId = form.getValues("currencyId") || 0
    const recCurrencyId = form.getValues("recCurrencyId") || 0
    const isEqual = currencyId === recCurrencyId
    // Return true if both are zero OR if they are the same (and not zero)
    return isEqual
  }, [form])

  // Function to update currency comparison state
  const updateCurrencyComparison = React.useCallback(() => {
    const currenciesMatch = checkCurrencyComparison()
    setIsCurrenciesEqual(currenciesMatch)
    return currenciesMatch
  }, [checkCurrencyComparison])

  // Initialize currency comparison state on component mount and form changes
  React.useEffect(() => {
    updateCurrencyComparison()
  }, [updateCurrencyComparison])

  // Watch currency values and update comparison when they change
  const currencyId = form.watch("currencyId")
  const recCurrencyId = form.watch("recCurrencyId")

  React.useEffect(() => {
    updateCurrencyComparison()
  }, [currencyId, recCurrencyId, updateCurrencyComparison])

  // Watch paymentTypeId and update cheque receipt state
  React.useEffect(() => {
    const paymentTypeId = form.watch("paymentTypeId")

    if (paymentTypeId && paymentTypes.length > 0) {
      const selectedPaymentType = paymentTypes.find(
        (pt: IPaymentTypeLookup) => pt.paymentTypeId === paymentTypeId
      )

      if (selectedPaymentType) {
        const isCheque =
          selectedPaymentType.paymentTypeName
            ?.toLowerCase()
            .includes("cheque") ||
          selectedPaymentType.paymentTypeCode?.toLowerCase().includes("cheque")

        setIsChequeReceipt(isCheque)
      } else {
        setIsChequeReceipt(false)
      }
    } else {
      setIsChequeReceipt(false)
    }
  }, [form, paymentTypes])

  // Watch totAmt and auto-clear related fields when set to 0
  const totAmt = form.watch("totAmt")

  React.useEffect(() => {
    // Step 1: Check if totAmt is 0
    if (totAmt === 0) {
      // Step 2: Clear all related total fields
      form.setValue("totLocalAmt", 0, { shouldDirty: true })
      form.setValue("recTotAmt", 0, { shouldDirty: true })
      form.setValue("recTotLocalAmt", 0, { shouldDirty: true })
    }
  }, [totAmt, form])

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

  // Handle account date selection
  const handleAccountDateChange = React.useCallback(
    async (_selectedAccountDate: Date | null) => {
      await setExchangeRate(form, exhRateDec, visible)
      await setRecExchangeRate(form, exhRateDec)
    },
    [exhRateDec, form, visible]
  )

  // Handle customer selection
  const handleCustomerChange = React.useCallback(
    async (selectedCustomer: ICustomerLookup | null) => {
      if (selectedCustomer) {
        // ✅ Customer selected - populate related fields
        if (!isEdit) {
          form.setValue("currencyId", selectedCustomer.currencyId || 0)
          form.setValue("recCurrencyId", selectedCustomer.currencyId || 0)
          form.setValue("bankId", selectedCustomer.bankId || 0)
        }

        await setDueDate(form)

        // Only set exchange rates if currency is available
        if (selectedCustomer.currencyId > 0) {
          await setExchangeRate(form, exhRateDec, visible)
          await setRecExchangeRate(form, exhRateDec)
        } else {
          // If no currency, set exchange rates to zero
          form.setValue("exhRate", 0)
          form.setValue("recExhRate", 0)
        }

        // Update currency comparison state
        updateCurrencyComparison()
      } else {
        // ✅ Customer cleared - reset all related fields
        if (!isEdit) {
          // Clear customer-related fields
          form.setValue("currencyId", 0)
          form.setValue("recCurrencyId", 0)
          form.setValue("bankId", 0)
        }

        // Clear exchange rates
        form.setValue("exhRate", 0)
        form.setValue("recExhRate", 0)

        // Update currency comparison state
        updateCurrencyComparison()

        // Trigger validation
        form.trigger()
      }
    },
    [exhRateDec, form, isEdit, visible, updateCurrencyComparison]
  )

  // Common function to check if recTotAmt should be enabled
  const checkPayTotAmtEnable = React.useCallback(() => {
    const currencyId = form.getValues("currencyId") || 0
    const recCurrencyId = form.getValues("recCurrencyId") || 0
    return currencyId !== recCurrencyId
  }, [form])

  // Handle bank selection
  const handleBankChange = React.useCallback(
    async (selectedBank: IBankLookup | null) => {
      const recCurrencyId = selectedBank?.currencyId || 0

      // Update recCurrencyId from bank's currency
      form.setValue("recCurrencyId", recCurrencyId)

      if (selectedBank && recCurrencyId > 0) {
        // Only call setRecExchangeRate if currency is available
        await setRecExchangeRate(form, exhRateDec)
      } else {
        // If no bank selected or no currency, set exchange rate to zero
        form.setValue("recExhRate", 0)
      }

      // Update currency comparison state
      updateCurrencyComparison()

      // Check if recTotAmt should be enabled
      checkPayTotAmtEnable()
    },
    [exhRateDec, form, checkPayTotAmtEnable, updateCurrencyComparison]
  )

  // Handle pay currency change
  const handleRecCurrencyChange = React.useCallback(
    async (selectedCurrency: ICurrencyLookup | null) => {
      const recCurrencyId = selectedCurrency?.currencyId || 0
      form.setValue("recCurrencyId", recCurrencyId)

      if (selectedCurrency && recCurrencyId > 0) {
        // Only call setRecExchangeRate if currency is available
        await setRecExchangeRate(form, exhRateDec)
      } else {
        // If no currency selected, set exchange rate to zero
        form.setValue("recExhRate", 0)
      }

      // Update currency comparison state
      updateCurrencyComparison()

      // Check if recTotAmt should be enabled
      checkPayTotAmtEnable()
    },
    [exhRateDec, form, checkPayTotAmtEnable, updateCurrencyComparison]
  )

  // Handle receipt type change
  const handlePaymentTypeChange = React.useCallback(
    (selectedReceiptType: IPaymentTypeLookup | null) => {
      if (selectedReceiptType) {
        // Check if receipt type is "Cheque"
        const isCheque =
          selectedReceiptType?.paymentTypeName
            ?.toLowerCase()
            .includes("cheque") ||
          selectedReceiptType?.paymentTypeCode?.toLowerCase().includes("cheque")

        setIsChequeReceipt(isCheque)

        // Clear cheque fields if not cheque receipt
        if (!isCheque) {
          form.setValue("chequeNo", "")
          form.setValue("chequeDate", "")
        }
      } else {
        // No receipt type selected, hide cheque fields
        setIsChequeReceipt(false)
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
      formDetails as unknown as IArReceiptDt[],
      amtDec
    )
    form.setValue("totAmt", totals.totAmt)

    // Calculate local currency totals (always calculate)
    const localAmounts = calculateLocalAmounts(
      formDetails as unknown as IArReceiptDt[],
      locAmtDec
    )
    form.setValue("totLocalAmt", localAmounts.totLocalAmt)
  }, [amtDec, form, locAmtDec])

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

        // Recalculate all details with new exchange rates
        const updatedDetails = recalculateAllDetailAmounts(
          formDetails as unknown as IArReceiptDt[],
          exchangeRate,
          decimals[0]
        )

        // Update form with recalculated details
        form.setValue(
          "data_details",
          updatedDetails as unknown as ArReceiptDtSchemaType[],
          { shouldDirty: true, shouldTouch: true }
        )
      }

      // Update currency comparison state
      updateCurrencyComparison()

      // Check if recTotAmt should be enabled
      checkPayTotAmtEnable()
    },
    [
      decimals,
      exhRateDec,
      form,
      visible,
      checkPayTotAmtEnable,
      updateCurrencyComparison,
    ]
  )

  // Handle exchange rate change
  const handleExchangeRateChange = React.useCallback(
    (value: number) => {
      form.setValue("exhRate", value, { shouldDirty: true })
    },
    [form]
  )

  // Handle totAmt change - calculate totLocalAmt and update related amounts
  const handleTotAmtChange = React.useCallback(
    (value: number) => {
      // Prevent infinite loops
      if (isUpdatingRef.current) return

      isUpdatingRef.current = true

      const exchangeRate = form.getValues("exhRate") || 0

      // Calculate totLocalAmt using exchange rate with proper rounding
      const totLocalAmt = Math.round(value * exchangeRate * 100) / 100

      // Update totLocalAmt
      form.setValue("totLocalAmt", totLocalAmt, { shouldDirty: true })

      // Update recTotAmt = totAmt
      form.setValue("recTotAmt", value, { shouldDirty: true })

      // Update recTotLocalAmt = totLocalAmt
      form.setValue("recTotLocalAmt", totLocalAmt, { shouldDirty: true })

      // Update unAllocTotAmt = totAmt
      form.setValue("unAllocTotAmt", value, { shouldDirty: true })

      // Update unAllocTotLocalAmt = totLocalAmt
      form.setValue("unAllocTotLocalAmt", totLocalAmt, { shouldDirty: true })

      // Reset flag after a short delay
      setTimeout(() => {
        isUpdatingRef.current = false
      }, 0)
    },
    [form]
  )

  // Handle unAllocTotAmt change - calculate unAllocTotLocalAmt
  const handleUnAllocTotAmtChange = React.useCallback(
    (value: number) => {
      // Prevent infinite loops
      if (isUpdatingRef.current) return

      isUpdatingRef.current = true

      const exchangeRate = form.getValues("exhRate") || 0

      // Calculate unAllocTotLocalAmt using exchange rate with proper rounding
      const unAllocTotLocalAmt = Math.round(value * exchangeRate * 100) / 100

      // Update unAllocTotLocalAmt
      form.setValue("unAllocTotLocalAmt", unAllocTotLocalAmt, {
        shouldDirty: true,
      })

      // Reset flag after a short delay
      setTimeout(() => {
        isUpdatingRef.current = false
      }, 0)
    },
    [form]
  )

  // Handle recTotAmt change - calculate recTotLocalAmt and update related amounts
  const handleRecTotAmtChange = React.useCallback(
    (value: number) => {
      // Prevent infinite loops
      if (isUpdatingRef.current) return

      isUpdatingRef.current = true

      const recExchangeRate = form.getValues("recExhRate") || 0
      const exhRate = form.getValues("exhRate") || 0

      // Calculate recTotLocalAmt using receipt exchange rate with proper rounding
      const recTotLocalAmt = Math.round(value * recExchangeRate * 100) / 100

      // Update recTotLocalAmt
      form.setValue("recTotLocalAmt", recTotLocalAmt, { shouldDirty: true })

      // Calculate totAmt = recTotLocalAmt / exhRate with proper rounding
      const totAmt =
        exhRate > 0 ? Math.round((recTotLocalAmt / exhRate) * 100) / 100 : 0

      // Update totAmt
      form.setValue("totAmt", totAmt, { shouldDirty: true })

      // Update totLocalAmt = recTotLocalAmt
      form.setValue("totLocalAmt", recTotLocalAmt, { shouldDirty: true })

      // Update unAllocTotAmt = totAmt
      form.setValue("unAllocTotAmt", totAmt, { shouldDirty: true })

      // Update unAllocTotLocalAmt = totLocalAmt
      form.setValue("unAllocTotLocalAmt", recTotLocalAmt, { shouldDirty: true })

      // Reset flag after a short delay
      setTimeout(() => {
        isUpdatingRef.current = false
      }, 0)
    },
    [form]
  )

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-8 gap-1 rounded-md p-2"
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

        {/* Customer */}
        <CompanyCustomerAutocomplete
          form={form}
          name="customerId"
          label="Customer"
          isRequired={true}
          onChangeEvent={handleCustomerChange}
          companyId={_companyId}
          className="col-span-2"
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
          onChangeEvent={handleExchangeRateChange}
        />

        {/* Payment Type */}
        <PaymentTypeAutocomplete
          form={form}
          name="paymentTypeId"
          label="Payment Type"
          isRequired={true}
          onChangeEvent={handlePaymentTypeChange}
        />

        {/* Cheque No - Only show when receipt type is cheque */}
        {isChequeReceipt && (
          <CustomInput
            form={form}
            name="chequeNo"
            label="Cheque No"
            isRequired={true}
          />
        )}

        {/* Cheque Date - Only show when receipt type is cheque */}
        {isChequeReceipt && (
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
          onChangeEvent={handleUnAllocTotAmtChange}
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
          name="recCurrencyId"
          label="Rec Currency"
          onChangeEvent={handleRecCurrencyChange}
        />

        {/* Pay Exchange Rate */}
        <CustomNumberInput
          form={form}
          name="recExhRate"
          label="Rec Exchange Rate"
          isRequired={true}
          round={exhRateDec}
          className="text-right"
          isDisabled={isCurrenciesEqual}
        />

        {/* Pay Total Amount */}
        <CustomNumberInput
          form={form}
          name="recTotAmt"
          label="Rec Total Amount"
          isDisabled={isCurrenciesEqual}
          onChangeEvent={handleRecTotAmtChange}
        />

        {/* Pay Total Local Amount */}
        <CustomNumberInput
          form={form}
          name="recTotLocalAmt"
          label="Rec Total Local Amount"
          isDisabled={true}
        />

        {/* Total Amount */}
        <CustomNumberInput
          form={form}
          name="totAmt"
          label="Total Amount"
          round={amtDec}
          //isDisabled={!isCurrenciesEqual}
          className="text-right"
          onChangeEvent={handleTotAmtChange}
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
