"use client"

import { useEffect } from "react"
import { IAccountSetupDt } from "@/interfaces/accountsetup"
import {
  AccountSetupDtSchemaType,
  accountSetupDtSchema,
} from "@/schemas/accountsetup"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { useChartofAccountLookup } from "@/hooks/use-lookup"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import AccountSetupAutocomplete from "@/components/autocomplete/autocomplete-accountsetup"
import ChartofAccountAutocomplete from "@/components/autocomplete/autocomplete-chartofaccount"
import CurrencyAutocomplete from "@/components/autocomplete/autocomplete-currency"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/custom/custom-accordion"
import CustomSwitch from "@/components/custom/custom-switch"

interface AccountSetupDtFormProps {
  initialData?: IAccountSetupDt | null
  submitAction: (data: AccountSetupDtSchemaType) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isReadOnly?: boolean
  companyId?: string
}

export function AccountSetupDtForm({
  initialData,
  submitAction,
  onCancel,
  isSubmitting = false,
  isReadOnly = false,
  companyId,
}: AccountSetupDtFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const defaultValues = {
    accSetupId: 0,
    currencyId: 0,
    glId: 0,
    applyAllCurr: false,
  }

  const form = useForm<AccountSetupDtSchemaType>({
    resolver: zodResolver(accountSetupDtSchema),
    defaultValues: initialData
      ? {
          accSetupId: initialData.accSetupId ?? 0,
          currencyId: initialData.currencyId ?? 0,
          glId: initialData.glId ?? 0,
          applyAllCurr: initialData.applyAllCurr ?? false,
        }
      : {
          ...defaultValues,
        },
  })

  useChartofAccountLookup(Number(companyId || 0))

  // Reset form when initialData changes
  useEffect(() => {
    form.reset(
      initialData
        ? {
            accSetupId: initialData.accSetupId ?? 0,
            currencyId: initialData.currencyId ?? 0,
            glId: initialData.glId ?? 0,
            applyAllCurr: initialData.applyAllCurr ?? false,
          }
        : {
            ...defaultValues,
          }
    )
  }, [initialData, form])

  const onSubmit = (data: AccountSetupDtSchemaType) => {
    submitAction(data)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
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
                companyId={Number(companyId || 0)}
              />
            </div>

            <CustomSwitch
              form={form}
              name="applyAllCurr"
              label="Apply All Currency"
              activeColor="success"
              isDisabled={isReadOnly}
            />

            {/* Audit Information Section */}
            {initialData &&
              (initialData.createBy ||
                initialData.createDate ||
                initialData.editBy ||
                initialData.editDate) && (
                <div className="space-y-6 pt-6">
                  <div className="border-border border-b pb-4"></div>

                  <CustomAccordion
                    type="single"
                    collapsible
                    className="border-border bg-muted/50 rounded-lg border"
                  >
                    <CustomAccordionItem
                      value="audit-info"
                      className="border-none"
                    >
                      <CustomAccordionTrigger className="hover:bg-muted rounded-lg px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">View Audit Trail</span>
                          <Badge variant="secondary" className="text-xs">
                            {initialData.createDate ? "Created" : ""}
                            {initialData.editDate ? " • Modified" : ""}
                          </Badge>
                        </div>
                      </CustomAccordionTrigger>
                      <CustomAccordionContent className="px-6 pb-4">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          {initialData.createDate && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-foreground text-sm font-medium">
                                  Created By
                                </span>
                                <Badge
                                  variant="outline"
                                  className="font-normal"
                                >
                                  {initialData.createBy}
                                </Badge>
                              </div>
                              <div className="text-muted-foreground text-sm">
                                {format(
                                  new Date(initialData.createDate),
                                  datetimeFormat
                                )}
                              </div>
                            </div>
                          )}
                          {initialData.editBy && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-foreground text-sm font-medium">
                                  Last Modified By
                                </span>
                                <Badge
                                  variant="outline"
                                  className="font-normal"
                                >
                                  {initialData.editBy}
                                </Badge>
                              </div>
                              <div className="text-muted-foreground text-sm">
                                {initialData.editDate
                                  ? format(
                                      new Date(initialData.editDate),
                                      datetimeFormat
                                    )
                                  : "-"}
                              </div>
                            </div>
                          )}
                        </div>
                      </CustomAccordionContent>
                    </CustomAccordionItem>
                  </CustomAccordion>
                </div>
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
