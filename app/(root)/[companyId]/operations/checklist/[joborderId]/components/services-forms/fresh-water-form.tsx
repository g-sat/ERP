"use client"

import { useEffect } from "react"
import { IFreshWater, IJobOrderHd } from "@/interfaces/checklist"
import { FreshWaterSchema, FreshWaterSchemaType } from "@/schemas/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { clientDateFormat, parseDate } from "@/lib/date-utils"
import { Task } from "@/lib/operations-utils"
import { useChartofAccountLookup } from "@/hooks/use-lookup"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import BargeAutocomplete from "@/components/autocomplete/autocomplete-barge"
import ChargeAutocomplete from "@/components/autocomplete/autocomplete-charge"
import ChartOfAccountAutocomplete from "@/components/autocomplete/autocomplete-chartofaccount"
import StatusTaskAutocomplete from "@/components/autocomplete/autocomplete-status-task"
import UomAutocomplete from "@/components/autocomplete/autocomplete-uom"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/custom/custom-accordion"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import CustomInput from "@/components/custom/custom-input"
import CustomTextarea from "@/components/custom/custom-textarea"
import { FormLoadingSpinner } from "@/components/skeleton/loading-spinner"

interface FreshWaterFormProps {
  jobData: IJobOrderHd
  initialData?: IFreshWater
  taskDefaults?: Record<string, number> // Add taskDefaults prop
  submitAction: (data: FreshWaterSchemaType) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isConfirmed?: boolean
}

