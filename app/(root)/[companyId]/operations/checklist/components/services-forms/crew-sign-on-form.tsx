"use client"

import { useEffect } from "react"
import { ICrewSignOn, IJobOrderHd } from "@/interfaces/checklist"
import { CrewSignOnFormValues, CrewSignOnSchema } from "@/schemas/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { Task } from "@/lib/operations-utils"
import { useChartofAccountLookup } from "@/hooks/use-lookup"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { FormLoadingSpinner } from "@/components/loading-spinner"
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
  taskDefaults?: Record<string, number> // Add taskDefaults prop
  submitAction: (data: CrewSignOnFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isConfirmed?: boolean
}

export function CrewSignOnForm({
  jobData,
  initialData,
  taskDefaults = {}, // Default to empty object
  submitAction,
  onCancel,
  isSubmitting = false,
  isConfirmed,
}: CrewSignOnFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  // Get chart of account data to ensure it's loaded before setting form values
  const { isLoading: isChartOfAccountLoading } = useChartofAccountLookup(
    Number(jobData.companyId)
  )

  console.log("initialData :", initialData)
  const form = useForm<CrewSignOnFormValues>({
    resolver: zodResolver(CrewSignOnSchema),
    defaultValues: {
      crewSignOnId: initialData?.crewSignOnId ?? 0,
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      taskId: Task.CrewSignOn,
      chargeId: initialData?.chargeId ?? taskDefaults.chargeId ?? 0,
      glId: initialData?.glId ?? taskDefaults.glId ?? 0,
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
      editVersion: initialData?.editVersion ?? 0,
    },
  })

  useEffect(() => {
    form.reset({
      crewSignOnId: initialData?.crewSignOnId ?? 0,
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      taskId: Task.CrewSignOn,
      chargeId: initialData?.chargeId ?? taskDefaults.chargeId ?? 0,
      glId: initialData?.glId ?? taskDefaults.glId ?? 0,
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

  const onSubmit = (data: CrewSignOnFormValues) => {
    submitAction(data)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
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
