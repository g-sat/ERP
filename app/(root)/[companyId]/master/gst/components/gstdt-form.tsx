"use client"

import { useEffect } from "react"
import { IGstDt } from "@/interfaces/gst"
import { GstDtSchemaType, gstDtSchema } from "@/schemas/gst"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { parseDate } from "@/lib/date-utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { GSTAutocomplete } from "@/components/autocomplete"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/custom/custom-accordion"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import CustomNumberInput from "@/components/custom/custom-number-input"

const defaultValues = {
  gstId: 0,
  gstPercentage: 0,
  validFrom: new Date(),
}
interface GstDtFormProps {
  initialData?: IGstDt | null
  submitAction: (data: GstDtSchemaType) => void
  onCancelAction: () => void
  isSubmitting: boolean
  isReadOnly?: boolean
}

export function GstDtForm({
  initialData,
  submitAction,
  onCancelAction,
  isSubmitting,
  isReadOnly = false,
}: GstDtFormProps) {
  const { decimals } = useAuthStore()
  const priceDec = decimals[0]?.priceDec || 2
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  console.log("initialData GstDtForm", initialData)

  const form = useForm<GstDtSchemaType>({
    resolver: zodResolver(gstDtSchema),
    defaultValues: initialData
      ? {
          gstId: initialData.gstId ?? 0,
          gstPercentage: initialData.gstPercentage ?? 0,
          validFrom: initialData.validFrom
            ? parseDate(initialData.validFrom as string) || new Date()
            : new Date(),
        }
      : {
          ...defaultValues,
        },
  })

  // Reset form when initialData changes
  useEffect(() => {
    form.reset(
      initialData
        ? {
            gstId: initialData.gstId ?? 0,
            gstPercentage: initialData.gstPercentage ?? 0,
            validFrom: initialData.validFrom
              ? parseDate(initialData.validFrom as string) || new Date()
              : new Date(),
          }
        : {
            ...defaultValues,
          }
    )
  }, [initialData, form])

  const onSubmit = (data: GstDtSchemaType) => {
    submitAction(data)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <div className="grid gap-3">
            <div className="grid grid-cols-3 gap-2">
              <GstAutocomplete
                form={form}
                name="gstId"
                label="Gst"
                isRequired={true}
                isDisabled={isReadOnly || isSubmitting}
              />

              <CustomNumberInput
                form={form}
                name="gstPercentage"
                label="Gst Percentage"
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
              />
            </div>
            {/* Audit Information Section */}
            {initialData &&
              (initialData.createBy ||
                initialData.createDate ||
                initialData.editBy ||
                initialData.editDate) && (
                <div className="space-y-2">
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
              onClick={onCancelAction}
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
