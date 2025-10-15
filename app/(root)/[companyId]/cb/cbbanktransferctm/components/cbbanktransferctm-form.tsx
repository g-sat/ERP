"use client"

import * as React from "react"
import {
  IBankLookup,
  ICurrencyLookup,
  IPaymentTypeLookup,
} from "@/interfaces/lookup"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import { CbBankTransferCtmHdSchemaType } from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { PlusIcon } from "lucide-react"
import { FormProvider, UseFormReturn } from "react-hook-form"

import { usePaymentTypeLookup } from "@/hooks/use-lookup"
import {
  BankAutocomplete,
  BankChartOfAccountAutocomplete,
  CurrencyAutocomplete,
} from "@/components/autocomplete"
import PaymentTypeAutocomplete from "@/components/autocomplete/autocomplete-paymenttype"
import PayeeSelectionDialog from "@/components/common/payee-selection-dialog"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import CustomInput from "@/components/custom/custom-input"
import CustomInputGroup from "@/components/custom/custom-input-group"
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomTextarea from "@/components/custom/custom-textarea"

interface BankTransferCtmFormProps {
  form: UseFormReturn<CbBankTransferCtmHdSchemaType>
  onSuccessAction: (action: string) => Promise<void>
  isEdit: boolean
  visible: IVisibleFields
  required: IMandatoryFields
  companyId: number
}

