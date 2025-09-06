"use client"

import { useEffect, useState } from "react"
import { IJobOrderHd, IOtherService } from "@/interfaces/checklist"
import { IChargeLookup } from "@/interfaces/lookup"
import { OtherServiceFormValues, OtherServiceSchema } from "@/schemas/checklist"
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

interface OtherServiceFormProps {
  jobData: IJobOrderHd
  initialData?: IOtherService
  submitAction: (data: OtherServiceFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isConfirmed?: boolean
}

export function OtherServiceForm({
  jobData,
  initialData,
  submitAction,
  onCancel,
  isSubmitting = false,
  isConfirmed,
}: OtherServiceFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"

  // State to track if selected charge is "Cash to master" type
  const [isCashToMaster, setIsCashToMaster] = useState(false)

  console.log("initialData :", initialData)
  const form = useForm<OtherServiceFormValues>({
    resolver: zodResolver(OtherServiceSchema),
    defaultValues: {
      otherServiceId: initialData?.otherServiceId ?? 0,
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      taskId: Task.OtherService,
      date: initialData?.date
        ? format(
            parseDate(initialData.date as string) || new Date(),
            clientDateFormat
          )
        : format(new Date(), clientDateFormat),
      chargeId: initialData?.chargeId ?? 0,
      glId: initialData?.glId ?? 0,
      statusId: initialData?.statusId ?? 802,
      uomId: initialData?.uomId ?? 0,
      debitNoteId: initialData?.debitNoteId ?? 0,
      debitNoteNo: initialData?.debitNoteNo ?? "",
      serviceProvider: initialData?.serviceProvider ?? "",
      quantity: initialData?.quantity ?? 1,
      amount: initialData?.amount ?? 0,
      remarks: initialData?.remarks ?? "",
    },
  })

  // Handle charge selection change
  const handleChargeChange = (charge: IChargeLookup | null) => {
    if (charge) {
      // Check if charge name contains "Cash to master" (case-insensitive)
      const isCashToMasterCharge = charge.chargeName
        .toLowerCase()
        .includes("cash to master")
      setIsCashToMaster(isCashToMasterCharge)

      // If it's a "Cash to master" charge, set quantity to 1 and clear amount
      if (isCashToMasterCharge) {
        form.setValue("quantity", 1)
        form.setValue("amount", 0)
      } else {
        // For other charges, set amount to 0 and keep quantity as is
        form.setValue("amount", 0)
      }
    } else {
      setIsCashToMaster(false)
    }
  }

  useEffect(() => {
    form.reset({
      otherServiceId: initialData?.otherServiceId ?? 0,
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      taskId: Task.OtherService,
      date: initialData?.date
        ? format(
            parseDate(initialData.date as string) || new Date(),
            clientDateFormat
          )
        : format(new Date(), clientDateFormat),
      chargeId: initialData?.chargeId ?? 0,
      glId: initialData?.glId ?? 0,
      statusId: initialData?.statusId ?? 802,
      uomId: initialData?.uomId ?? 0,
      debitNoteId: initialData?.debitNoteId ?? 0,
      debitNoteNo: initialData?.debitNoteNo ?? "",
      serviceProvider: initialData?.serviceProvider ?? "",
      quantity: initialData?.quantity ?? 1,
      amount: initialData?.amount ?? 0,
      remarks: initialData?.remarks ?? "",
    })
  }, [initialData, form, jobData.jobOrderId, jobData.jobOrderNo])

  // Handle initial charge selection when form loads with existing data
  useEffect(() => {
    if (initialData?.chargeId && initialData?.chargeName) {
      const isCashToMasterCharge = initialData.chargeName
        .toLowerCase()
        .includes("cash to master")
      setIsCashToMaster(isCashToMasterCharge)
    }
  }, [initialData])

  const onSubmit = (data: OtherServiceFormValues) => {
    submitAction(data)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-2">
              <CustomInput
                form={form}
                name="serviceProvider"
                label="Service Provider"
                isRequired
                isDisabled={isConfirmed}
              />
              <ChargeAutocomplete
                form={form}
                name="chargeId"
                label="Charge"
                taskId={Task.OtherService}
                isRequired={true}
                isDisabled={isConfirmed}
                onChangeEvent={handleChargeChange}
              />
              <ChartOfAccountAutocomplete
                form={form}
                name="glId"
                label="GL Account"
                isRequired={true}
                isDisabled={isConfirmed}
              />
              <UomAutocomplete
                form={form}
                name="uomId"
                label="UOM"
                isRequired={true}
                isDisabled={isConfirmed}
              />
              <CustomDateNew
                form={form}
                name="date"
                label="Service Date"
                isRequired={true}
                dateFormat={dateFormat}
                isDisabled={isConfirmed}
              />
              <StatusTaskAutocomplete
                form={form}
                name="statusId"
                label="Status"
                isRequired={true}
                isDisabled={isConfirmed}
              />

              {/* Show Quantity field only if NOT "Cash to master" charge */}
              {!isCashToMaster && (
                <CustomInput
                  form={form}
                  name="quantity"
                  label="Quantity"
                  type="number"
                  isRequired
                  isDisabled={isConfirmed}
                />
              )}

              {/* Show Amount field only if "Cash to master" charge */}
              {isCashToMaster && (
                <CustomInput
                  form={form}
                  name="amount"
                  label="Amount"
                  type="number"
                  isRequired
                  isDisabled={isConfirmed}
                />
              )}
            </div>
            <div className="grid grid-cols-1 gap-2">
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
                    ? "Update Other Service"
                    : "Add Other Service"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
