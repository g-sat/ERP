"use client"

import { useEffect } from "react"
import { ICreditTermDt } from "@/interfaces/creditterm"
import {
  CreditTermDtFormValues,
  credittermDtSchema,
} from "@/schemas/creditterm"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import CreditTermAutocomplete from "@/components/ui-custom/autocomplete-creditterm"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/ui-custom/custom-accordion"
import CustomNumberInput from "@/components/ui-custom/custom-number-input"
import CustomSwitch from "@/components/ui-custom/custom-switch"

interface CreditTermDtFormProps {
  initialData?: ICreditTermDt | null
  submitAction: (data: CreditTermDtFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isReadOnly?: boolean
}

export function CreditTermDtForm({
  initialData,
  submitAction,
  onCancel,
  isSubmitting = false,
  isReadOnly = false,
}: CreditTermDtFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const amtDec = decimals[0]?.amtDec || 2

  const form = useForm<CreditTermDtFormValues>({
    resolver: zodResolver(credittermDtSchema),
    defaultValues: {
      creditTermId: initialData?.creditTermId || 0,
      fromDay: initialData?.fromDay || 0,
      toDay: initialData?.toDay || 0,
      dueDay: initialData?.dueDay || 0,
      noMonth: initialData?.noMonth || 0,
      isEndOfMonth: initialData?.isEndOfMonth || false,
    },
  })

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        creditTermId: initialData.creditTermId || 0,
        fromDay: initialData.fromDay || 0,
        toDay: initialData.toDay || 0,
        dueDay: initialData.dueDay || 0,
        noMonth: initialData.noMonth || 0,
        isEndOfMonth: initialData.isEndOfMonth || false,
      })
    } else {
      form.reset({
        creditTermId: 0,
        fromDay: 0,
        toDay: 0,
        dueDay: 0,
        noMonth: 0,
        isEndOfMonth: false,
      })
    }
  }, [initialData, form])

  const onSubmit = (data: CreditTermDtFormValues) => {
    submitAction(data)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
          <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-2">
              <CreditTermAutocomplete
                form={form}
                name="creditTermId"
                label="Credit Term"
                isRequired={true}
                isDisabled={isReadOnly}
              />

              <CustomNumberInput
                form={form}
                name="fromDay"
                label="From Day"
                isRequired
                isDisabled={isReadOnly}
                round={amtDec}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <CustomNumberInput
                form={form}
                name="toDay"
                label="To Day"
                isRequired
                isDisabled={isReadOnly}
                round={amtDec}
              />
              <CustomNumberInput
                form={form}
                name="dueDay"
                label="Due Day"
                isRequired
                isDisabled={isReadOnly}
                round={amtDec}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <CustomNumberInput
                form={form}
                name="noMonth"
                label="No. of Months"
                isRequired
                isDisabled={isReadOnly}
                round={amtDec}
              />

              <CustomSwitch
                form={form}
                name="isEndOfMonth"
                label="End of Month"
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
                    ? "Update Credit Term Detail"
                    : "Create Credit Term Detail"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
