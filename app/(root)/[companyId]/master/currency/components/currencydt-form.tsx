"use client"

import { useEffect } from "react"
import { ICurrencyDt } from "@/interfaces/currency"
import { CurrencyDtFormValues, currencyDtSchema } from "@/schemas/currency"
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

interface CurrencyDtFormProps {
  initialData?: ICurrencyDt | null
  submitAction: (data: CurrencyDtFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isReadOnly?: boolean
}

export function CurrencyDtForm({
  initialData,
  submitAction,
  onCancel,
  isSubmitting = false,
  isReadOnly = false,
}: CurrencyDtFormProps) {
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

  const form = useForm<CurrencyDtFormValues>({
    resolver: zodResolver(currencyDtSchema),
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

  const onSubmit = (data: CurrencyDtFormValues) => {
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            {initialData && (
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
                    ? "Update  Currency Detail"
                    : "Create  Currency Detail"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