export function FreshWaterForm({
  jobData,
  initialData,
  taskDefaults = {}, // Default to empty object
  submitAction,
  onCancel,
  isSubmitting = false,
  isConfirmed,
}: FreshWaterFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"

  // Get chart of account data to ensure it's loaded before setting form values
  const { isLoading: isChartOfAccountLoading } = useChartofAccountLookup(
    Number(jobData.companyId)
  )

  console.log("initialData :", initialData)
  const form = useForm<FreshWaterSchemaType>({
    resolver: zodResolver(FreshWaterSchema),
    defaultValues: {
      freshWaterId: initialData?.freshWaterId ?? 0,
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      taskId: Task.FreshWater,
      date: initialData?.date
        ? format(
            parseDate(initialData.date as string) || new Date(),
            clientDateFormat
          )
        : format(new Date(), clientDateFormat),
      quantity: initialData?.quantity ?? 0,
      receiptNo: initialData?.receiptNo ?? "",
      distance: initialData?.distance ?? 0,
      glId: initialData?.glId ?? taskDefaults.glId ?? 0,
      chargeId: initialData?.chargeId ?? taskDefaults.chargeId ?? 0,
      statusId: initialData?.statusId ?? 802,
      uomId: initialData?.uomId ?? 0,
      remarks: initialData?.remarks ?? "",
      debitNoteId: initialData?.debitNoteId ?? 0,
      debitNoteNo: initialData?.debitNoteNo ?? "",
      bargeId: initialData?.bargeId ?? 0,
      operatorName: initialData?.operatorName ?? "",
      supplyBarge: initialData?.supplyBarge ?? "",
      editVersion: initialData?.editVersion ?? 0,
    },
  })

  useEffect(() => {
    form.reset({
      freshWaterId: initialData?.freshWaterId ?? 0,
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      taskId: Task.FreshWater,
      date: initialData?.date
        ? format(
            parseDate(initialData.date as string) || new Date(),
            clientDateFormat
          )
        : format(new Date(), clientDateFormat),
      quantity: initialData?.quantity ?? 0,
      receiptNo: initialData?.receiptNo ?? "",
      distance: initialData?.distance ?? 0,
      glId: initialData?.glId ?? taskDefaults.glId ?? 0,
      chargeId: initialData?.chargeId ?? taskDefaults.chargeId ?? 0,
      statusId: initialData?.statusId ?? 802,
      uomId: initialData?.uomId ?? 0,
      remarks: initialData?.remarks ?? "",
      debitNoteId: initialData?.debitNoteId ?? 0,
      debitNoteNo: initialData?.debitNoteNo ?? "",
      bargeId: initialData?.bargeId ?? 0,
      operatorName: initialData?.operatorName ?? "",
      supplyBarge: initialData?.supplyBarge ?? "",
      editVersion: initialData?.editVersion ?? 0,
    })
  }, [
    initialData,
    taskDefaults,
    form,
    jobData.jobOrderId,
    jobData.jobOrderNo,
    isChartOfAccountLoading,
  ])

  // Show loading state while data is being fetched
  if (isChartOfAccountLoading) {
    return (
      <div className="max-w flex flex-col gap-2">
        <FormLoadingSpinner text="Loading form data..." />
      </div>
    )
  }

  const onSubmit = (data: FreshWaterSchemaType) => {
    submitAction(data)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
          <div className="grid gap-2">
            <div className="grid grid-cols-3 gap-2">
              <CustomDateNew
                form={form}
                name="date"
                label="Date"
                isRequired={true}
                dateFormat={dateFormat}
                isDisabled={isConfirmed}
              />
              <BargeAutocomplete
                form={form}
                name="bargeId"
                label="Barge Name"
                isRequired={true}
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="operatorName"
                label="Barge Operator"
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="supplyBarge"
                label="Supply Barge"
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="distance"
                label="Distance"
                type="number"
                isRequired={true}
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="quantity"
                label="Quantity"
                type="number"
                isRequired={true}
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="receiptNo"
                label="Receipt Number"
                type="number"
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
              <ChartOfAccountAutocomplete
                form={form}
                name="glId"
                label="GL Account"
                isRequired={true}
                isDisabled={isConfirmed}
                companyId={jobData.companyId}
              />
              <ChargeAutocomplete
                form={form}
                name="chargeId"
                label="Charge"
                taskId={Task.FreshWater}
                isRequired={true}
                isDisabled={isConfirmed}
                companyId={jobData.companyId}
              />
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
                <div className="space-y-3 pt-4">
                  <div className="border-t pt-4">
                    <CustomAccordion
                      type="single"
                      collapsible
                      className="bg-muted/30 rounded-lg border-0"
                    >
                      <CustomAccordionItem
                        value="audit-info"
                        className="border-none"
                      >
                        <CustomAccordionTrigger className="hover:bg-muted/50 rounded-lg px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">
                              Audit Trail
                            </span>
                            <div className="flex items-center gap-2">
                              {initialData.createDate && (
                                <Badge
                                  variant="secondary"
                                  className="px-2 py-1 text-xs"
                                >
                                  Created
                                </Badge>
                              )}
                              {initialData.editDate && (
                                <Badge
                                  variant="secondary"
                                  className="px-2 py-1 text-xs"
                                >
                                  Modified
                                </Badge>
                              )}
                              {initialData.editVersion > 0 && (
                                <Badge
                                  variant="destructive"
                                  className="px-2 py-1 text-xs"
                                >
                                  Edit Version No. {initialData.editVersion}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CustomAccordionTrigger>
                        <CustomAccordionContent className="px-4 pb-4">
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {initialData.createDate && (
                              <div className="bg-background rounded-md border p-2">
                                <div className="space-y-1">
                                  <p className="text-muted-foreground text-xs">
                                    Created By
                                  </p>
                                  <p className="text-sm font-semibold">
                                    {initialData.createBy}
                                  </p>
                                  <p className="text-muted-foreground text-xs">
                                    {format(
                                      new Date(initialData.createDate),
                                      datetimeFormat
                                    )}
                                  </p>
                                </div>
                              </div>
                            )}
                            {initialData.editBy && (
                              <div className="bg-background rounded-md border p-2">
                                <div className="space-y-1">
                                  <p className="text-muted-foreground text-xs">
                                    Modified By
                                  </p>
                                  <p className="text-sm font-semibold">
                                    {initialData.editBy}
                                  </p>
                                  <p className="text-muted-foreground text-xs">
                                    {initialData.editDate
                                      ? format(
                                          new Date(initialData.editDate),
                                          datetimeFormat
                                        )
                                      : "-"}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </CustomAccordionContent>
                      </CustomAccordionItem>
                    </CustomAccordion>
                  </div>
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
                    ? "Update Fresh Water"
                    : "Add Fresh Water"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
