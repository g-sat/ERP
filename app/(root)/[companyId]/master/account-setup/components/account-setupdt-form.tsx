"use client"

import { useEffect } from "react"
import { IAccountSetupDt } from "@/interfaces/accountsetup"
import {
  AccountSetupDtFormValues,
  accountSetupDtSchema,
} from "@/schemas/accountsetup"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import AccountSetupAutocomplete from "@/components/ui-custom/autocomplete-accountsetup"
import ChartofAccountAutocomplete from "@/components/ui-custom/autocomplete-chartofaccount"
import CurrencyAutocomplete from "@/components/ui-custom/autocomplete-currency"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/ui-custom/custom-accordion"
import CustomSwitch from "@/components/ui-custom/custom-switch"

interface AccountSetupDtFormProps {
  initialData?: IAccountSetupDt | null
  submitAction: (data: AccountSetupDtFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isReadOnly?: boolean
}

export function AccountSetupDtForm({
  initialData,
  submitAction,
  onCancel,
  isSubmitting = false,
  isReadOnly = false,
}: AccountSetupDtFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const form = useForm<AccountSetupDtFormValues>({
    resolver: zodResolver(accountSetupDtSchema),
    defaultValues: initialData
      ? { ...initialData }
      : {
          accSetupId: 0,
          currencyId: 0,
          glId: 0,
          applyAllCurr: false,
        },
  })

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    } else {
      form.reset({
        accSetupId: 0,
        currencyId: 0,
        glId: 0,
        applyAllCurr: false,
      })
    }
  }, [initialData, form])

  const onSubmit = (data: AccountSetupDtFormValues) => {
    submitAction(data)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-2">
            <div className="grid grid-cols-3 gap-2">
              <AccountSetupAutocomplete
                form={form}
                name="accSetupId"
                label="Account Setup"
                isRequired={true}
              />

              <CurrencyAutocomplete
                form={form}
                name="currencyId"
                label="Currency"
                isRequired={true}
              />

              <ChartofAccountAutocomplete
                form={form}
                name="glId"
                label="Chart of Account"
                isRequired={true}
              />
            </div>

            <CustomSwitch
              form={form}
              name="applyAllCurr"
              label="Apply All Currency"
              activeColor="success"
              isDisabled={isReadOnly}
            />

            {initialData &&
              (initialData.createBy ||
                initialData.createDate ||
                initialData.editBy ||
                initialData.editDate) && (
                <CustomAccordion
                  type="single"
                  collapsible
                  className="rounded-md border"
                >
                  <CustomAccordionItem value="audit-info">
                    <CustomAccordionTrigger className="px-4">
                      Audit Information
                    </CustomAccordionTrigger>
                    <CustomAccordionContent className="px-2">
                      <div className="grid grid-cols-2 gap-4">
                        {initialData.createDate && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">
                              Created By
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-normal">
                                {initialData.createBy}
                              </Badge>
                              <span className="text-muted-foreground text-sm">
                                {format(
                                  new Date(initialData.createDate),
                                  datetimeFormat
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                        {initialData.editBy && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">
                              Last Edited By
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-normal">
                                {initialData.editBy}
                              </Badge>
                              <span className="text-muted-foreground text-sm">
                                {initialData.editDate
                                  ? format(
                                      new Date(initialData.editDate),
                                      datetimeFormat
                                    )
                                  : "—"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CustomAccordionContent>
                  </CustomAccordionItem>
                </CustomAccordion>
              )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onCancel}>
              {isReadOnly ? "Close" : "Cancel"}
            </Button>
            {!isReadOnly && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : initialData
                    ? "Update Account Setup Detail"
                    : "Create Account Setup Detail"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
