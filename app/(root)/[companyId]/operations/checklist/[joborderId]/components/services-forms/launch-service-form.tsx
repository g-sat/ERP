"use client"

import { useEffect } from "react"
import { IJobOrderHd, ILaunchService } from "@/interfaces/checklist"
import {
  LaunchServiceSchema,
  LaunchServiceSchemaType,
} from "@/schemas/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { differenceInMinutes, format, isValid } from "date-fns"
import { useForm } from "react-hook-form"

import {
  clientDateFormat,
  formatDateWithoutTimezone,
  parseDate,
} from "@/lib/date-utils"
import { Task } from "@/lib/operations-utils"
import { useChartofAccountLookup } from "@/hooks/use-lookup"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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

  // Get chart of account data to ensure it's loaded before setting form values
  const { isLoading: isChartOfAccountLoading } = useChartofAccountLookup(
    Number(jobData.companyId)
  )

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
      glId: initialData?.glId ?? taskDefaults.glId ?? 0,
      chargeId: initialData?.chargeId ?? taskDefaults.chargeId ?? 0,
      uomId: initialData?.uomId ?? taskDefaults.uomId ?? 0,
      ameTally: initialData?.ameTally ?? "",
      boatopTally: initialData?.boatopTally ?? "",
      distance: initialData?.distance ?? 0,
      loadingTime: initialData?.loadingTime
        ? parseDate(initialData.loadingTime as string) || undefined
        : undefined,
      leftJetty: initialData?.leftJetty
        ? parseDate(initialData.leftJetty as string) || undefined
        : undefined,
      alongsideVessel: initialData?.alongsideVessel
        ? parseDate(initialData.alongsideVessel as string) || undefined
        : undefined,
      departedFromVessel: initialData?.departedFromVessel
        ? parseDate(initialData.departedFromVessel as string) || undefined
        : undefined,
      arrivedAtJetty: initialData?.arrivedAtJetty
        ? parseDate(initialData.arrivedAtJetty as string) || undefined
        : undefined,
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
        glId: initialData?.glId ?? taskDefaults.glId ?? 0,
        chargeId: initialData?.chargeId ?? taskDefaults.chargeId ?? 0,
        uomId: initialData?.uomId ?? taskDefaults.uomId ?? 0,
        ameTally: initialData?.ameTally ?? "",
        boatopTally: initialData?.boatopTally ?? "",
        distance: initialData?.distance ?? 0,
        loadingTime: initialData?.loadingTime
          ? parseDate(initialData.loadingTime as string) || undefined
          : undefined,
        leftJetty: initialData?.leftJetty
          ? parseDate(initialData.leftJetty as string) || undefined
          : undefined,
        alongsideVessel: initialData?.alongsideVessel
          ? parseDate(initialData.alongsideVessel as string) || undefined
          : undefined,
        departedFromVessel: initialData?.departedFromVessel
          ? parseDate(initialData.departedFromVessel as string) || undefined
          : undefined,
        arrivedAtJetty: initialData?.arrivedAtJetty
          ? parseDate(initialData.arrivedAtJetty as string) || undefined
          : undefined,
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

  // Convert decimal hours to HH:mm format (e.g., 1.14 -> "01:14")
  const formatDecimalHoursToHhMm = (decimalHours: number): string => {
    if (decimalHours < 0) return "00:00"

    const hours = Math.floor(decimalHours)
    const minutes = Math.round((decimalHours % 1) * 100)

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
  }

  // Calculate waiting time and time diff when form data is loaded
  useEffect(() => {
    if (!isChartOfAccountLoading && initialData) {
      setTimeout(() => {
        // Waiting Time
        const loadingTime = form.getValues("loadingTime")
        const leftJetty = form.getValues("leftJetty")
        if (loadingTime && leftJetty) {
          const start = new Date(loadingTime)
          const end = new Date(leftJetty)
          if (isValid(start) && isValid(end)) {
            const diff = differenceInMinutes(end, start)
            const hours = Math.floor(diff / 60)
            const minutes = diff % 60
            const decimalHours = hours + minutes / 100 // Convert to decimal hours format
            form.setValue("waitingTime", decimalHours)
          }
        }

        // Time Diff
        const departedFromVessel = form.getValues("departedFromVessel")
        const alongSideVessel = form.getValues("alongsideVessel")
        if (departedFromVessel && alongSideVessel) {
          const start = new Date(alongSideVessel)
          const end = new Date(departedFromVessel)
          if (isValid(start) && isValid(end)) {
            const diff = differenceInMinutes(end, start)
            const hours = Math.floor(diff / 60)
            const minutes = diff % 60
            const decimalHours = hours + minutes / 100 // Convert to decimal hours format
            form.setValue("timeDiff", decimalHours)
          }
        }
      }, 100)
    }
  }, [isChartOfAccountLoading, initialData, form])

  const calculateWaitingTime = () => {
    const loadingTime = form.getValues("loadingTime")
    const leftJetty = form.getValues("leftJetty")

    if (loadingTime && leftJetty) {
      const start = new Date(loadingTime)
      const end = new Date(leftJetty)

      if (isValid(start) && isValid(end)) {
        const diffMinutes = differenceInMinutes(end, start)
        const hours = Math.floor(diffMinutes / 60)
        const minutes = diffMinutes % 60
        const decimalHours = hours + minutes / 100 // Convert to decimal hours format
        form.setValue("waitingTime", decimalHours)
      }
    }
  }

  const calculateTimeDiff = () => {
    const departedFromVessel = form.getValues("departedFromVessel")
    const alongSideVessel = form.getValues("alongsideVessel")

    if (departedFromVessel && alongSideVessel) {
      const start = new Date(alongSideVessel)
      const end = new Date(departedFromVessel)

      if (isValid(start) && isValid(end)) {
        const diffMinutes = differenceInMinutes(end, start)
        const hours = Math.floor(diffMinutes / 60)
        const minutes = diffMinutes % 60
        const decimalHours = hours + minutes / 100 // Convert to decimal hours format
        form.setValue("timeDiff", decimalHours)
      }
    }
  }

  const onSubmit = (data: LaunchServiceSchemaType) => {
    const formData: LaunchServiceSchemaType = {
      ...data,
      loadingTime:
        data.loadingTime instanceof Date
          ? formatDateWithoutTimezone(data.loadingTime)
          : data.loadingTime,
      leftJetty:
        data.leftJetty instanceof Date
          ? formatDateWithoutTimezone(data.leftJetty)
          : data.leftJetty,
      alongsideVessel:
        data.alongsideVessel instanceof Date
          ? formatDateWithoutTimezone(data.alongsideVessel)
          : data.alongsideVessel,
      departedFromVessel:
        data.departedFromVessel instanceof Date
          ? formatDateWithoutTimezone(data.departedFromVessel)
          : data.departedFromVessel,
      arrivedAtJetty:
        data.arrivedAtJetty instanceof Date
          ? formatDateWithoutTimezone(data.arrivedAtJetty)
          : data.arrivedAtJetty,
    }

    submitAction(formData)
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
            <div className="grid grid-cols-6 gap-2">
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
                isDisabled={true}
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
              <div className="col-span-5 mb-1 flex gap-2">
                <Badge
                  variant="outline"
                  className="border-green-200 bg-green-50 text-green-700 transition-all duration-300 hover:bg-green-100"
                >
                  Distance, Timing & Cargo Information
                </Badge>

                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="animate-pulse cursor-help border-blue-200 bg-blue-50 text-blue-700 transition-all duration-300 hover:bg-blue-100"
                      >
                        <div className="flex items-center gap-1">
                          <svg
                            className="h-3 w-3 animate-bounce"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="font-medium">Time Rules</span>
                        </div>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-sm">
                      <div className="space-y-2">
                        <p className="font-semibold">Time Sequence Rules:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Launch Hire Time ≤ Left Jetty Time</li>
                          <li>• Left Jetty Time ≤ Along Side Vessel</li>
                          <li>• Along Side Vessel ≤ Departed From Vessel</li>
                          <li>• Departed From Vessel ≤ Back To Base Time</li>
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
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
              <CustomDateTimePicker
                form={form}
                name="leftJetty"
                label="Left Jetty Time (2)"
                isDisabled={isConfirmed}
                onChangeEvent={() => calculateWaitingTime()}
              />
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Launch Waiting Time (2-1) (Hrs)
                </label>
                <input
                  type="text"
                  value={formatDecimalHoursToHhMm(
                    form.watch("waitingTime") || 0
                  )}
                  disabled={true}
                  className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="00:00"
                />
              </div>
              <CustomDateTimePicker
                form={form}
                name="alongsideVessel"
                label="Alongside Vessel Time (3)"
                isDisabled={isConfirmed}
                onChangeEvent={() => calculateTimeDiff()}
              />
              <CustomDateTimePicker
                form={form}
                name="departedFromVessel"
                label="Departed Vessel Time (4)"
                isDisabled={isConfirmed}
                onChangeEvent={() => calculateTimeDiff()}
              />
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Time Difference (4-3) (Hrs)
                </label>
                <input
                  type="text"
                  value={formatDecimalHoursToHhMm(form.watch("timeDiff") || 0)}
                  disabled={true}
                  className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="00:00"
                />
              </div>
              <CustomDateTimePicker
                form={form}
                name="arrivedAtJetty"
                label="Arrived at Jetty Time (5)"
                isDisabled={isConfirmed}
              />
            </div>

            <CustomTextarea
              form={form}
              name="remarks"
              label="Remarks"
              isDisabled={isConfirmed}
            />

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
