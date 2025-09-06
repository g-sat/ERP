"use client"

import { useEffect } from "react"
import { IJobOrderHd, ILandingItems } from "@/interfaces/checklist"
import { LandingItemsFormValues, LandingItemsSchema } from "@/schemas/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { clientDateFormat, parseDate } from "@/lib/format"
import { Task } from "@/lib/operations-utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import ChargeAutocomplete from "@/components/ui-custom/autocomplete-charge"
import ChartOfAccountAutocomplete from "@/components/ui-custom/autocomplete-chartofaccount"
import LandingTypeAutocomplete from "@/components/ui-custom/autocomplete-landingtype"
import StatusTaskAutocomplete from "@/components/ui-custom/autocomplete-status-task"
import UomAutocomplete from "@/components/ui-custom/autocomplete-uom"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/ui-custom/custom-accordion"
import { CustomDateNew } from "@/components/ui-custom/custom-date-new"
import CustomInput from "@/components/ui-custom/custom-input"
import CustomTextarea from "@/components/ui-custom/custom-textarea"

interface LandingItemsFormProps {
  jobData: IJobOrderHd
  initialData?: ILandingItems
  submitAction: (data: LandingItemsFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isConfirmed?: boolean
}

export function LandingItemsForm({
  jobData,
  initialData,
  submitAction,
  onCancel,
  isSubmitting = false,
  isConfirmed,
}: LandingItemsFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"

  console.log("initialData :", initialData)
  const form = useForm<LandingItemsFormValues>({
    resolver: zodResolver(LandingItemsSchema),
    defaultValues: {
      landingItemId: initialData?.landingItemId ?? 0,
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      taskId: Task.LandingItems,
      date: initialData?.date
        ? format(
            parseDate(initialData.date as string) || new Date(),
            clientDateFormat
          )
        : format(new Date(), clientDateFormat),
      returnDate: initialData?.returnDate
        ? format(
            parseDate(initialData.returnDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      glId: initialData?.glId ?? 0,
      chargeId: initialData?.chargeId ?? 0,
      landingTypeId: initialData?.landingTypeId ?? 0,
      uomId: initialData?.uomId ?? 0,
      statusId: initialData?.statusId ?? 802,
      name: initialData?.name ?? "",
      quantity: initialData?.quantity ?? 1,
      weight: initialData?.weight ?? 0,
      locationName: initialData?.locationName ?? "",
      remarks: initialData?.remarks ?? "",
      debitNoteId: initialData?.debitNoteId ?? 0,
      debitNoteNo: initialData?.debitNoteNo ?? "",
    },
  })

  useEffect(() => {
    form.reset({
      landingItemId: initialData?.landingItemId ?? 0,
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      taskId: Task.LandingItems,
      date: initialData?.date
        ? format(
            parseDate(initialData.date as string) || new Date(),
            clientDateFormat
          )
        : format(new Date(), clientDateFormat),
      returnDate: initialData?.returnDate
        ? format(
            parseDate(initialData.returnDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      glId: initialData?.glId ?? 0,
      chargeId: initialData?.chargeId ?? 0,
      landingTypeId: initialData?.landingTypeId ?? 0,
      uomId: initialData?.uomId ?? 0,
      statusId: initialData?.statusId ?? 802,
      name: initialData?.name ?? "",
      quantity: initialData?.quantity ?? 1,
      weight: initialData?.weight ?? 0,
      locationName: initialData?.locationName ?? "",
      remarks: initialData?.remarks ?? "",
      debitNoteId: initialData?.debitNoteId ?? 0,
      debitNoteNo: initialData?.debitNoteNo ?? "",
    })
  }, [initialData, form, jobData.jobOrderId, jobData.jobOrderNo])

  const onSubmit = (data: LandingItemsFormValues) => {
    submitAction(data)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-2">
            <div className="grid grid-cols-3 gap-2">
              <CustomInput
                form={form}
                name="name"
                label="Item Name"
                isRequired
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="quantity"
                label="Quantity"
                type="number"
                isRequired
                isDisabled={isConfirmed}
              />
              <CustomDateNew
                form={form}
                name="date"
                label="Landing Date"
                isRequired={true}
                dateFormat={dateFormat}
                isDisabled={isConfirmed}
              />
              <LandingTypeAutocomplete
                form={form}
                name="landingTypeId"
                label="Landing Type"
                isRequired={true}
                isDisabled={isConfirmed}
              />

              <ChargeAutocomplete
                form={form}
                name="chargeId"
                label="Charge"
                taskId={Task.LandingItems}
                isRequired={true}
                isDisabled={isConfirmed}
              />
              <ChartOfAccountAutocomplete
                form={form}
                name="glId"
                label="GL Account"
                isRequired={true}
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="locationName"
                label="Location"
                isRequired
                isDisabled={isConfirmed}
              />

              <UomAutocomplete
                form={form}
                name="uomId"
                label="UOM"
                isRequired={true}
                isDisabled={isConfirmed}
              />

              <StatusTaskAutocomplete
                form={form}
                name="statusId"
                label="Status"
                isRequired={true}
                isDisabled={isConfirmed}
              />

              <CustomInput
                form={form}
                name="weight"
                label="Weight"
                type="number"
                isDisabled={isConfirmed}
              />

              <CustomDateNew
                form={form}
                name="returnDate"
                label="Return Date (Optional)"
                dateFormat={dateFormat}
                isDisabled={isConfirmed}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <CustomTextarea
                form={form}
                name="remarks"
                label="Remarks"
                isDisabled={isConfirmed}
              />
            </div>

            {/* Audit Information Section */}
            {initialData &&
              (initialData.createBy ||
                initialData.createDate ||
                initialData.editBy ||
                initialData.editDate) && (
                <div className="space-y-6">
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
                                  : "—"}
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
              {isConfirmed ? "Close" : "Cancel"}
            </Button>
            {!isConfirmed && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : initialData
                    ? "Update Landing Item"
                    : "Add Landing Item"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
