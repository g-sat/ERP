"use client"

import { useEffect } from "react"
import { IJobOrderHd, IMedicalAssistance } from "@/interfaces/checklist"
import {
  MedicalAssistanceFormValues,
  MedicalAssistanceSchema,
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
import RankAutocomplete from "@/components/ui-custom/autocomplete-rank"
import StatusTaskAutocomplete from "@/components/ui-custom/autocomplete-status-task"
import VisaTypeAutocomplete from "@/components/ui-custom/autocomplete-visatype"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/ui-custom/custom-accordion"
import { CustomDateNew } from "@/components/ui-custom/custom-date-new"
import CustomInput from "@/components/ui-custom/custom-input"
import CustomTextarea from "@/components/ui-custom/custom-textarea"

interface MedicalAssistanceFormProps {
  jobData: IJobOrderHd
  initialData?: IMedicalAssistance
  submitAction: (data: MedicalAssistanceFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isConfirmed?: boolean
}

export function MedicalAssistanceForm({
  jobData,
  initialData,
  submitAction,
  onCancel,
  isSubmitting = false,
  isConfirmed,
}: MedicalAssistanceFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"

  console.log("initialData :", initialData)
  const form = useForm<MedicalAssistanceFormValues>({
    resolver: zodResolver(MedicalAssistanceSchema),
    defaultValues: {
      medicalAssistanceId: initialData?.medicalAssistanceId ?? 0,
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      taskId: Task.MedicalAssistance,
      chargeId: initialData?.chargeId ?? 0,
      glId: initialData?.glId ?? 0,
      rankId: initialData?.rankId ?? 0,
      statusId: initialData?.statusId ?? 802,
      crewName: initialData?.crewName ?? "",
      nationality: initialData?.nationality ?? "",
      reason: initialData?.reason ?? "",
      admittedDate: initialData?.admittedDate
        ? format(
            parseDate(initialData.admittedDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      dischargedDate: initialData?.dischargedDate
        ? format(
            parseDate(initialData.dischargedDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      remarks: initialData?.remarks ?? "",
      debitNoteId: initialData?.debitNoteId ?? 0,
      debitNoteNo: initialData?.debitNoteNo ?? "",
      visaTypeId: initialData?.visaTypeId ?? 106,
    },
  })

  useEffect(() => {
    form.reset({
      medicalAssistanceId: initialData?.medicalAssistanceId ?? 0,
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      taskId: Task.MedicalAssistance,
      chargeId: initialData?.chargeId ?? 0,
      glId: initialData?.glId ?? 0,
      rankId: initialData?.rankId ?? 0,
      statusId: initialData?.statusId ?? 802,
      crewName: initialData?.crewName ?? "",
      nationality: initialData?.nationality ?? "",
      reason: initialData?.reason ?? "",
      admittedDate: initialData?.admittedDate
        ? format(
            parseDate(initialData.admittedDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      dischargedDate: initialData?.dischargedDate
        ? format(
            parseDate(initialData.dischargedDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      remarks: initialData?.remarks ?? "",
      debitNoteId: initialData?.debitNoteId ?? 0,
      debitNoteNo: initialData?.debitNoteNo ?? "",
      visaTypeId: initialData?.visaTypeId ?? 106,
    })
  }, [initialData, form, jobData.jobOrderId, jobData.jobOrderNo])

  const onSubmit = (data: MedicalAssistanceFormValues) => {
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
                name="crewName"
                label="Crew Name/Patient"
                isRequired
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="nationality"
                label="Nationality"
                isRequired
                isDisabled={isConfirmed}
              />
              <RankAutocomplete
                form={form}
                name="rankId"
                label="Rank"
                isDisabled={isConfirmed}
              />
              <VisaTypeAutocomplete
                form={form}
                name="visaTypeId"
                label="Visa Type"
                isDisabled={isConfirmed}
              />
              <ChargeAutocomplete
                form={form}
                name="chargeId"
                label="Charge"
                taskId={Task.MedicalAssistance}
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
              <CustomDateNew
                form={form}
                name="admittedDate"
                label="Admitted Date"
                dateFormat={dateFormat}
                isDisabled={isConfirmed}
              />
              <CustomDateNew
                form={form}
                name="dischargedDate"
                label="Discharged Date"
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
            </div>
            <div className="grid grid-cols-2 gap-2">
              <CustomTextarea
                form={form}
                name="reason"
                label="Reason for Treatment"
                isDisabled={isConfirmed}
              />
              <CustomTextarea
                form={form}
                name="remarks"
                label="Remarks"
                isDisabled={isConfirmed}
              />
            </div>

            {initialData &&
              (initialData.createBy ||
                initialData.createDate ||
                initialData.editBy ||
                initialData.editDate) && (
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
              {isConfirmed ? "Close" : "Cancel"}
            </Button>
            {!isConfirmed && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : initialData
                    ? "Update Medical Assistance"
                    : "Add Medical Assistance"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
