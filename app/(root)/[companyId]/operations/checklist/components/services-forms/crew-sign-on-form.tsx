"use client"

import { useEffect } from "react"
import { ICrewSignOn, IJobOrderHd } from "@/interfaces/checklist"
import { CrewSignOnFormValues, CrewSignOnSchema } from "@/schemas/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

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
import CustomInput from "@/components/ui-custom/custom-input"
import CustomTextarea from "@/components/ui-custom/custom-textarea"

interface CrewSignOnFormProps {
  jobData: IJobOrderHd
  initialData?: ICrewSignOn
  submitAction: (data: CrewSignOnFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isConfirmed?: boolean
}

export function CrewSignOnForm({
  jobData,
  initialData,
  submitAction,
  onCancel,
  isSubmitting = false,
  isConfirmed,
}: CrewSignOnFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  console.log("initialData :", initialData)
  const form = useForm<CrewSignOnFormValues>({
    resolver: zodResolver(CrewSignOnSchema),
    defaultValues: {
      crewSignOnId: initialData?.crewSignOnId ?? 0,
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      taskId: Task.CrewSignOn,
      chargeId: initialData?.chargeId ?? 0,
      glId: initialData?.glId ?? 0,
      visaTypeId: initialData?.visaTypeId ?? 0,
      crewName: initialData?.crewName ?? "",
      nationality: initialData?.nationality ?? "",
      rankId: initialData?.rankId ?? 0,
      flightDetails: initialData?.flightDetails ?? "",
      hotelName: initialData?.hotelName ?? "",
      departureDetails: initialData?.departureDetails ?? "",
      transportName: initialData?.transportName ?? "",
      clearing: initialData?.clearing ?? "",
      statusId: initialData?.statusId ?? 804,
      remarks: initialData?.remarks ?? "",
      overStayRemark: initialData?.overStayRemark ?? "",
      modificationRemark: initialData?.modificationRemark ?? "",
      cidClearance: initialData?.cidClearance ?? "",
    },
  })

  useEffect(() => {
    form.reset({
      crewSignOnId: initialData?.crewSignOnId ?? 0,
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      taskId: Task.CrewSignOn,
      chargeId: initialData?.chargeId ?? 0,
      glId: initialData?.glId ?? 0,
      visaTypeId: initialData?.visaTypeId ?? 0,
      crewName: initialData?.crewName ?? "",
      nationality: initialData?.nationality ?? "",
      rankId: initialData?.rankId ?? 0,
      flightDetails: initialData?.flightDetails ?? "",
      hotelName: initialData?.hotelName ?? "",
      departureDetails: initialData?.departureDetails ?? "",
      transportName: initialData?.transportName ?? "",
      clearing: initialData?.clearing ?? "",
      statusId: initialData?.statusId ?? 804,
      remarks: initialData?.remarks ?? "",
      overStayRemark: initialData?.overStayRemark ?? "",
      modificationRemark: initialData?.modificationRemark ?? "",
      cidClearance: initialData?.cidClearance ?? "",
    })
  }, [
    initialData,
    form,
    jobData.companyId,
    jobData.jobOrderId,
    jobData.jobOrderNo,
  ])

  const onSubmit = (data: CrewSignOnFormValues) => {
    submitAction(data)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4">
            {/* Main Information Card */}

            <div className="grid grid-cols-3 gap-2">
              <CustomInput
                form={form}
                name="crewName"
                label="Crew Name"
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
              <VisaTypeAutocomplete
                form={form}
                name="visaTypeId"
                label="Visa Type"
                isRequired
                isDisabled={isConfirmed}
              />
              <RankAutocomplete
                form={form}
                name="rankId"
                label="Rank"
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
                name="transportName"
                label="Transport Details"
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="hotelName"
                label="Hotel Name"
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="flightDetails"
                label="Flight Details"
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="departureDetails"
                label="Departure Details"
                isDisabled={isConfirmed}
              />

              <CustomInput
                form={form}
                name="clearing"
                label="Clearing Details"
                isDisabled={isConfirmed}
              />

              <ChargeAutocomplete
                form={form}
                name="chargeId"
                label="Charge Name"
                taskId={Task.CrewSignOn}
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

              <CustomTextarea
                form={form}
                name="overStayRemark"
                label="Over Stay Remark"
                isDisabled={isConfirmed}
              />
              <CustomTextarea
                form={form}
                name="modificationRemark"
                label="Modification Remark"
                isDisabled={isConfirmed}
              />
              <CustomTextarea
                form={form}
                name="cidClearance"
                label="CID Clearance"
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

            {/* Audit Information Card */}
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
                    ? "Update Crew Sign On"
                    : "Add Crew Sign On"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
