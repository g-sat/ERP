"use client"

import * as React from "react"
import {
  setDueDate,
  setExchangeRate,
  setExchangeRateLocal,
  setRecExchangeRate,
} from "@/helpers/account"
import {
  calauteLocalAmtandGainLoss,
  calculateDiffCurrency,
  calculateSameCurrency,
  calculateUnallocated,
} from "@/helpers/ar-receipt-calculations"
import { IArReceiptDt } from "@/interfaces"
import {
  IBankLookup,
  ICurrencyLookup,
  ICustomerLookup,
  IJobOrderLookup,
  IPaymentTypeLookup,
} from "@/interfaces/lookup"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import { ArReceiptDtSchemaType, ArReceiptHdSchemaType } from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { FormProvider, UseFormReturn } from "react-hook-form"

import { parseNumberWithCommas } from "@/lib/utils"
import { useGetDynamicLookup, usePaymentTypeLookup } from "@/hooks/use-lookup"
import {
  BankAutocomplete,
  BankChartOfAccountAutocomplete,
  CurrencyAutocomplete,
  CustomerAutocomplete,
  DynamicCustomerAutocomplete,
  JobOrderCustomerAutocomplete,
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
  isCancelled?: boolean
  dataDetails?: ArReceiptDtSchemaType[]
}

