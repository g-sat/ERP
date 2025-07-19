"use client"

import { useEffect } from "react"
import { IApiSuccessResponse } from "@/interfaces/auth"
import { IDecFormat } from "@/interfaces/setting"
import { DecimalFormValues, decimalFormSchema } from "@/schemas/setting"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { useDecimalGet, useDecimalSave } from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"
import CustomNumberInput from "@/components/ui-custom/custom-number-input"

type DecimalResponse = IApiSuccessResponse<DecimalFormValues>

export function DecimalForm() {
  const { data: decimalResponse, isLoading, isError, refetch } = useDecimalGet()

  const { mutate: saveDecimalSettings, isPending } = useDecimalSave()

  const form = useForm<DecimalFormValues>({
    resolver: zodResolver(decimalFormSchema),
    defaultValues: {
      amtDec: 2,
      locAmtDec: 2,
      ctyAmtDec: 2,
      priceDec: 2,
      qtyDec: 2,
      exhRateDec: 4,
      dateFormat: "DD/MM/YYYY",
      longDateFormat: "DD/MM/YYYY HH:mm:ss",
    },
  })

  // Update form values when data is loaded
  useEffect(() => {
    if (decimalResponse) {
      const { result, message, data } = decimalResponse as DecimalResponse

      if (result === -2) {
        return
      }

      if (result === -1) {
        toast.error(message || "No data available")
        return
      }

      if (result === 1 && data) {
        form.reset({
          amtDec: data.amtDec ?? 2,
          locAmtDec: data.locAmtDec ?? 2,
          ctyAmtDec: data.ctyAmtDec ?? 2,
          priceDec: data.priceDec ?? 2,
          qtyDec: data.qtyDec ?? 2,
          exhRateDec: data.exhRateDec ?? 4,
          dateFormat: data.dateFormat ?? "DD/MM/YYYY",
          longDateFormat: data.longDateFormat ?? "DD/MM/YYYY HH:mm:ss",
        })
      }
    }
  }, [decimalResponse, form])

  function onSubmit(formData: DecimalFormValues) {
    const decimalSettings: IDecFormat = {
      amtDec: formData.amtDec!,
      locAmtDec: formData.locAmtDec!,
      ctyAmtDec: formData.ctyAmtDec!,
      priceDec: formData.priceDec!,
      qtyDec: formData.qtyDec!,
      exhRateDec: formData.exhRateDec!,
      dateFormat: formData.dateFormat!,
      longDateFormat: formData.longDateFormat!,
    }

    saveDecimalSettings(decimalSettings, {
      onSuccess: (response) => {
        const { result, message } = response as DecimalResponse

        if (result === -2) {
          toast.error("This record is locked")
          return
        }

        if (result === -1) {
          toast.error(message || "Failed to save decimal settings")
          return
        }

        if (result === 1) {
          toast.success(message || "Decimal settings saved successfully")
          // Reload data after successful save
          refetch()
        }
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to save decimal settings"
        )
      },
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <p className="text-destructive">Failed to load decimal settings</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    )
  }

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                Amount & Quantity Decimal Settings
              </h3>
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
            <p className="text-muted-foreground text-sm">
              Configure the number of decimal places for different types of
              values in the system
            </p>
          </div>
          <Separator />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "amtDec" as const,
                label: "Amount Decimals",
                round: 0,
                description: "Number of decimal places for general amounts",
              },
              {
                name: "locAmtDec" as const,
                label: "Local Amount Decimals",
                round: 0,
                description:
                  "Number of decimal places for local currency amounts",
              },
              {
                name: "ctyAmtDec" as const,
                label: "Currency Amount Decimals",
                round: 0,
                description:
                  "Number of decimal places for foreign currency amounts",
              },
              {
                name: "priceDec" as const,
                label: "Price Decimals",
                round: 0,
                description: "Number of decimal places for price values",
              },
              {
                name: "qtyDec" as const,
                label: "Quantity Decimals",
                round: 0,
                description: "Number of decimal places for quantity values",
              },
              {
                name: "exhRateDec" as const,
                label: "Exchange Rate Decimals",
                round: 0,
                description: "Number of decimal places for exchange rates",
              },
            ].map(({ name, label, round, description }) => (
              <div key={name} className="space-y-2">
                <CustomNumberInput
                  form={form}
                  name={name}
                  label={label}
                  isRequired
                  round={round}
                />
                <p className="text-muted-foreground text-xs">{description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Date Format Settings */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Date Format Settings</h3>
            <p className="text-muted-foreground text-sm">
              Configure how dates are displayed throughout the system
            </p>
          </div>
          <Separator />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="dateFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Format</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select date format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[
                          "DD/MM/YYYY",
                          "MM/DD/YYYY",
                          "YYYY/MM/DD",
                          "DD-MM-YYYY",
                          "MM-DD-YYYY",
                          "YYYY-MM-DD",
                        ].map((format) => (
                          <SelectItem key={format} value={format}>
                            {format}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-muted-foreground text-xs">
                      Standard date format used throughout the system
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="longDateFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Long Date Format</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select long date format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[
                          "DD/MM/YYYY HH:mm:ss",
                          "MM/DD/YYYY HH:mm:ss",
                          "YYYY/MM/DD HH:mm:ss",
                          "DD-MM-YYYY HH:mm:ss",
                          "MM-DD-YYYY HH:mm:ss",
                          "YYYY-MM-DD HH:mm:ss",
                        ].map((format) => (
                          <SelectItem key={format} value={format}>
                            {format}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-muted-foreground text-xs">
                      Date format including time, used for detailed timestamps
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </form>
    </Form>
  )

  return (
    <div className="rounded-lg border p-4">
      {decimalResponse?.result === -2 ? (
        <LockSkeleton locked={true}>{formContent}</LockSkeleton>
      ) : (
        formContent
      )}
    </div>
  )
}
