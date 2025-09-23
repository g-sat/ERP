"use client"

import { useEffect } from "react"
import { IJobOrderHd, ITechnicianSurveyor } from "@/interfaces/checklist"
import {
  TechnicianSurveyorFormValues,
  TechnicianSurveyorSchema,
} from "@/schemas/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { clientDateFormat, parseDate } from "@/lib/format"
import { Task } from "@/lib/operations-utils"
import { useChartofAccountLookup } from "@/hooks/use-lookup"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { FormLoadingSpinner } from "@/components/loading-spinner"
import ChargeAutocomplete from "@/components/ui-custom/autocomplete-charge"
import ChartOfAccountAutocomplete from "@/components/ui-custom/autocomplete-chartofaccount"
import PassTypeAutocomplete from "@/components/ui-custom/autocomplete-passtype"
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

interface TechniciansSurveyorsFormProps {
  jobData: IJobOrderHd
  initialData?: ITechnicianSurveyor
  taskDefaults?: Record<string, number> // Add taskDefaults prop
  submitAction: (data: TechnicianSurveyorFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isConfirmed?: boolean
}

export function TechniciansSurveyorsForm({
  jobData,
  initialData,
  taskDefaults = {}, // Default to empty object
  submitAction,
  onCancel,
  isSubmitting = false,
  isConfirmed,
}: TechniciansSurveyorsFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"

  // Get chart of account data to ensure it's loaded before setting form values
  const { isLoading: isChartOfAccountLoading } = useChartofAccountLookup(
    Number(jobData.companyId)
  )

  console.log("initialData :", initialData)
  const form = useForm<TechnicianSurveyorFormValues>({
    resolver: zodResolver(TechnicianSurveyorSchema),
    defaultValues: {
      technicianSurveyorId: initialData?.technicianSurveyorId ?? 0,
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      taskId: Task.TechniciansSurveyors,
      glId: initialData?.glId ?? taskDefaults.glId ?? 0,
      chargeId: initialData?.chargeId ?? taskDefaults.chargeId ?? 0,
      name: initialData?.name ?? "",
      quantity: initialData?.quantity ?? 1,
      uomId: initialData?.uomId ?? 0,
      natureOfAttendance: initialData?.natureOfAttendance ?? "",
      companyInfo: initialData?.companyInfo ?? "",
      passTypeId: initialData?.passTypeId ?? 0,
      embarked: initialData?.embarked
        ? format(
            parseDate(initialData.embarked as string) || new Date(),
            clientDateFormat
          )
        : "",
      disembarked: initialData?.disembarked
        ? format(
            parseDate(initialData.disembarked as string) || new Date(),
            clientDateFormat
          )
        : "",
      portRequestNo: initialData?.portRequestNo ?? "",
      statusId: initialData?.statusId ?? 802,
      remarks: initialData?.remarks ?? "",
      debitNoteId: initialData?.debitNoteId ?? 0,
      debitNoteNo: initialData?.debitNoteNo ?? "",
      editVersion: initialData?.editVersion ?? 0,
    },
  })

  useEffect(() => {
    form.reset({
      technicianSurveyorId: initialData?.technicianSurveyorId ?? 0,
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      taskId: Task.TechniciansSurveyors,
      glId: initialData?.glId ?? taskDefaults.glId ?? 0,
      chargeId: initialData?.chargeId ?? taskDefaults.chargeId ?? 0,
      name: initialData?.name ?? "",
      quantity: initialData?.quantity ?? 1,
      uomId: initialData?.uomId ?? 0,
      natureOfAttendance: initialData?.natureOfAttendance ?? "",
      companyInfo: initialData?.companyInfo ?? "",
      passTypeId: initialData?.passTypeId ?? 0,
      embarked: initialData?.embarked
        ? format(
            parseDate(initialData.embarked as string) || new Date(),
            clientDateFormat
          )
        : "",
      disembarked: initialData?.disembarked
        ? format(
            parseDate(initialData.disembarked as string) || new Date(),
            clientDateFormat
          )
        : "",
      portRequestNo: initialData?.portRequestNo ?? "",
      statusId: initialData?.statusId ?? 802,
      remarks: initialData?.remarks ?? "",
      debitNoteId: initialData?.debitNoteId ?? 0,
      debitNoteNo: initialData?.debitNoteNo ?? "",
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

  const onSubmit = (data: TechnicianSurveyorFormValues) => {
    submitAction(data)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
          <div className="grid gap-2">
            <div className="grid grid-cols-3 gap-2">
              <CustomInput
                form={form}
                name="name"
                label="Name"
                isRequired
                isDisabled={isConfirmed}
              />
              <ChargeAutocomplete
                form={form}
                name="chargeId"
                label="Charge"
                taskId={Task.TechniciansSurveyors}
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
              <PassTypeAutocomplete
                form={form}
                name="passTypeId"
                label="Pass Type"
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
              <UomAutocomplete
                form={form}
                name="uomId"
                label="UOM"
                isRequired
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="natureOfAttendance"
                label="Nature of Attendance"
                isRequired
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="companyInfo"
                label="Company"
                isRequired
                isDisabled={isConfirmed}
              />

              <CustomDateNew
                form={form}
                name="embarked"
                label="Embarked Date"
                dateFormat={dateFormat}
                isDisabled={isConfirmed}
              />
              <CustomDateNew
                form={form}
                name="disembarked"
                label="Disembarked Date"
                dateFormat={dateFormat}
                isDisabled={isConfirmed}
              />

              <CustomInput
                form={form}
                name="portRequestNo"
                label="Port Request No"
                isDisabled={isConfirmed}
              />
              <StatusTaskAutocomplete
                form={form}
                name="statusId"
                label="Status"
                isRequired
                isDisabled={isConfirmed}
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
                    ? "Update Technician/Surveyor"
                    : "Add Technician/Surveyor"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
