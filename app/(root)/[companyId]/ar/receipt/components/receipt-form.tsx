"use client"

import * as React from "react"
import {
  setDueDate,
  setExchangeRate,
  setExchangeRateLocal,
  setRecExchangeRate,
} from "@/helpers/account"
import {
  calculateLocalAmount,
  calculateRecLocalAmount,
  calculateReceiptTotalsFromTotAmt,
  calculateTotAmtFromRecTotAmt,
  recalculateAllAmountsOnExchangeRateChange,
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

  // Helper function to parse numbers with commas
  const parseNumberWithCommas = React.useCallback((value: string): number => {
    // Remove commas and parse as float
    const cleanValue = value.replace(/,/g, "")
    return parseFloat(cleanValue) || 0
  }, [])

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

      // Update currency comparison state after setting recCurrencyId
      // This will enable/disable recExhRate and recTotAmt fields based on currency difference
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

  // Handle exchange rate change - recalculate all local amounts
  const handleExchangeRateChange = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const exhRate = parseNumberWithCommas(e.target.value)
      form.setValue("exhRate", exhRate, { shouldDirty: true })

      // Get current form values
      const totAmt = form.getValues("totAmt") || 0
      const unAllocTotAmt = form.getValues("unAllocTotAmt") || 0
      const dataDetails = form.getValues("data_details") || []

      // Use comprehensive function to recalculate all amounts
      if (dataDetails.length > 0) {
        const recalculatedAmounts = recalculateAllAmountsOnExchangeRateChange(
          dataDetails as unknown as IArReceiptDt[],
          totAmt,
          unAllocTotAmt,
          exhRate,
          decimals[0]
        )

        // Update header amounts
        form.setValue("totLocalAmt", recalculatedAmounts.totLocalAmt, {
          shouldDirty: true,
        })
        form.setValue(
          "unAllocTotLocalAmt",
          recalculatedAmounts.unAllocTotLocalAmt,
          {
            shouldDirty: true,
          }
        )
        form.setValue("exhGainLoss", recalculatedAmounts.totalExhGainLoss, {
          shouldDirty: true,
        })

        // Update details
        form.setValue(
          "data_details",
          recalculatedAmounts.updatedDetails as unknown as ArReceiptDtSchemaType[],
          { shouldDirty: true, shouldTouch: true }
        )
      } else {
        // If no details, just recalculate header amounts
        if (totAmt > 0) {
          const totLocalAmt = calculateLocalAmount(totAmt, exhRate, decimals[0])
          form.setValue("totLocalAmt", totLocalAmt, { shouldDirty: true })
        }

        if (unAllocTotAmt > 0) {
          const unAllocTotLocalAmt = calculateLocalAmount(
            unAllocTotAmt,
            exhRate,
            decimals[0]
          )
          form.setValue("unAllocTotLocalAmt", unAllocTotLocalAmt, {
            shouldDirty: true,
          })
        }
      }
    },
    [form, parseNumberWithCommas, decimals]
  )

  // Handle receipt exchange rate change - recalculate recTotLocalAmt
  const handleRecExchangeRateChange = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const recExhRate = parseNumberWithCommas(e.target.value)
      form.setValue("recExhRate", recExhRate, { shouldDirty: true })

      // Get current recTotAmt
      const recTotAmt = form.getValues("recTotAmt") || 0

      // Recalculate recTotLocalAmt using helper function
      if (recTotAmt > 0) {
        const recTotLocalAmt = calculateRecLocalAmount(
          recTotAmt,
          recExhRate,
          decimals[0]
        )
        form.setValue("recTotLocalAmt", recTotLocalAmt, { shouldDirty: true })
      }
    },
    [form, parseNumberWithCommas, decimals]
  )

  // Handle totAmt change - calculate totLocalAmt and update related amounts
  const handleTotAmtChange = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const totAmt = parseNumberWithCommas(e.target.value)
      const exchangeRate = form.getValues("exhRate") || 0
      const currencyId = form.getValues("currencyId") || 0
      const recCurrencyId = form.getValues("recCurrencyId") || 0

      // Use calculation function from ar-receipt-calculations
      const calculatedAmounts = calculateReceiptTotalsFromTotAmt(
        totAmt,
        exchangeRate,
        decimals[0] || {
          amtDec: 2,
          locAmtDec: 2,
          ctyAmtDec: 2,
          priceDec: 2,
          qtyDec: 2,
          exhRateDec: 4,
          dateFormat: "DD/MM/YYYY",
          longDateFormat: "DD/MM/YYYY",
        }
      )

      // Update calculated amounts
      form.setValue("totLocalAmt", calculatedAmounts.totLocalAmt, {
        shouldDirty: true,
      })

      // Only update recTotAmt if currencies are the same (manual entry case)
      // This prevents circular dependencies when currencies are different
      if (currencyId === recCurrencyId) {
        form.setValue("recTotAmt", calculatedAmounts.recTotAmt, {
          shouldDirty: true,
        })
        form.setValue("recTotLocalAmt", calculatedAmounts.recTotLocalAmt, {
          shouldDirty: true,
        })
      }

      form.setValue("unAllocTotAmt", calculatedAmounts.unAllocTotAmt, {
        shouldDirty: true,
      })
      form.setValue(
        "unAllocTotLocalAmt",
        calculatedAmounts.unAllocTotLocalAmt,
        { shouldDirty: true }
      )
    },
    [form, parseNumberWithCommas, decimals]
  )

  // Handle unAllocTotAmt change - calculate unAllocTotLocalAmt
  const handleUnAllocTotAmtChange = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const unAllocTotAmt = parseNumberWithCommas(e.target.value)
      const exchangeRate = form.getValues("exhRate") || 0

      // Use calculation function from ar-receipt-calculations
      const unAllocTotLocalAmt = calculateLocalAmount(
        unAllocTotAmt,
        exchangeRate,
        decimals[0] || {
          amtDec: 2,
          locAmtDec: 2,
          ctyAmtDec: 2,
          priceDec: 2,
          qtyDec: 2,
          exhRateDec: 4,
          dateFormat: "DD/MM/YYYY",
          longDateFormat: "DD/MM/YYYY",
        }
      )

      // Update unAllocTotLocalAmt
      form.setValue("unAllocTotLocalAmt", unAllocTotLocalAmt, {
        shouldDirty: true,
      })
    },
    [form, parseNumberWithCommas, decimals]
  )

  // Handle recTotAmt change - calculate recTotLocalAmt and update related amounts
  const handleRecTotAmtChange = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const recTotAmt = parseNumberWithCommas(e.target.value)
      console.log("recTotAmt", recTotAmt)
      const recExchangeRate = form.getValues("recExhRate") || 0
      const exhRate = form.getValues("exhRate") || 0

      // Calculate recTotLocalAmt using receipt exchange rate with proper rounding
      const recTotLocalAmt = calculateRecLocalAmount(
        recTotAmt,
        recExchangeRate,
        decimals[0]
      )

      // Update recTotLocalAmt
      form.setValue("recTotLocalAmt", recTotLocalAmt, { shouldDirty: true })

      // Get current totAmt to check if we're in proportional allocation mode
      const currentTotAmt = form.getValues("totAmt") || 0

      // Only update totAmt if we're not in proportional allocation mode (totAmt > 0)
      // This prevents circular dependency during auto allocation
      if (currentTotAmt === 0) {
        // Use calculation function from ar-receipt-calculations
        const calculatedAmounts = calculateTotAmtFromRecTotAmt(
          recTotAmt,
          recExchangeRate,
          exhRate,
          decimals[0] || {
            amtDec: 2,
            locAmtDec: 2,
            ctyAmtDec: 2,
            priceDec: 2,
            qtyDec: 2,
            exhRateDec: 4,
            dateFormat: "DD/MM/YYYY",
            longDateFormat: "DD/MM/YYYY",
          }
        )

        // Update all calculated amounts
        form.setValue("totAmt", calculatedAmounts.totAmt, { shouldDirty: true })
        form.setValue("totLocalAmt", calculatedAmounts.totLocalAmt, {
          shouldDirty: true,
        })
        form.setValue("unAllocTotAmt", calculatedAmounts.unAllocTotAmt, {
          shouldDirty: true,
        })
        form.setValue(
          "unAllocTotLocalAmt",
          calculatedAmounts.unAllocTotLocalAmt,
          {
            shouldDirty: true,
          }
        )
      }
    },
    [form, parseNumberWithCommas, decimals]
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
        <CustomDateNew
          form={form}
          name="accountDate"
          label="Account Date"
          isRequired={true}
          onChangeEvent={handleAccountDateChange}
          isFutureShow={false}
        />

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
          onBlurEvent={handleUnAllocTotAmtChange}
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

        {/* Pay Exchange Rate - Enabled when currencies are different */}
        <CustomNumberInput
          form={form}
          name="recExhRate"
          label="Rec Exchange Rate"
          isRequired={true}
          round={exhRateDec}
          className="text-right"
          isDisabled={isCurrenciesEqual}
          onBlurEvent={handleRecExchangeRateChange}
        />

        {/* Pay Total Amount - Enabled when currencies are different */}
        <CustomNumberInput
          form={form}
          name="recTotAmt"
          label="Rec Total Amount"
          isDisabled={isCurrenciesEqual}
          onBlurEvent={handleRecTotAmtChange}
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
          isDisabled={!isCurrenciesEqual}
          className="text-right"
          onBlurEvent={handleTotAmtChange}
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
