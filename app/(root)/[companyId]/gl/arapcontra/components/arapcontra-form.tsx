"use client"

import * as React from "react"
import {
  setDueDate,
  setExchangeRate,
  setExchangeRateLocal,
} from "@/helpers/account"
import {
  ICurrencyLookup,
  ICustomerLookup,
  ISupplierLookup,
} from "@/interfaces/lookup"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import { GLContraHdSchemaType } from "@/schemas/gl-arapcontra"
import { useAuthStore } from "@/stores/auth-store"
import { FormProvider, UseFormReturn } from "react-hook-form"

import { CompanySupplierAutocomplete } from "@/components/autocomplete"
import CurrencyAutocomplete from "@/components/autocomplete/autocomplete-currency"
import CustomerAutocomplete from "@/components/autocomplete/autocomplete-customer"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import CustomInput from "@/components/custom/custom-input"
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomTextarea from "@/components/custom/custom-textarea"

interface ArapcontraFormProps {
  form: UseFormReturn<GLContraHdSchemaType>
  onSuccessAction: (action: string) => Promise<void>
  isEdit: boolean
  visible: IVisibleFields
  required: IMandatoryFields
  companyId: number
}

export default function ArapcontraForm({
  form,
  onSuccessAction,
  isEdit,
  visible,
  required,
  companyId,
}: ArapcontraFormProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const exhRateDec = decimals[0]?.exhRateDec || 6

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
    },
    [exhRateDec, form, visible]
  )

  // Handle supplier selection
  const handleSupplierChange = React.useCallback(
    async (selectedSupplier: ISupplierLookup | null) => {
      if (selectedSupplier) {
        // Supplier selected - populate related fields
        if (!isEdit) {
          form.setValue("currencyId", selectedSupplier.currencyId || 0)
        }

        await setDueDate(form)

        // Only set exchange rates if currency is available
        if (selectedSupplier.currencyId > 0) {
          await setExchangeRate(form, exhRateDec, visible)
        } else {
          // If no currency, set exchange rates to zero
          form.setValue("exhRate", 0)
        }
      } else {
        // Supplier cleared - reset related fields
        if (!isEdit) {
          form.setValue("currencyId", 0)
        }

        // Clear exchange rates
        form.setValue("exhRate", 0)

        // Trigger validation
        form.trigger()
      }
    },
    [exhRateDec, form, isEdit, visible]
  )

  // Handle customer selection
  const handleCustomerChange = React.useCallback(
    async (selectedCustomer: ICustomerLookup | null) => {
      if (selectedCustomer) {
        // Customer selected - populate related fields
        if (!isEdit) {
          form.setValue("currencyId", selectedCustomer.currencyId || 0)
        }

        // Only set exchange rates if currency is available
        if (selectedCustomer.currencyId > 0) {
          await setExchangeRate(form, exhRateDec, visible)
        } else {
          // If no currency, set exchange rates to zero
          form.setValue("exhRate", 0)
        }
      } else {
        // Customer cleared - reset related fields
        if (!isEdit) {
          form.setValue("currencyId", 0)
        }

        // Clear exchange rates
        form.setValue("exhRate", 0)

        // Trigger validation
        form.trigger()
      }
    },
    [exhRateDec, form, isEdit, visible]
  )

  // Handle currency selection
  const handleCurrencyChange = React.useCallback(
    async (selectedCurrency: ICurrencyLookup | null) => {
      // Additional logic when currency changes
      const currencyId = selectedCurrency?.currencyId || 0
      const accountDate = form.getValues("accountDate")

      if (currencyId && accountDate) {
        // Update exchange rates
        await setExchangeRate(form, exhRateDec, visible)
        if (visible?.m_CtyCurr) {
          await setExchangeRateLocal(form, exhRateDec)
        }
      } else {
        form.setValue("exhRate", 0)
      }
    },
    [exhRateDec, form, visible]
  )

  // Handle exchange rate change
  const handleExchangeRateChange = React.useCallback(
    (_e: React.FocusEvent<HTMLInputElement>) => {
      // Recalculate amounts when exchange rate changes
      // This can be extended to recalculate detail amounts if needed
      form.trigger()
    },
    [form]
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

        {/* Reference No */}
        <CustomInput
          form={form}
          name="referenceNo"
          label="Reference No."
          isRequired={required?.m_ReferenceNo}
        />

        {/* Supplier */}
        <CompanySupplierAutocomplete
          form={form}
          name="supplierId"
          label="Supplier"
          isRequired={true}
          onChangeEvent={handleSupplierChange}
          companyId={companyId}
        />

        {/* Customer */}
        <CustomerAutocomplete
          form={form}
          name="customerId"
          label="Customer"
          isRequired={true}
          onChangeEvent={handleCustomerChange}
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

        {/* Total Amount */}
        <CustomNumberInput
          form={form}
          name="totAmt"
          label="Total Amount"
          isRequired={required?.m_TotAmt}
          round={amtDec}
          isDisabled={true}
          className="text-right"
        />

        {/* Total Local Amount */}
        <CustomNumberInput
          form={form}
          name="totLocalAmt"
          label="Total Local Amount"
          isRequired={true}
          round={locAmtDec}
          isDisabled={true}
          className="text-right"
        />

        {/* Exchange Gain/Loss */}
        <CustomNumberInput
          form={form}
          name="exhGainLoss"
          label="Exchange Gain/Loss"
          isRequired={false}
          round={locAmtDec}
          isDisabled={true}
        />

        {/* Module From */}
        <CustomInput
          form={form}
          name="moduleFrom"
          label="Module From"
          isRequired={true}
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
