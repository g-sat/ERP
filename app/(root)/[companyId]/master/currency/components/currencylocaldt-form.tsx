"use client"

import { useEffect } from "react"
import { ICurrencyLocalDt } from "@/interfaces/currency"
import {
  CurrencyLocalDtFormValues,
  currencyLocalDtSchema,
} from "@/schemas/currency"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { clientDateFormat, parseDate } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import CurrencyAutocomplete from "@/components/ui-custom/autocomplete-currency"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/ui-custom/custom-accordion"
import { CustomDateNew } from "@/components/ui-custom/custom-date-new"
import CustomNumberInput from "@/components/ui-custom/custom-number-input"

interface CurrencyLocalDtFormProps {
  initialData?: ICurrencyLocalDt | null
  submitAction: (data: CurrencyLocalDtFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isReadOnly?: boolean
}

export function CurrencyLocalDtForm({
  initialData,
  submitAction,
  onCancel,
  isSubmitting = false,
  isReadOnly = false,
}: CurrencyLocalDtFormProps) {
  const { decimals } = useAuthStore()
  const exhRateDec = decimals[0]?.exhRateDec || 6
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  console.log("initialData", initialData)
  console.log("initialData?.validFrom", initialData?.validFrom)
  console.log(
    "parseDate(initialData?.validFrom as string)",
    parseDate(initialData?.validFrom as string)
  )
  console.log(
    "format(parseDate(initialData?.validFrom as string) || new Date(), dateFormat)",
    format(
      parseDate(initialData?.validFrom as string) || new Date(),
      clientDateFormat
    )
  )

  const form = useForm<CurrencyLocalDtFormValues>({
    resolver: zodResolver(currencyLocalDtSchema),
    defaultValues: {
      currencyId: initialData?.currencyId || 0,
      exhRate: initialData?.exhRate || exhRateDec || 9,
      validFrom: format(
        parseDate(initialData?.validFrom as string) || new Date(),
        clientDateFormat
      ),
    },
  })

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        currencyId: initialData.currencyId || 0,
        exhRate: initialData.exhRate || exhRateDec || 9,
        validFrom: format(
          parseDate(initialData?.validFrom as string) || new Date(),
          clientDateFormat
        ),
      })
    } else {
      form.reset({
        currencyId: 0,
        exhRate: exhRateDec || 9,
        validFrom: format(new Date(), clientDateFormat),
      })
    }
  }, [initialData, form])

  const onSubmit = (data: CurrencyLocalDtFormValues) => {
    // Format date to ISO string before submission
    const formattedData = {
      ...data,
      validFrom: data.validFrom,
    }
    submitAction(formattedData)
  }

  console.log("form.getValues()", form.getValues())

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
          <div className="grid gap-2">
            <div className="grid grid-cols-3 gap-2">
              <CurrencyAutocomplete
                form={form}
                name="currencyId"
                label="Currency"
                isRequired
                isDisabled={isReadOnly}
              />

              <CustomNumberInput
                form={form}
                name="exhRate"
                label="Exchange Rate"
                round={exhRateDec}
                className="text-right"
                isRequired
                isDisabled={isReadOnly}
              />

              <CustomDateNew
                form={form}
                name="validFrom"
                label="Valid From"
                dateFormat={dateFormat}
                isRequired
                isDisabled={isReadOnly}
              />
            </div>

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
                    ? "Update Local Currency Detail"
                    : "Create Local Currency Detail"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
