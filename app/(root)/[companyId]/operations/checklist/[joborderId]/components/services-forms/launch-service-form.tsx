"use client"

import { useEffect } from "react"
import { IJobOrderHd, ILaunchService } from "@/interfaces/checklist"
import {
  LaunchServiceSchema,
  LaunchServiceSchemaType,
} from "@/schemas/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { differenceInMinutes, format, isValid, parse } from "date-fns"
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
import PortAutocomplete from "@/components/autocomplete/autocomplete-port"
import StatusTaskAutocomplete from "@/components/autocomplete/autocomplete-status-task"
import UomAutocomplete from "@/components/autocomplete/autocomplete-uom"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/custom/custom-accordion"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import { CustomDateTimeNew } from "@/components/custom/custom-date-time-new"
import { CustomDateTimePicker } from "@/components/custom/custom-date-time-picker"
import CustomInput from "@/components/custom/custom-input"
import CustomTextarea from "@/components/custom/custom-textarea"
import { FormLoadingSpinner } from "@/components/skeleton/loading-spinner"

interface LaunchServiceFormProps {
  jobData: IJobOrderHd
  initialData?: ILaunchService
  taskDefaults?: Record<string, number> // Add taskDefaults prop
  submitAction: (data: LaunchServiceSchemaType) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isConfirmed?: boolean
}

