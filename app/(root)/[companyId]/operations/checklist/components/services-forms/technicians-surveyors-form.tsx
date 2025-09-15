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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
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
  submitAction: (data: TechnicianSurveyorFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isConfirmed?: boolean
}

export function TechniciansSurveyorsForm({
  jobData,
  initialData,
  submitAction,
  onCancel,
  isSubmitting = false,
  isConfirmed,
}: TechniciansSurveyorsFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"

  console.log("initialData :", initialData)
  const form = useForm<TechnicianSurveyorFormValues>({
    resolver: zodResolver(TechnicianSurveyorSchema),
    defaultValues: {
      technicianSurveyorId: initialData?.technicianSurveyorId ?? 0,
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      taskId: Task.TechniciansSurveyors,
      glId: initialData?.glId ?? 0,
      chargeId: initialData?.chargeId ?? 0,
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
    },
  })

  useEffect(() => {
    form.reset({
      technicianSurveyorId: initialData?.technicianSurveyorId ?? 0,
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      taskId: Task.TechniciansSurveyors,
      glId: initialData?.glId ?? 0,
      chargeId: initialData?.chargeId ?? 0,
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
    })
  }, [clientDateFormat, initialData, form, jobData])

  const onSubmit = (data: TechnicianSurveyorFormValues) => {
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
              />
              <ChartOfAccountAutocomplete
                form={form}
                name="glId"
                label="GL Account"
                isRequired={true}
                isDisabled={isConfirmed}
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