export default function BankTransferCtmForm({
  form,
  onSuccessAction,
  isEdit: _isEdit,
  visible,
  required,
  companyId: _companyId,
}: BankTransferCtmFormProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const exhRateDec = decimals[0]?.exhRateDec || 6

  const { data: paymentTypes = [] } = usePaymentTypeLookup()

  // State to track if payment type is cheque
  const [isChequePayment, setIsChequePayment] = React.useState(false)

  // State to control payee selection dialog
  const [isPayeeDialogOpen, setIsPayeeDialogOpen] = React.useState(false)

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

  const onSubmit = async () => {
    await onSuccessAction("save")
  }

  // Handle transaction date selection
  const handleTrnDateChange = React.useCallback(
    async (_selectedTrnDate: Date | null) => {
      const { trnDate } = form?.getValues()
      form.setValue("accountDate", trnDate)
      form?.trigger("accountDate")
    },
    [form]
  )

  // Handle account date change
  const handleAccountDateChange = React.useCallback(
    async (_selectedAccountDate: Date | null) => {
      const { accountDate } = form?.getValues()
      // Update chequeDate to accountDate if not cheque payment
      if (!isChequePayment) {
        form.setValue("chequeDate", accountDate)
        form?.trigger("chequeDate")
      }
    },
    [form, isChequePayment]
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

        // Set chequeDate to accountDate if not cheque payment
        if (!isCheque) {
          form.setValue("chequeNo", "")
          const accountDate = form.getValues("accountDate")
          form.setValue("chequeDate", accountDate || "")
        }
      } else {
        // No payment type selected, set chequeDate to accountDate
        setIsChequePayment(false)
        form.setValue("chequeNo", "")
        const accountDate = form.getValues("accountDate")
        form.setValue("chequeDate", accountDate || "")
      }
    },
    [form]
  )

  // Handle bank selection
  const handleBankChange = React.useCallback(
    (_selectedBank: IBankLookup | null) => {
      // Additional logic when bank changes if needed
    },
    []
  )

  // Handle add payee to button click
  const handleAddPayeeTo = React.useCallback(() => {
    setIsPayeeDialogOpen(true)
  }, [])

  // Handle payee selection from dialog
  const handlePayeeSelect = React.useCallback(
    (payeeName: string, _payeeType: "customer" | "supplier" | "employee") => {
      form.setValue("payeeTo", payeeName)
      form.trigger("payeeTo")
    },
    [form]
  )

  // Handle FROM currency selection
  const handleFromCurrencyChange = React.useCallback(
    async (selectedCurrency: ICurrencyLookup | null) => {
      if (selectedCurrency) {
        // Set default exchange rate to 1.0 when currency is selected
        const currentExhRate = form.getValues("fromExhRate")
        if (!currentExhRate || currentExhRate === 0) {
          form.setValue("fromExhRate", 1.0)
        }
      }
    },
    [form]
  )

  // Handle FROM exchange rate change
  const handleFromExchangeRateChange = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const fromExhRate = parseFloat(e.target.value) || 0
      const fromTotAmt = form.getValues("fromTotAmt") || 0

      // Calculate local amount based on exchange rate
      const fromTotLocalAmt = fromTotAmt * fromExhRate
      form.setValue(
        "fromTotLocalAmt",
        parseFloat(fromTotLocalAmt.toFixed(locAmtDec))
      )

      // Recalculate bank charge local amount
      const fromBankChgAmt = form.getValues("fromBankChgAmt") || 0
      const fromBankChgLocalAmt = fromBankChgAmt * fromExhRate
      form.setValue(
        "fromBankChgLocalAmt",
        parseFloat(fromBankChgLocalAmt.toFixed(locAmtDec))
      )
    },
    [form, locAmtDec]
  )

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 rounded-md"
      >
        {/* ============ SECTION 1: HEADER ============ */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Header Information
          </h3>
          <div className="grid grid-cols-7 gap-2">
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

            {/* Payee To */}
            {visible?.m_PayeeTo && (
              <CustomInputGroup
                form={form}
                name="payeeTo"
                label="Payee To"
                isRequired={true}
                className="col-span-2"
                buttonText="Add"
                buttonIcon={<PlusIcon className="h-4 w-4" />}
                buttonPosition="right"
                onButtonClick={handleAddPayeeTo}
                buttonVariant="default"
                buttonDisabled={false}
              />
            )}

            {/* Reference No */}
            <CustomInput
              form={form}
              name="referenceNo"
              label="Reference No."
              isRequired={required?.m_ReferenceNo}
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
              />
            )}

            <CustomNumberInput
              form={form}
              name="exhGainLoss"
              label="Exchange Gain/Loss"
              round={amtDec}
              className="text-right"
              isDisabled={true}
            />

            {/* Remarks */}
            <CustomTextarea
              form={form}
              name="remarks"
              label="Remarks"
              isRequired={required?.m_Remarks}
              className="col-span-3"
            />
          </div>
        </div>

        {/* ============ SECTION 2: FROM BANK ============ */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
          <h3 className="mb-3 text-sm font-semibold text-blue-700 dark:text-blue-300">
            From Bank Details
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <BankAutocomplete
              form={form}
              name="fromBankId"
              label="From Bank"
              isRequired={true}
              onChangeEvent={handleBankChange}
            />

            <CurrencyAutocomplete
              form={form}
              name="fromCurrencyId"
              label="From Currency"
              isRequired={true}
              onChangeEvent={handleFromCurrencyChange}
            />

            <CustomNumberInput
              form={form}
              name="fromExhRate"
              label="From Exchange Rate"
              round={exhRateDec}
              isRequired={true}
              className="text-right"
              onBlurEvent={handleFromExchangeRateChange}
            />

            <BankChartOfAccountAutocomplete
              form={form}
              name="fromBankChgGLId"
              label="From Bank Charge GL"
              companyId={_companyId}
            />

            <CustomNumberInput
              form={form}
              name="fromBankChgAmt"
              label="From Bank Charge Amt"
              round={amtDec}
              className="text-right"
            />

            <CustomNumberInput
              form={form}
              name="fromBankChgLocalAmt"
              label="From Bank Charge Local Amt"
              round={locAmtDec}
              isDisabled={true}
              className="text-right"
            />

            <CustomNumberInput
              form={form}
              name="fromTotAmt"
              label="From Total Amount"
              round={amtDec}
              isRequired={true}
              className="text-right"
            />

            <CustomNumberInput
              form={form}
              name="fromTotLocalAmt"
              label="From Total Local Amt"
              round={locAmtDec}
              isRequired={true}
              isDisabled={true}
              className="text-right"
            />
          </div>
        </div>
      </form>

      {/* Payee Selection Dialog */}
      <PayeeSelectionDialog
        open={isPayeeDialogOpen}
        onOpenChangeAction={setIsPayeeDialogOpen}
        onSelectPayeeAction={handlePayeeSelect}
        companyId={_companyId}
      />
    </FormProvider>
  )
}