export function LaunchServiceForm({
  jobData,
  initialData,
  taskDefaults = {}, // Default to empty object
  submitAction,
  onCancel,
  isSubmitting = false,
  isConfirmed,
}: LaunchServiceFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"

  // Get chart of account data to ensure it's loaded before setting form values
  const { isLoading: isChartOfAccountLoading } = useChartofAccountLookup(
    Number(jobData.companyId)
  )

  console.log("initialData LaunchServiceForm :", initialData)
  console.log("isConfirmed LaunchServiceForm :", isConfirmed)

  const formatDateTimeForForm = (dateTime: string | undefined) => {
    if (!dateTime) return ""
    const parsed = parse(dateTime, datetimeFormat, new Date())
    return isValid(parsed) ? format(parsed, "yyyy-MM-dd'T'HH:mm") : ""
  }

  const form = useForm<LaunchServiceSchemaType>({
    resolver: zodResolver(LaunchServiceSchema),
    defaultValues: {
      launchServiceId: initialData?.launchServiceId ?? 0,
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      taskId: Task.LaunchServices,
      date: initialData?.date
        ? format(
            parseDate(initialData.date as string) || new Date(),
            clientDateFormat
          )
        : format(new Date(), clientDateFormat),
      glId: initialData?.glId ?? 0,
      chargeId: initialData?.chargeId ?? 0,
      uomId: initialData?.uomId ?? 0,
      ameTally: initialData?.ameTally ?? "",
      boatopTally: initialData?.boatopTally ?? "",
      distance: initialData?.distance ?? 0,
      loadingTime: formatDateTimeForForm(initialData?.loadingTime),
      leftJetty: formatDateTimeForForm(initialData?.leftJetty),
      alongsideVessel: formatDateTimeForForm(initialData?.alongsideVessel),
      departedFromVessel: formatDateTimeForForm(
        initialData?.departedFromVessel
      ),
      arrivedAtJetty: formatDateTimeForForm(initialData?.arrivedAtJetty),
      waitingTime: initialData?.waitingTime ?? 0,
      timeDiff: initialData?.timeDiff ?? 0,
      deliveredWeight: initialData?.deliveredWeight ?? 0,
      landedWeight: initialData?.landedWeight ?? 0,
      boatOperator: initialData?.boatOperator ?? "",
      annexure: initialData?.annexure ?? "",
      invoiceNo: initialData?.invoiceNo ?? "",
      portId: initialData?.portId ?? 0,
      bargeId: initialData?.bargeId ?? 0,
      statusId: initialData?.statusId ?? taskDefaults.statusTypeId ?? 802,
      debitNoteId: initialData?.debitNoteId ?? 0,
      debitNoteNo: initialData?.debitNoteNo ?? "",
      remarks: initialData?.remarks ?? "",
      editVersion: initialData?.editVersion ?? 0,
    },
  })

  useEffect(() => {
    // Only reset form when data is loaded to prevent race conditions
    if (!isChartOfAccountLoading) {
      form.reset({
        launchServiceId: initialData?.launchServiceId ?? 0,
        jobOrderId: jobData.jobOrderId,
        jobOrderNo: jobData.jobOrderNo,
        taskId: Task.LaunchServices,
        date: initialData?.date
          ? format(
              parseDate(initialData.date as string) || new Date(),
              clientDateFormat
            )
          : format(new Date(), clientDateFormat),
        glId: initialData?.glId ?? 0,
        chargeId: initialData?.chargeId ?? 0,
        uomId: initialData?.uomId ?? 0,
        ameTally: initialData?.ameTally ?? "",
        boatopTally: initialData?.boatopTally ?? "",
        distance: initialData?.distance ?? 0,
        loadingTime: formatDateTimeForForm(initialData?.loadingTime),
        leftJetty: formatDateTimeForForm(initialData?.leftJetty),
        alongsideVessel: formatDateTimeForForm(initialData?.alongsideVessel),
        departedFromVessel: formatDateTimeForForm(
          initialData?.departedFromVessel
        ),
        arrivedAtJetty: formatDateTimeForForm(initialData?.arrivedAtJetty),
        waitingTime: initialData?.waitingTime ?? 0,
        timeDiff: initialData?.timeDiff ?? 0,
        deliveredWeight: initialData?.deliveredWeight ?? 0,
        landedWeight: initialData?.landedWeight ?? 0,
        boatOperator: initialData?.boatOperator ?? "",
        annexure: initialData?.annexure ?? "",
        invoiceNo: initialData?.invoiceNo ?? "",
        portId: initialData?.portId ?? 0,
        bargeId: initialData?.bargeId ?? 0,
        remarks: initialData?.remarks ?? "",
        statusId: initialData?.statusId ?? taskDefaults.statusTypeId ?? 802,
        debitNoteId: initialData?.debitNoteId ?? 0,
        debitNoteNo: initialData?.debitNoteNo ?? "",
        editVersion: initialData?.editVersion ?? 0,
      })
    }
  }, [
    initialData,
    taskDefaults,
    form,
    jobData.jobOrderId,
    jobData.jobOrderNo,
    isChartOfAccountLoading,
  ])

  const calculateWaitingTime = () => {
    const loadingTime = form.getValues("loadingTime")
    const leftJetty = form.getValues("leftJetty")
    if (loadingTime && leftJetty) {
      const start = new Date(loadingTime)
      const end = new Date(leftJetty)
      if (isValid(start) && isValid(end)) {
        const diff = differenceInMinutes(end, start)
        form.setValue("waitingTime", diff >= 0 ? diff : 0)
      }
    }
  }

  const calculateTimeDiff = () => {
    const departedFromVessel = form.getValues("departedFromVessel")
    const arrivedAtJetty = form.getValues("arrivedAtJetty")
    if (departedFromVessel && arrivedAtJetty) {
      const start = new Date(departedFromVessel)
      const end = new Date(arrivedAtJetty)
      if (isValid(start) && isValid(end)) {
        const diff = differenceInMinutes(end, start)
        form.setValue("timeDiff", diff >= 0 ? diff : 0)
      }
    }
  }

  const onSubmit = (data: LaunchServiceSchemaType) => {
    submitAction(data)
  }

  // Show loading state while data is being fetched
  if (isChartOfAccountLoading) {
    return (
      <div className="max-w flex flex-col gap-2">
        <FormLoadingSpinner text="Loading form data..." />
      </div>
    )
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid gap-3">
            <div className="grid grid-cols-5 gap-2">
              <CustomDateNew
                form={form}
                name="date"
                label="Service Date"
                isRequired={true}
                isDisabled={isConfirmed}
              />
              <ChargeAutocomplete
                form={form}
                name="chargeId"
                label="Charge Name"
                taskId={Task.LaunchServices}
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
              <UomAutocomplete
                form={form}
                name="uomId"
                label="UOM"
                isRequired={true}
                isDisabled={isConfirmed}
              />
              <BargeAutocomplete
                form={form}
                name="bargeId"
                label="Barge"
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
              <PortAutocomplete
                form={form}
                name="portId"
                label="Port"
                isRequired={true}
                isDisabled={isConfirmed}
              />
            </div>

            {/* Reference Information Section */}
            <div className="grid grid-cols-5 gap-2 rounded border p-2">
              <div className="col-span-5 mb-1 flex justify-center">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  Reference Information
                </span>
              </div>

              <CustomInput
                form={form}
                name="ameTally"
                label="AME Tally"
                isRequired
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="boatopTally"
                label="Boat Operator Tally"
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="boatOperator"
                label="Boat Operator"
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="annexure"
                label="Annexure"
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="invoiceNo"
                label="Invoice Number"
                isDisabled={isConfirmed}
              />
            </div>

            {/* Distance, Timing, Cargo Section */}
            <div className="grid grid-cols-5 gap-2 rounded border p-2">
              <div className="col-span-5 mb-1 flex justify-center">
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                  Distance, Timing & Cargo Information
                </span>
              </div>

              <CustomInput
                form={form}
                name="distance"
                label="Distance (NM)"
                type="number"
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="deliveredWeight"
                label="Cargo Delivered Weight"
                type="number"
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="landedWeight"
                label="Cargo Landed Weight"
                type="number"
                isDisabled={isConfirmed}
              />
              <CustomDateTimePicker
                form={form}
                name="loadingTime"
                label="Loading Time (1)"
                isDisabled={isConfirmed}
                onChangeEvent={() => calculateWaitingTime()}
              />
              <CustomDateTimeNew
                form={form}
                name="leftJetty"
                label="Left Jetty Time (2)"
                isDisabled={isConfirmed}
                onChangeEvent={() => calculateWaitingTime()}
              />
              <CustomInput
                form={form}
                name="waitingTime"
                label="Launch Waiting Time (2-1) (Hrs)"
                type="number"
                isDisabled={true}
              />
              <CustomDateTimeNew
                form={form}
                name="alongsideVessel"
                label="Alongside Vessel Time (3)"
                isDisabled={isConfirmed}
              />
              <CustomDateTimeNew
                form={form}
                name="departedFromVessel"
                label="Departed Vessel Time (4)"
                isDisabled={isConfirmed}
                onChangeEvent={() => calculateTimeDiff()}
              />
              <CustomInput
                form={form}
                name="timeDiff"
                label="Time Difference (4-3) (Hrs)"
                type="number"
                isDisabled={true}
              />
              <CustomDateTimeNew
                form={form}
                name="arrivedAtJetty"
                label="Arrived at Jetty Time (5)"
                isDisabled={isConfirmed}
                onChangeEvent={() => calculateTimeDiff()}
              />
            </div>
            <CustomTextarea
              form={form}
              name="remarks"
              label="Remarks"
              isDisabled={isConfirmed}
            />

            <div className="text-muted-foreground text-sm">
              Note :
              <ul className="list-disc pl-5">
                <li>
                  Launch Hire Time must and should be less than or equals to
                  Left Jetty Time.
                </li>
                <li>
                  Left Jetty Time must and should be less than or equals to
                  Along Side Vessel.
                </li>
                <li>
                  Along Side Vessel must and should be less than or equals to
                  Departed From Vessel.
                </li>
                <li>
                  Departed From Vessel must and should be less than or equals to
                  Back To Base Time.
                </li>
              </ul>
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
                              {initialData.editVersion &&
                                initialData.editVersion > 0 && (
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
          <div className="flex justify-end gap-2 pt-1">
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
                    ? "Update Launch Service"
                    : "Add Launch Service"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
