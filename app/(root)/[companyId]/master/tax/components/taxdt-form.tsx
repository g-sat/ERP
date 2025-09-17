"use client"

import { ITaxDt } from "@/interfaces/tax"
import { TaxDtFormValues, taxDtSchema } from "@/schemas/tax"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { parseDate } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import TaxAutocomplete from "@/components/ui-custom/autocomplete-tax"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/ui-custom/custom-accordion"
import { CustomDateNew } from "@/components/ui-custom/custom-date-new"
import CustomNumberInput from "@/components/ui-custom/custom-number-input"

interface TaxDtFormProps {
  initialData?: ITaxDt | null
  submitAction: (data: TaxDtFormValues) => void
  onCancel: () => void
  isSubmitting: boolean
  isReadOnly?: boolean
}

export function TaxDtForm({
  initialData,
  submitAction,
  onCancel,
  isSubmitting,
  isReadOnly = false,
}: TaxDtFormProps) {
  const { decimals } = useAuthStore()
  const priceDec = decimals[0]?.priceDec || 2
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  console.log("initialData TaxDtForm", initialData)
  const form = useForm<TaxDtFormValues>({
    resolver: zodResolver(taxDtSchema),
    defaultValues: {
      taxId: initialData?.taxId || 0,
      taxPercentage: initialData?.taxPercentage || 0,
      validFrom: initialData?.validFrom
        ? format(
            parseDate(initialData.validFrom as string) || new Date(),
            dateFormat
          )
        : new Date(),
    },
  })

  const onSubmit = (data: TaxDtFormValues) => {
    submitAction(data)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
          <div className="grid gap-3">
            <div className="grid grid-cols-3 gap-2">
              <TaxAutocomplete
                form={form}
                name="taxId"
                label="Tax"
                isRequired={true}
                isDisabled={isReadOnly || isSubmitting}
              />

              <CustomNumberInput
                form={form}
                name="taxPercentage"
                label="Tax Percentage"
                isRequired
                isDisabled={isReadOnly || isSubmitting}
                round={priceDec}
              />

              <CustomDateNew
                form={form}
                name="validFrom"
                label="Valid From"
                isDisabled={isReadOnly || isSubmitting}
                isRequired
                dateFormat={dateFormat}
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

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            {!isReadOnly && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
