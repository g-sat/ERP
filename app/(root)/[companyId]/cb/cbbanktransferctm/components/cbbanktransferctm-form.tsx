"use client"

import * as React from "react"
import {
  calculateMultiplierAmount,
  setFromExchangeRate,
} from "@/helpers/account"
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
  PaymentTypeAutocomplete,
} from "@/components/autocomplete"
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
        await setFromExchangeRate(form, exhRateDec, visible, "fromCurrencyId")
      } else {
        form.setValue("fromCurrencyId", 0)
        form.setValue("fromExhRate", 0)
      }
    },
    [form, exhRateDec, visible]
  )

  // Handle FROM total amount change
  const handleFromTotAmtChange = React.useCallback(
    (value: number) => {
      form.setValue("fromTotAmt", value)
      const fromExhRate = form.getValues("fromExhRate") || 0

      // Calculate local amount based on exchange rate using helper
      const fromTotLocalAmt = calculateMultiplierAmount(
        value,
        fromExhRate,
        locAmtDec
      )
      form.setValue("fromTotLocalAmt", fromTotLocalAmt)
    },
    [form, locAmtDec]
  )

  // Handle FROM bank charge amount change
  const handleFromBankChgAmtChange = React.useCallback(
    (value: number) => {
      form.setValue("fromBankChgAmt", value)
      const fromExhRate = form.getValues("fromExhRate") || 0

      // Calculate local amount based on exchange rate using helper
      const fromBankChgLocalAmt = calculateMultiplierAmount(
        value,
        fromExhRate,
        locAmtDec
      )
      form.setValue("fromBankChgLocalAmt", fromBankChgLocalAmt)
    },
    [form, locAmtDec]
  )

  // Handle FROM exchange rate change
  const handleFromExchangeRateChange = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const fromExhRate = parseFloat(e.target.value) || 0
      const fromTotAmt = form.getValues("fromTotAmt") || 0

      // Calculate local amount based on exchange rate using helper
      const fromTotLocalAmt = calculateMultiplierAmount(
        fromTotAmt,
        fromExhRate,
        locAmtDec
      )
      form.setValue("fromTotLocalAmt", fromTotLocalAmt)

      // Recalculate bank charge local amount using helper
      const fromBankChgAmt = form.getValues("fromBankChgAmt") || 0
      const fromBankChgLocalAmt = calculateMultiplierAmount(
        fromBankChgAmt,
        fromExhRate,
        locAmtDec
      )
      form.setValue("fromBankChgLocalAmt", fromBankChgLocalAmt)
    },
    [form, locAmtDec]
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

        {/* FROM BANK DETAILS */}
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
          onChangeEvent={handleFromBankChgAmtChange}
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
          onChangeEvent={handleFromTotAmtChange}
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
          className="col-span-2"
        />
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
