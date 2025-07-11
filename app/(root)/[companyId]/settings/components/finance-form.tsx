"use client"

import { useEffect } from "react"
import { IApiSuccessResponse } from "@/interfaces/auth"
import {
  FinanceSettingFormValues,
  financeSettingSchema,
} from "@/schemas/setting"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { useFinanceGet, useFinanceSave } from "@/hooks/use-setting"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Skeleton } from "@/components/ui/skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"
import ChartofAccountAutocomplete from "@/components/ui-custom/autocomplete-chartofaccount"
import CurrencyAutocomplete from "@/components/ui-custom/autocomplete-currency"

type FinanceResponse = IApiSuccessResponse<FinanceSettingFormValues>

export function FinanceForm() {
  const {
    data: financeResponse,
    isLoading: isLoadingfinance,
    isError,
    refetch,
  } = useFinanceGet()

  const { mutate: saveFinanceSettings, isPending } = useFinanceSave()

  const form = useForm<FinanceSettingFormValues>({
    resolver: zodResolver(financeSettingSchema),
    defaultValues: {
      base_CurrencyId: 0,
      local_CurrencyId: 0,
      exhGain_GlId: 0,
      exhLoss_GlId: 0,
      bankCharge_GlId: 0,
      profitLoss_GlId: 0,
      retEarning_GlId: 0,
      saleGst_GlId: 0,
      purGst_GlId: 0,
      saleDef_GlId: 0,
      purDef_GlId: 0,
    },
  })

  // Update form values when data is loaded
  useEffect(() => {
    if (financeResponse) {
      const { result, message, data } = financeResponse as FinanceResponse

      if (result === -2) {
        return
      }

      if (result === -1) {
        toast.error(message || "No data available")
        return
      }

      if (result === 1 && data) {
        form.reset({
          base_CurrencyId: data.base_CurrencyId ?? 0,
          local_CurrencyId: data.local_CurrencyId ?? 0,
          exhGain_GlId: data.exhGain_GlId ?? 0,
          exhLoss_GlId: data.exhLoss_GlId ?? 0,
          bankCharge_GlId: data.bankCharge_GlId ?? 0,
          profitLoss_GlId: data.profitLoss_GlId ?? 0,
          retEarning_GlId: data.retEarning_GlId ?? 0,
          saleGst_GlId: data.saleGst_GlId ?? 0,
          purGst_GlId: data.purGst_GlId ?? 0,
          saleDef_GlId: data.saleDef_GlId ?? 0,
          purDef_GlId: data.purDef_GlId ?? 0,
        })
      }
    }
  }, [financeResponse, form])

  function onSubmit(formData: FinanceSettingFormValues) {
    // Ensure all fields are non-optional numbers
    const data = {
      base_CurrencyId: formData.base_CurrencyId ?? 0,
      local_CurrencyId: formData.local_CurrencyId ?? 0,
      exhGain_GlId: formData.exhGain_GlId ?? 0,
      exhLoss_GlId: formData.exhLoss_GlId ?? 0,
      bankCharge_GlId: formData.bankCharge_GlId ?? 0,
      profitLoss_GlId: formData.profitLoss_GlId ?? 0,
      retEarning_GlId: formData.retEarning_GlId ?? 0,
      saleGst_GlId: formData.saleGst_GlId ?? 0,
      purGst_GlId: formData.purGst_GlId ?? 0,
      saleDef_GlId: formData.saleDef_GlId ?? 0,
      purDef_GlId: formData.purDef_GlId ?? 0,
    }

    saveFinanceSettings(data, {
      onSuccess: (response) => {
        const { result, message } = response as FinanceResponse

        if (result === -2) {
          toast.error("This record is locked")
          return
        }

        if (result === -1) {
          toast.error(message || "Failed to save finance settings")
          return
        }

        if (result === 1) {
          toast.success(message || "Finance settings saved successfully")
          // Reload data after successful save
          refetch()
        }
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to save finance settings"
        )
      },
    })
  }

  if (isLoadingfinance) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {Array.from({ length: 11 }).map((_, i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <p className="text-destructive">Failed to load finance settings</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    )
  }

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Finance Settings</h3>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">
            Configure finance settings for your company
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <CurrencyAutocomplete
            form={form}
            name="base_CurrencyId"
            label="Base Currency"
            isRequired={true}
          />
          <CurrencyAutocomplete
            form={form}
            name="local_CurrencyId"
            label="Local Currency"
            isRequired={true}
          />
          <ChartofAccountAutocomplete
            form={form}
            name="exhGain_GlId"
            label="Exchange Gain Account"
            isRequired={true}
          />
          <ChartofAccountAutocomplete
            form={form}
            name="exhLoss_GlId"
            label="Exchange Loss Account"
            isRequired={true}
          />
          <ChartofAccountAutocomplete
            form={form}
            name="bankCharge_GlId"
            label="Bank Charges Account"
            isRequired={true}
          />
          <ChartofAccountAutocomplete
            form={form}
            name="profitLoss_GlId"
            label="Profit & Loss Account"
            isRequired={true}
          />
          <ChartofAccountAutocomplete
            form={form}
            name="retEarning_GlId"
            label="Retained Earnings Account"
            isRequired={true}
          />
          <ChartofAccountAutocomplete
            form={form}
            name="saleGst_GlId"
            label="Sales GST Account"
            isRequired={true}
          />
          <ChartofAccountAutocomplete
            form={form}
            name="purGst_GlId"
            label="Purchase GST Account"
            isRequired={true}
          />
          <ChartofAccountAutocomplete
            form={form}
            name="saleDef_GlId"
            label="Sales Deferred Account"
            isRequired={true}
          />
          <ChartofAccountAutocomplete
            form={form}
            name="purDef_GlId"
            label="Purchase Deferred Account"
            isRequired={true}
          />
        </div>
      </form>
    </Form>
  )

  return (
    <div className="rounded-lg border p-4">
      {financeResponse?.result === -2 ? (
        <LockSkeleton locked={true}>{formContent}</LockSkeleton>
      ) : (
        formContent
      )}
    </div>
  )
}
