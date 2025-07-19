"use client"

import { useEffect } from "react"
import { IApiSuccessResponse } from "@/interfaces/auth"
import { UserSettingFormValues, userSettingSchema } from "@/schemas/setting"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { useUserSettingGet, useUserSettingSave } from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"
import ChartofAccountAutocomplete from "@/components/ui-custom/autocomplete-chartofaccount"
import CustomNumberInput from "@/components/ui-custom/custom-number-input"

type UserSettingResponse = IApiSuccessResponse<UserSettingFormValues>

export function AccountForm() {
  const {
    data: userSettingResponse,
    isLoading,
    isError,
    refetch,
  } = useUserSettingGet()

  const { mutate: saveUserSettings, isPending } = useUserSettingSave()

  const form = useForm<UserSettingFormValues>({
    resolver: zodResolver(userSettingSchema),
    defaultValues: {
      trn_Grd_TotRec: 0,
      m_Grd_TotRec: 0,
      ar_IN_GLId: 0,
      ar_CN_GLId: 0,
      ar_DN_GLId: 0,
      ap_IN_GLId: 0,
      ap_CN_GLId: 0,
      ap_DN_GLId: 0,
    },
  })

  // Update form values when data is loaded
  useEffect(() => {
    if (userSettingResponse) {
      const { result, message, data } =
        userSettingResponse as UserSettingResponse

      if (result === -2) {
        return
      }

      if (result === -1) {
        toast.error(message || "No data available")
        return
      }

      if (result === 1 && data) {
        form.reset({
          trn_Grd_TotRec: data.trn_Grd_TotRec ?? 0,
          m_Grd_TotRec: data.m_Grd_TotRec ?? 0,
          ar_IN_GLId: data.ar_IN_GLId ?? 0,
          ar_CN_GLId: data.ar_CN_GLId ?? 0,
          ar_DN_GLId: data.ar_DN_GLId ?? 0,
          ap_IN_GLId: data.ap_IN_GLId ?? 0,
          ap_CN_GLId: data.ap_CN_GLId ?? 0,
          ap_DN_GLId: data.ap_DN_GLId ?? 0,
        })
      }
    }
  }, [userSettingResponse, form])

  function onSubmit(formData: UserSettingFormValues) {
    // Ensure all values are non-optional before sending to API
    const data = {
      trn_Grd_TotRec: formData.trn_Grd_TotRec ?? 0,
      m_Grd_TotRec: formData.m_Grd_TotRec ?? 0,
      ar_IN_GLId: formData.ar_IN_GLId ?? 0,
      ar_CN_GLId: formData.ar_CN_GLId ?? 0,
      ar_DN_GLId: formData.ar_DN_GLId ?? 0,
      ap_IN_GLId: formData.ap_IN_GLId ?? 0,
      ap_CN_GLId: formData.ap_CN_GLId ?? 0,
      ap_DN_GLId: formData.ap_DN_GLId ?? 0,
    }

    saveUserSettings(data, {
      onSuccess: (response) => {
        const { result, message } = response as UserSettingResponse

        if (result === -2) {
          toast.error("This record is locked")
          return
        }

        if (result === -1) {
          toast.error(message || "Failed to save user settings")
          return
        }

        if (result === 1) {
          toast.success(message || "User settings saved successfully")
          // Reload data after successful save
          refetch()
        }
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to save user settings"
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <p className="text-destructive">Failed to load user settings</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    )
  }

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Grid Records Section */}
        <div className="space-y-6">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Account Settings</h3>
              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Configure how many records are displayed in transaction and master
              data grids
            </p>
          </div>
          <Separator />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <CustomNumberInput
                form={form}
                name="trn_Grd_TotRec"
                label="Transaction Grid Records"
                isRequired
                round={0}
              />
              <p className="text-muted-foreground text-xs">
                Number of records to display in transaction-related grids (e.g.,
                invoices, orders)
              </p>
            </div>
            <div className="space-y-2">
              <CustomNumberInput
                form={form}
                name="m_Grd_TotRec"
                label="Master Grid Records"
                isRequired
                round={0}
              />
              <p className="text-muted-foreground text-xs">
                Number of records to display in master data grids (e.g.,
                customers, products)
              </p>
            </div>
          </div>
        </div>

        {/* GL Accounts Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">GL Account Mappings</h3>
            <p className="text-muted-foreground text-sm">
              Map document types to their corresponding general ledger accounts
              for proper accounting
            </p>
          </div>
          <Separator />
          <div className="space-y-6">
            {/* AR Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium">Accounts Receivable</h4>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="ar_IN_GLId"
                    render={() => (
                      <FormItem>
                        <FormLabel>Invoice GL Account</FormLabel>
                        <FormControl>
                          <ChartofAccountAutocomplete
                            form={form}
                            name="ar_IN_GLId"
                            label=""
                            isRequired
                          />
                        </FormControl>
                        <p className="text-muted-foreground text-xs">
                          GL account for customer invoices
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="ar_CN_GLId"
                    render={() => (
                      <FormItem>
                        <FormLabel>Credit Note GL Account</FormLabel>
                        <FormControl>
                          <ChartofAccountAutocomplete
                            form={form}
                            name="ar_CN_GLId"
                            label=""
                            isRequired
                          />
                        </FormControl>
                        <p className="text-muted-foreground text-xs">
                          GL account for customer credit notes
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="ar_DN_GLId"
                    render={() => (
                      <FormItem>
                        <FormLabel>Debit Note GL Account</FormLabel>
                        <FormControl>
                          <ChartofAccountAutocomplete
                            form={form}
                            name="ar_DN_GLId"
                            label=""
                            isRequired
                          />
                        </FormControl>
                        <p className="text-muted-foreground text-xs">
                          GL account for customer debit notes
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* AP Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium">Accounts Payable</h4>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="ap_IN_GLId"
                    render={() => (
                      <FormItem>
                        <FormLabel>Invoice GL Account</FormLabel>
                        <FormControl>
                          <ChartofAccountAutocomplete
                            form={form}
                            name="ap_IN_GLId"
                            label=""
                            isRequired
                          />
                        </FormControl>
                        <p className="text-muted-foreground text-xs">
                          GL account for supplier invoices
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="ap_CN_GLId"
                    render={() => (
                      <FormItem>
                        <FormLabel>Credit Note GL Account</FormLabel>
                        <FormControl>
                          <ChartofAccountAutocomplete
                            form={form}
                            name="ap_CN_GLId"
                            label=""
                            isRequired
                          />
                        </FormControl>
                        <p className="text-muted-foreground text-xs">
                          GL account for supplier credit notes
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="ap_DN_GLId"
                    render={() => (
                      <FormItem>
                        <FormLabel>Debit Note GL Account</FormLabel>
                        <FormControl>
                          <ChartofAccountAutocomplete
                            form={form}
                            name="ap_DN_GLId"
                            label=""
                            isRequired
                          />
                        </FormControl>
                        <p className="text-muted-foreground text-xs">
                          GL account for supplier debit notes
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  )

  return (
    <div className="rounded-lg border p-4">
      {userSettingResponse?.result === -2 ? (
        <LockSkeleton locked={true}>{formContent}</LockSkeleton>
      ) : (
        formContent
      )}
    </div>
  )
}