export default function ReceiptForm({
  form,
  onSuccessAction,
  isEdit,
  visible,
  required,
  companyId: _companyId,
  isCancelled = false,
  dataDetails = [],
}: ReceiptFormProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const exhRateDec = decimals[0]?.exhRateDec || 6

  const { data: dynamicLookup } = useGetDynamicLookup()
  const isDynamicCustomer = dynamicLookup?.isCustomer ?? false

  const { data: paymentTypes = [] } = usePaymentTypeLookup()

  // State to track if currencies are the same
  const [isCurrenciesEqual, setIsCurrenciesEqual] = React.useState(true)

  // State to track if receipt type is cheque
  const [isChequeReceipt, setIsChequeReceipt] = React.useState(false)

  // Function to update currency comparison state
  const updateCurrencyComparison = React.useCallback(() => {
    const currencyId = form.getValues("currencyId") || 0
    const recCurrencyId = form.getValues("recCurrencyId") || 0
    const currenciesMatch = currencyId === recCurrencyId
    setIsCurrenciesEqual(currenciesMatch)
    return currenciesMatch
  }, [form])

  // Common function to recalculate amounts based on currency comparison
  const recalculateAmountsBasedOnCurrency = React.useCallback(() => {
    const currencyId = form.getValues("currencyId") || 0
    const recCurrencyId = form.getValues("recCurrencyId") || 0
    const totAmt = form.getValues("totAmt") || 0
    const recTotAmt = form.getValues("recTotAmt") || 0
    const exhRate = form.getValues("exhRate") || 0
    const recExhRate = form.getValues("recExhRate") || 0
    const allocTotAmt = form.getValues("allocTotAmt") || 0
    const allocTotLocalAmt = form.getValues("allocTotLocalAmt") || 0

    if (currencyId === recCurrencyId) {
      // Same currency scenario - totAmt drives everything
      const {
        totLocalAmt: newTotLocalAmt,
        recTotAmt: newRecTotAmt,
        recTotLocalAmt: newRecTotLocalAmt,
      } = calculateSameCurrency(totAmt || 0, exhRate || 0, decimals[0])
      form.setValue("recTotAmt", newRecTotAmt, { shouldDirty: true })
      form.setValue("recTotLocalAmt", newRecTotLocalAmt, {
        shouldDirty: true,
      })
      form.setValue("totLocalAmt", newTotLocalAmt, { shouldDirty: true })

      // Calculate unallocated amounts
      const { unAllocAmt, unAllocLocalAmt } = calculateUnallocated(
        totAmt,
        newTotLocalAmt,
        allocTotAmt,
        allocTotLocalAmt,
        decimals[0]
      )
      form.setValue("unAllocTotAmt", unAllocAmt, { shouldDirty: true })
      form.setValue("unAllocTotLocalAmt", unAllocLocalAmt, {
        shouldDirty: true,
      })
    } else {
      if (totAmt > 0) {
        form.setValue("recTotAmt", totAmt, { shouldDirty: true })
      } else {
        form.setValue("recTotAmt", 0, { shouldDirty: true })
      }

      // Different currency scenario - recTotAmt drives everything
      const {
        recTotAmt: newRecTotAmt,
        recTotLocalAmt: newRecTotLocalAmt,
        totAmt: newTotAmt,
        totLocalAmt: newTotLocalAmt,
      } = calculateDiffCurrency(
        recTotAmt || 0,
        recExhRate,
        exhRate,
        decimals[0]
      )

      form.setValue("recTotAmt", newRecTotAmt, { shouldDirty: true })
      form.setValue("recTotLocalAmt", newRecTotLocalAmt, {
        shouldDirty: true,
      })
      form.setValue("totAmt", newTotAmt, { shouldDirty: true })
      form.setValue("totLocalAmt", newTotLocalAmt, { shouldDirty: true })

      // Calculate unallocated amounts
      const { unAllocAmt, unAllocLocalAmt } = calculateUnallocated(
        newTotAmt,
        newTotLocalAmt,
        allocTotAmt,
        allocTotLocalAmt,
        decimals[0]
      )
      form.setValue("unAllocTotAmt", unAllocAmt, { shouldDirty: true })
      form.setValue("unAllocTotLocalAmt", unAllocLocalAmt, {
        shouldDirty: true,
      })
    }

    // Recalculate all details with new exchange rate if data details exist
    if (dataDetails && dataDetails.length > 0) {
      const updatedDetails = [...dataDetails]
      const arr = updatedDetails as unknown as IArReceiptDt[]
      const exhRateForDetails = form.getValues("exhRate") || 0
      const dec = decimals[0] || { amtDec: 2, locAmtDec: 2 }

      for (let i = 0; i < arr.length; i++) {
        calauteLocalAmtandGainLoss(arr, i, exhRateForDetails, dec)
      }

      // Recalculate header totals from recalculated details
      const sumAllocAmt = arr.reduce((s, r) => s + (Number(r.allocAmt) || 0), 0)
      const sumAllocLocalAmt = arr.reduce(
        (s, r) => s + (Number(r.allocLocalAmt) || 0),
        0
      )
      const sumExhGainLoss = arr.reduce(
        (s, r) => s + (Number(r.exhGainLoss) || 0),
        0
      )

      form.setValue("data_details", updatedDetails, {
        shouldDirty: true,
        shouldTouch: true,
      })
      form.setValue("allocTotAmt", sumAllocAmt, { shouldDirty: true })
      form.setValue("allocTotLocalAmt", sumAllocLocalAmt, { shouldDirty: true })
      form.setValue("exhGainLoss", sumExhGainLoss, { shouldDirty: true })

      // Recalculate unallocated amounts with updated totals
      const currentTotAmt = form.getValues("totAmt") || 0
      const currentTotLocalAmt = form.getValues("totLocalAmt") || 0
      const { unAllocAmt, unAllocLocalAmt } = calculateUnallocated(
        currentTotAmt,
        currentTotLocalAmt,
        sumAllocAmt,
        sumAllocLocalAmt,
        dec
      )
      form.setValue("unAllocTotAmt", unAllocAmt, { shouldDirty: true })
      form.setValue("unAllocTotLocalAmt", unAllocLocalAmt, {
        shouldDirty: true,
      })
    }
  }, [form, decimals, dataDetails])

  // Initialize currency comparison state on component mount and form changes
  React.useEffect(() => {
    updateCurrencyComparison()
  }, [updateCurrencyComparison])

  // Watch currency values and update comparison when they change
  const currencyId = form.watch("currencyId")
  const recCurrencyId = form.watch("recCurrencyId")

  React.useEffect(() => {
    updateCurrencyComparison()

    // When currencies are equal, set recExhRate = exhRate
    if (currencyId === recCurrencyId && currencyId > 0) {
      const exhRate = form.getValues("exhRate") || 0
      form.setValue("recExhRate", exhRate, { shouldDirty: true })
    }
  }, [currencyId, recCurrencyId, updateCurrencyComparison, form])

  // Watch exhRate and sync to recExhRate when currencies are equal
  const exhRate = form.watch("exhRate")

  React.useEffect(() => {
    if (currencyId === recCurrencyId && currencyId > 0 && exhRate > 0) {
      form.setValue("recExhRate", exhRate, { shouldDirty: true })
    }
  }, [exhRate, currencyId, recCurrencyId, form])

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

  // Handle bank selection
  const handleBankChange = React.useCallback(
    async (selectedBank: IBankLookup | null) => {
      const recCurrencyId = selectedBank?.currencyId || 0

      // Update recCurrencyId from bank's currency
      form.setValue("recCurrencyId", recCurrencyId)

      if (selectedBank && recCurrencyId > 0) {
        // Only call setRecExchangeRate if currency is available
        await setRecExchangeRate(form, exhRateDec)
        form.trigger("recExhRate")
      } else {
        // If no bank selected or no currency, set exchange rate to zero
        form.setValue("recExhRate", 0)
      }

      // Update currency comparison state after setting recCurrencyId
      // This will enable/disable recExhRate and recTotAmt fields based on currency difference
      updateCurrencyComparison()
    },
    [exhRateDec, form, updateCurrencyComparison]
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

  // Handle job order change
  const handleJobOrderChange = React.useCallback(
    (selectedJobOrder: IJobOrderLookup | null) => {
      if (selectedJobOrder) {
        form.setValue("jobOrderId", selectedJobOrder.jobOrderId || 0)
        form.setValue("jobOrderNo", selectedJobOrder.jobOrderNo || "")
      } else {
        form.setValue("jobOrderId", 0)
        form.setValue("jobOrderNo", "")
      }
    },
    [form]
  )

  // Handle pay currency change
  const handleRecCurrencyChange = React.useCallback(
    async (selectedCurrency: ICurrencyLookup | null) => {
      const recCurrencyId = selectedCurrency?.currencyId || 0
      const currencyId = form.getValues("currencyId") || 0

      form.setValue("recCurrencyId", recCurrencyId)

      if (recCurrencyId > 0 && recCurrencyId !== currencyId) {
        await setRecExchangeRate(form, exhRateDec)
      } else if (recCurrencyId > 0 && recCurrencyId === currencyId) {
        const exhRate = form.getValues("exhRate") || 0
        form.setValue("recExhRate", exhRate, { shouldDirty: true })
      } else {
        form.setValue("recExhRate", 0)
      }

      // Recalculate all amounts based on currency comparison
      recalculateAmountsBasedOnCurrency()
    },
    [form, exhRateDec, recalculateAmountsBasedOnCurrency]
  )

  // Handle currency selection
  const handleCurrencyChange = React.useCallback(
    async (selectedCurrency: ICurrencyLookup | null) => {
      const currencyId = selectedCurrency?.currencyId || 0
      form.setValue("currencyId", currencyId, { shouldDirty: true })

      if (currencyId && accountDate) {
        // First update exchange rates
        await setExchangeRate(form, exhRateDec, visible)

        // Recalculate all amounts based on currency comparison
        recalculateAmountsBasedOnCurrency()
      }
    },
    [form, exhRateDec, visible, accountDate, recalculateAmountsBasedOnCurrency]
  )

  // Handle exchange rate change
  const handleExchangeRateChange = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const exhRate = parseNumberWithCommas(e.target.value)
      form.setValue("exhRate", exhRate, { shouldDirty: true })

      // Recalculate all amounts based on currency comparison
      recalculateAmountsBasedOnCurrency()
    },
    [form, recalculateAmountsBasedOnCurrency]
  )

  // Handle receipt exchange rate change
  const handleRecExchangeRateChange = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const recExhRate = parseNumberWithCommas(e.target.value)
      form.setValue("recExhRate", recExhRate, { shouldDirty: true })

      // Recalculate all amounts based on currency comparison
      recalculateAmountsBasedOnCurrency()
    },
    [form, recalculateAmountsBasedOnCurrency]
  )

  // Handle totAmt change
  const handleTotAmtChange = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const totAmt = parseNumberWithCommas(e.target.value)
      form.setValue("totAmt", totAmt, { shouldDirty: true })

      // Recalculate all amounts based on currency comparison
      recalculateAmountsBasedOnCurrency()
    },
    [form, recalculateAmountsBasedOnCurrency]
  )

  // Handle recTotAmt change
  const handleRecTotAmtChange = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const recTotAmt = parseNumberWithCommas(e.target.value)
      form.setValue("recTotAmt", recTotAmt, { shouldDirty: true })

      // Recalculate all amounts based on currency comparison
      recalculateAmountsBasedOnCurrency()
    },
    [form, recalculateAmountsBasedOnCurrency]
  )

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`grid grid-cols-8 gap-1 rounded-md p-2 ${
          isCancelled ? "pointer-events-none opacity-50" : ""
        }`}
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

        {/* Customer by company*/}
        {/* <CompanyCustomerAutocomplete
            form={form}
            name="customerId"
            label="Customer"
            isRequired={true}
            onChangeEvent={handleCustomerChange}
            companyId={_companyId}
          /> */}

        {/* Customer */}
        {isDynamicCustomer ? (
          <DynamicCustomerAutocomplete
            form={form}
            name="customerId"
            label="Customer"
            isRequired={true}
            onChangeEvent={handleCustomerChange}
            className="col-span-2"
            isDisabled={dataDetails.length > 0}
          />
        ) : (
          <CustomerAutocomplete
            form={form}
            name="customerId"
            label="Customer"
            isRequired={true}
            onChangeEvent={handleCustomerChange}
            className="col-span-2"
            isDisabled={dataDetails.length > 0}
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

        {/* Unallocated Amount - Always read-only */}
        <CustomNumberInput
          form={form}
          name="unAllocTotAmt"
          label="Unallocated Amount"
          isDisabled={true}
        />

        {/* Unallocated Local Amount - Always read-only */}
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

        {/* Pay Total Amount - Read-only when currencies are equal */}
        <CustomNumberInput
          form={form}
          name="recTotAmt"
          label="Rec Total Amount"
          isDisabled={isCurrenciesEqual}
          onBlurEvent={handleRecTotAmtChange}
        />

        {/* Pay Total Local Amount - Always read-only */}
        <CustomNumberInput
          form={form}
          name="recTotLocalAmt"
          label="Rec Total Local Amount"
          isDisabled={true}
        />

        {/* Total Amount - Read-only when currencies are different */}
        <CustomNumberInput
          form={form}
          name="totAmt"
          label="Total Amount"
          round={amtDec}
          isDisabled={!isCurrenciesEqual}
          className="text-right"
          onBlurEvent={handleTotAmtChange}
        />

        {/* Total Local Amount - Always read-only */}
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

        {visible?.m_JobOrderIdHd && (
          <JobOrderCustomerAutocomplete
            form={form}
            name="jobOrderId"
            label="Job Order"
            onChangeEvent={handleJobOrderChange}
            customerId={form.getValues("customerId") || 0}
            jobOrderId={form.getValues("jobOrderId") || 0}
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
      </form>
    </FormProvider>
  )
}
