"use client"

import { useEffect } from "react"
import { IEquipmentUsed, IJobOrderHd } from "@/interfaces/checklist"
import {
  EquipmentUsedFormValues,
  EquipmentUsedSchema,
} from "@/schemas/checklist"
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
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/ui-custom/custom-accordion"
import { CustomDateNew } from "@/components/ui-custom/custom-date-new"
import CustomInput from "@/components/ui-custom/custom-input"
import CustomSwitch from "@/components/ui-custom/custom-switch"
import CustomTextarea from "@/components/ui-custom/custom-textarea"

interface EquipmentUsedFormProps {
  jobData: IJobOrderHd
  initialData?: IEquipmentUsed
  taskDefaults?: Record<string, number> // Add taskDefaults prop
  submitAction: (data: EquipmentUsedFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isConfirmed?: boolean
}

export function EquipmentUsedForm({
  jobData,
  initialData,
  taskDefaults = {}, // Default to empty object
  submitAction,
  onCancel,
  isSubmitting = false,
  isConfirmed,
}: EquipmentUsedFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"

  // Debug logs
  console.log("Equipment Used Form Props:")
  console.log("- isConfirmed:", isConfirmed)
  console.log("- isSubmitting:", isSubmitting)
  console.log("- initialData:", initialData)
  console.log("- initialData?.date:", initialData?.date)
  console.log("- parsed date:", parseDate(initialData?.date as string))
  console.log(
    "- formatted date:",
    format(
      parseDate(initialData?.date as string) || new Date(),
      clientDateFormat
    )
  )

  const form = useForm<EquipmentUsedFormValues>({
    resolver: zodResolver(EquipmentUsedSchema),
    defaultValues: {
      equipmentUsedId: initialData?.equipmentUsedId ?? 0,
      date: initialData?.date
        ? format(
            parseDate(initialData.date as string) || new Date(),
            clientDateFormat
          )
        : format(new Date(), clientDateFormat),
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      taskId: Task.EquipmentUsed,
      chargeId: initialData?.chargeId ?? taskDefaults.chargeId ?? 0,
      glId: initialData?.glId ?? taskDefaults.glId ?? 0,
      referenceNo: initialData?.referenceNo ?? "",
      mafi: initialData?.mafi ?? "",
      others: initialData?.others ?? "",
      forkliftChargeId: initialData?.forkliftChargeId ?? 0,
      craneChargeId: initialData?.craneChargeId ?? 0,
      stevedoreChargeId: initialData?.stevedoreChargeId ?? 0,
      loadingRefNo: initialData?.loadingRefNo ?? "",
      craneloading: initialData?.craneloading ?? 0,
      forkliftloading: initialData?.forkliftloading ?? 0,
      stevedoreloading: initialData?.stevedoreloading ?? 0,
      offloadingRefNo: initialData?.offloadingRefNo ?? "",
      craneOffloading: initialData?.craneOffloading ?? 0,
      forkliftOffloading: initialData?.forkliftOffloading ?? 0,
      stevedoreOffloading: initialData?.stevedoreOffloading ?? 0,
      launchServiceId: initialData?.launchServiceId ?? 0,
      remarks: initialData?.remarks ?? "",
      statusId: initialData?.statusId ?? 802,
      isEquimentFooter: initialData?.isEquimentFooter ?? false,
      equimentFooter: initialData?.equimentFooter ?? "",
      debitNoteId: initialData?.debitNoteId ?? 0,
      debitNoteNo: initialData?.debitNoteNo ?? "",
    },
  })

  useEffect(() => {
    form.reset({
      equipmentUsedId: initialData?.equipmentUsedId ?? 0,
      date: initialData?.date
        ? format(
            parseDate(initialData.date as string) || new Date(),
            clientDateFormat
          )
        : format(new Date(), clientDateFormat),
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      taskId: Task.EquipmentUsed,
      chargeId: initialData?.chargeId ?? taskDefaults.chargeId ?? 0,
      glId: initialData?.glId ?? taskDefaults.glId ?? 0,
      referenceNo: initialData?.referenceNo ?? "",
      mafi: initialData?.mafi ?? "",
      others: initialData?.others ?? "",
      forkliftChargeId: initialData?.forkliftChargeId ?? 0,
      craneChargeId: initialData?.craneChargeId ?? 0,
      stevedoreChargeId: initialData?.stevedoreChargeId ?? 0,
      loadingRefNo: initialData?.loadingRefNo ?? "",
      craneloading: initialData?.craneloading ?? 0,
      forkliftloading: initialData?.forkliftloading ?? 0,
      stevedoreloading: initialData?.stevedoreloading ?? 0,
      offloadingRefNo: initialData?.offloadingRefNo ?? "",
      craneOffloading: initialData?.craneOffloading ?? 0,
      forkliftOffloading: initialData?.forkliftOffloading ?? 0,
      stevedoreOffloading: initialData?.stevedoreOffloading ?? 0,
      launchServiceId: initialData?.launchServiceId ?? 0,
      remarks: initialData?.remarks ?? "",
      statusId: initialData?.statusId ?? 802,
      isEquimentFooter: initialData?.isEquimentFooter ?? false,
      equimentFooter: initialData?.equimentFooter ?? "",
      debitNoteId: initialData?.debitNoteId ?? 0,
      debitNoteNo: initialData?.debitNoteNo ?? "",
    })
  }, [initialData, form, jobData.jobOrderId, jobData.jobOrderNo])

  // Log form validation state
  useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) {
      console.log("Form validation errors:", form.formState.errors)
    }
  }, [form.formState.errors])

  const onSubmit = (data: EquipmentUsedFormValues) => {
    console.log("Submitting form data:", data)
    try {
      // Log form state
      console.log("Form is valid:", form.formState.isValid)
      console.log("Form is submitting:", form.formState.isSubmitting)
      console.log(
        "Form is submitting successfully:",
        form.formState.isSubmitSuccessful
      )

      submitAction(data)
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
          <div className="grid gap-2">
            <div className="grid grid-cols-4 gap-2">
              <CustomDateNew
                form={form}
                name="date"
                label="Date"
                isRequired={true}
                dateFormat={dateFormat}
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="referenceNo"
                label="Reference Number"
                isRequired
                isDisabled={isConfirmed}
              />
              <ChargeAutocomplete
                form={form}
                name="chargeId"
                label="Charge Name"
                taskId={Task.EquipmentUsed}
                isRequired={true}
                isDisabled={isConfirmed}
                companyId={jobData.companyId}
              />
              <ChartOfAccountAutocomplete
                form={form}
                name="glId"
                label="GL Account"
                isRequired={true}
                isDisabled={isConfirmed}
                companyId={jobData.companyId}
              />
              <CustomInput
                form={form}
                name="mafi"
                label="MAFI"
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="others"
                label="Others"
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="launchServiceId"
                label="Launch Service"
                type="number"
                isDisabled={isConfirmed}
              />

              <StatusTaskAutocomplete
                form={form}
                name="statusId"
                label="Status"
                isRequired={true}
                isDisabled={isConfirmed}
              />
            </div>

            {/* Updated Charges Section - Matches your image */}
            <div className="grid grid-cols-4 gap-4 rounded-lg border p-4">
              {/*   TallySheet No Section */}
              <div className="space-y-4">
                <h3 className="text-center font-bold">TallySheet No</h3>

                <CustomInput
                  form={form}
                  name="loadingRefNo"
                  label="Loading TallySheet No"
                  isDisabled={isConfirmed}
                />
                <CustomInput
                  form={form}
                  name="offloadingRefNo"
                  label="Offloading TallySheet No"
                  isDisabled={isConfirmed}
                />
              </div>
              {/* Crane Charge Section */}
              <div className="space-y-4">
                <h3 className="text-center font-bold">Crane Hire Charges</h3>
                <ChargeAutocomplete
                  form={form}
                  name="craneChargeId"
                  label="Crane Charge"
                  taskId={Task.EquipmentUsed}
                  isDisabled={isConfirmed}
                  companyId={jobData.companyId}
                />
                <CustomInput
                  form={form}
                  name="craneloading"
                  label="Crane Loading (hr)"
                  type="number"
                  isDisabled={isConfirmed}
                />
                <CustomInput
                  form={form}
                  name="craneOffloading"
                  label="Crane Offloading (hr)"
                  type="number"
                  isDisabled={isConfirmed}
                />
              </div>

              {/* Forklift Charge Section */}
              <div className="space-y-4">
                <h3 className="text-center font-bold">ForkLift Charge</h3>
                <ChargeAutocomplete
                  form={form}
                  name="forkliftChargeId"
                  label="ForkLift Charge"
                  taskId={Task.EquipmentUsed}
                  isDisabled={isConfirmed}
                  companyId={jobData.companyId}
                />
                <CustomInput
                  form={form}
                  name="forkliftloading"
                  label="ForkLift Loading (hr)"
                  type="number"
                  isDisabled={isConfirmed}
                />
                <CustomInput
                  form={form}
                  name="forkliftOffloading"
                  label="ForkLift OffLoading (hr)"
                  type="number"
                  isDisabled={isConfirmed}
                />
              </div>

              {/* Stevedore Charge Section */}
              <div className="space-y-4">
                <h3 className="text-center font-bold">Stevedor Charge</h3>
                <ChargeAutocomplete
                  form={form}
                  name="stevedoreChargeId"
                  label="Stevedore Charge"
                  taskId={Task.EquipmentUsed}
                  isDisabled={isConfirmed}
                  companyId={jobData.companyId}
                />
                <CustomInput
                  form={form}
                  name="stevedoreloading"
                  label="Stevedor Loading (Nos)"
                  type="number"
                  isDisabled={isConfirmed}
                />
                <CustomInput
                  form={form}
                  name="stevedoreOffloading"
                  label="Stevedor OffLoad (Nos)"
                  type="number"
                  isDisabled={isConfirmed}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <CustomTextarea
                form={form}
                name="remarks"
                label="Remarks"
                isDisabled={isConfirmed}
              />
              <div>
                <CustomSwitch
                  form={form}
                  name="isEquimentFooter"
                  label="Equipment Footer"
                  isDisabled={isConfirmed}
                />
                {form.watch("isEquimentFooter") && (
                  <CustomTextarea
                    form={form}
                    name="equimentFooter"
                    label="Equipment Footer"
                    isDisabled={isConfirmed}
                  />
                )}
              </div>
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
              {isConfirmed ? "Close" : "Cancel"}
            </Button>
            {!isConfirmed && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : initialData
                    ? "Update Equipment Used"
                    : "Add Equipment Used"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
