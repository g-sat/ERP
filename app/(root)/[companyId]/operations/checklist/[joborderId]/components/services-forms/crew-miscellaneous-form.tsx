"use client"

import { useEffect } from "react"
import { ICrewMiscellaneous, IJobOrderHd } from "@/interfaces/checklist"
import {
  CrewMiscellaneousSchema,
  CrewMiscellaneousSchemaType,
} from "@/schemas/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { Task } from "@/lib/operations-utils"
import { useChartofAccountLookup } from "@/hooks/use-lookup"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import {
  ChargeAutocomplete,
  ChartOfAccountAutocomplete,
  StatusTaskAutocomplete,
} from "@/components/autocomplete"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/custom/custom-accordion"
import CustomInput from "@/components/custom/custom-input"
import CustomTextarea from "@/components/custom/custom-textarea"
import { FormLoadingSpinner } from "@/components/skeleton/loading-spinner"

interface CrewMiscellaneousFormProps {
  jobData: IJobOrderHd
  initialData?: ICrewMiscellaneous
  taskDefaults?: Record<string, number> // Add taskDefaults prop
  submitAction: (data: CrewMiscellaneousSchemaType) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isConfirmed?: boolean
}

export function CrewMiscellaneousForm({
  jobData,
  initialData,
  taskDefaults = {}, // Default to empty object
  submitAction,
  onCancel,
  isSubmitting = false,
  isConfirmed,
}: CrewMiscellaneousFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  // Get chart of account data to ensure it's loaded before setting form values
  const { isLoading: isChartOfAccountLoading } = useChartofAccountLookup(
    Number(jobData.companyId)
  )

  console.log("initialData :", initialData)
  const form = useForm<CrewMiscellaneousSchemaType>({
    resolver: zodResolver(CrewMiscellaneousSchema),
    defaultValues: {
      crewMiscellaneousId: initialData?.crewMiscellaneousId ?? 0,
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      taskId: Task.CrewMiscellaneous, // Crew Miscellaneous task ID
      description: initialData?.description ?? "",
      quantity: initialData?.quantity ?? 0,
      statusId: initialData?.statusId ?? taskDefaults.statusId ?? 802,
      glId: initialData?.glId ?? taskDefaults.glId ?? 0,
      chargeId: initialData?.chargeId ?? taskDefaults.chargeId ?? 0,
      remarks: initialData?.remarks ?? "",
      editVersion: initialData?.editVersion ?? 0,
    },
  })

  useEffect(() => {
    form.reset({
      crewMiscellaneousId: initialData?.crewMiscellaneousId ?? 0,
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      taskId: Task.CrewMiscellaneous, // Crew Miscellaneous task ID
      description: initialData?.description ?? "",
      quantity: initialData?.quantity ?? 0,
      statusId: initialData?.statusId ?? taskDefaults.statusId ?? 802,
      glId: initialData?.glId ?? taskDefaults.glId ?? 0,
      chargeId: initialData?.chargeId ?? taskDefaults.chargeId ?? 0,
      remarks: initialData?.remarks ?? "",
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

  const onSubmit = (data: CrewMiscellaneousSchemaType) => {
    submitAction(data)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-2">
              <CustomInput
                form={form}
                name="quantity"
                label="Quantity"
                type="number"
                isRequired
                isDisabled={isConfirmed}
              />
              <ChargeAutocomplete
                form={form}
                name="chargeId"
                label="Charge Name"
                taskId={Task.CrewMiscellaneous}
                isRequired={true}
                isDisabled={isConfirmed}
                companyId={jobData.companyId}
              />
              <ChartOfAccountAutocomplete
                form={form}
                name="glId"
                label="GL Account"
                isRequired={true}
                isDisabled={true}
                companyId={jobData.companyId}
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
                name="description"
                label="Description"
                isRequired
                isDisabled={isConfirmed}
              />
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
              <Button
                type="submit"
                disabled={isSubmitting}
                className={
                  initialData
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "bg-green-600 hover:bg-green-700"
                }
              >
                {isSubmitting
                  ? "Saving..."
                  : initialData
                    ? "Update Crew Miscellaneous"
                    : "Add Crew Miscellaneous"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
