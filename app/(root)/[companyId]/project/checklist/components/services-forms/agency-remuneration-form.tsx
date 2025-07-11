"use client"

import { useEffect } from "react"
import { IAgencyRemuneration, IJobOrderHd } from "@/interfaces/checklist"
import {
  AgencyRemunerationFormValues,
  AgencyRemunerationSchema,
} from "@/schemas/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { parseDate } from "@/lib/format"
import { Task } from "@/lib/project-utils"
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
import CustomTextarea from "@/components/ui-custom/custom-textarea"

interface AgencyRemunerationFormProps {
  jobData: IJobOrderHd
  initialData?: IAgencyRemuneration
  submitAction: (data: AgencyRemunerationFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isConfirmed?: boolean
}

export function AgencyRemunerationForm({
  jobData,
  initialData,
  submitAction,
  onCancel,
  isSubmitting = false,
  isConfirmed,
}: AgencyRemunerationFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"

  console.log("initialData :", initialData)
  const form = useForm<AgencyRemunerationFormValues>({
    resolver: zodResolver(AgencyRemunerationSchema),
    defaultValues: {
      agencyRemunerationId: initialData?.agencyRemunerationId ?? 0,
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      taskId: Task.AgencyRemuneration,
      date: initialData?.date
        ? format(
            parseDate(initialData.date as string) || new Date(),
            dateFormat
          )
        : format(new Date(), dateFormat),
      glId: initialData?.glId ?? 0,
      chargeId: initialData?.chargeId ?? 4,
      statusId: initialData?.statusId ?? 802,
      remarks: initialData?.remarks ?? "",
    },
  })

  useEffect(() => {
    form.reset({
      agencyRemunerationId: initialData?.agencyRemunerationId ?? 0,
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      taskId: Task.AgencyRemuneration,
      date: initialData?.date
        ? format(
            parseDate(initialData.date as string) || new Date(),
            dateFormat
          )
        : format(new Date(), dateFormat),
      glId: initialData?.glId ?? 0,
      chargeId: initialData?.chargeId ?? 4,
      statusId: initialData?.statusId ?? 802,
      remarks: initialData?.remarks ?? "",
    })
  }, [initialData, form, jobData.jobOrderId, jobData.jobOrderNo])

  const onSubmit = (data: AgencyRemunerationFormValues) => {
    submitAction(data)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-2">
              <CustomDateNew
                form={form}
                name="date"
                label="Date"
                isRequired={true}
                dateFormat={dateFormat}
                isDisabled={isConfirmed}
              />
              <ChargeAutocomplete
                form={form}
                name="chargeId"
                label="Charge Name"
                taskId={Task.AgencyRemuneration}
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

              <StatusTaskAutocomplete
                form={form}
                name="statusId"
                label="Status"
                isRequired={true}
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
                    ? "Update Agency Remuneration"
                    : "Add Agency Remuneration"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
