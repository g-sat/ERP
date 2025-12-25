"use client"

import { useCallback, useEffect, useMemo } from "react"
import { IJobOrderHd, ITransportationLog } from "@/interfaces/checklist"
import { IServiceLookup, ITaskLookup } from "@/interfaces/lookup"
import {
  TransportationLogSchema,
  TransportationLogSchemaType,
} from "@/schemas/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, isValid, parse } from "date-fns"
import { FormProvider, useForm } from "react-hook-form"

import { clientDateFormat, parseDate } from "@/lib/date-utils"
import { Button } from "@/components/ui/button"
import {
  ChargeAutocomplete,
  JobOrderTaskAutocomplete,
} from "@/components/autocomplete"
import JobOrderServiceAutocomplete from "@/components/autocomplete/autocomplete-joborder-service"
import TransportLocationAutocomplete from "@/components/autocomplete/autocomplete-transportlocation"
import TransportModeAutocomplete from "@/components/autocomplete/autocomplete-transportmode"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import CustomInput from "@/components/custom/custom-input"
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomTextarea from "@/components/custom/custom-textarea"

interface TransportationLogFormProps {
  jobData: IJobOrderHd
  initialData?: ITransportationLog
  taskDefaults?: Record<string, number>
  submitAction: (data: TransportationLogSchemaType) => void
  onCancelAction?: () => void
  isSubmitting?: boolean
  isConfirmed?: boolean
}

export function TransportationLogForm({
  jobData,
  initialData,
  taskDefaults = {},
  submitAction,
  onCancelAction,
  isSubmitting = false,
  isConfirmed,
}: TransportationLogFormProps) {
  const { decimals, user } = useAuthStore()

  const dateFormat = useMemo(
    () => decimals[0]?.dateFormat || clientDateFormat,
    [decimals]
  )

  const parseWithFallback = useCallback(
    (value: string | Date | null | undefined): Date | null => {
      if (!value) return null
      if (value instanceof Date) {
        return isNaN(value.getTime()) ? null : value
      }

      if (typeof value !== "string") return null

      const parsed = parse(value, dateFormat, new Date())
      if (isValid(parsed)) {
        return parsed
      }

      return parseDate(value)
    },
    [dateFormat]
  )

  const form = useForm<TransportationLogSchemaType>({
    resolver: zodResolver(TransportationLogSchema),
    defaultValues: {
      transportationLogId: initialData?.transportationLogId,
      companyId: jobData.companyId,
      jobOrderId: jobData.jobOrderId,
      taskId: initialData?.taskId ?? taskDefaults.taskId ?? 0,
      serviceId: initialData?.serviceId ?? 0,
      transportDate: initialData?.transportDate
        ? format(
            parseWithFallback(initialData.transportDate as string) ||
              new Date(),
            dateFormat
          )
        : undefined,
      fromLocationId: initialData?.fromLocationId ?? 0,
      toLocationId: initialData?.toLocationId ?? 0,
      transportModeId: initialData?.transportModeId ?? 0,
      vehicleNo: initialData?.vehicleNo ?? null,
      driverName: initialData?.driverName ?? null,
      passengerCount: initialData?.passengerCount ?? 0,
      chargeId: initialData?.chargeId ?? taskDefaults.chargeId ?? null,
      remarks: initialData?.remarks ?? null,
      editVersion: initialData?.editVersion,
    },
  })

  useEffect(() => {
    form.reset({
      transportationLogId: initialData?.transportationLogId,
      companyId: jobData.companyId,
      jobOrderId: jobData.jobOrderId,
      taskId: initialData?.taskId ?? taskDefaults.taskId ?? 0,
      serviceId: initialData?.serviceId ?? 0,
      transportDate: initialData?.transportDate
        ? format(
            parseWithFallback(initialData.transportDate as string) ||
              new Date(),
            dateFormat
          )
        : undefined,
      fromLocationId: initialData?.fromLocationId ?? 0,
      toLocationId: initialData?.toLocationId ?? 0,
      transportModeId: initialData?.transportModeId ?? 0,
      vehicleNo: initialData?.vehicleNo ?? null,
      driverName: initialData?.driverName ?? null,
      passengerCount: initialData?.passengerCount ?? 0,
      chargeId: initialData?.chargeId ?? taskDefaults.chargeId ?? null,
      remarks: initialData?.remarks ?? null,
      editVersion: initialData?.editVersion,
    })
  }, [
    dateFormat,
    form,
    initialData,
    jobData.companyId,
    jobData.jobOrderId,
    parseWithFallback,
    taskDefaults,
    user?.userId,
  ])

  // Watch form values to trigger re-renders when they change
  const watchedJobOrderId = form.watch("jobOrderId")
  const watchedTaskId = form.watch("taskId")

  // ============================================================================
  // HANDLERS
  // ============================================================================

  // Handle task selection
  const handleTaskChange = (selectedOption: ITaskLookup | null) => {
    if (selectedOption) {
      form.setValue("taskId", selectedOption.taskId, {
        shouldValidate: true,
        shouldDirty: true,
      })
      // Reset service when task changes
      form.setValue("serviceId", 0, { shouldValidate: true })
    } else {
      form.setValue("taskId", 0, { shouldValidate: true })
      form.setValue("serviceId", 0, { shouldValidate: true })
    }
  }

  // Handle service selection
  const handleServiceChange = (selectedOption: IServiceLookup | null) => {
    if (selectedOption) {
      form.setValue("serviceId", selectedOption.serviceId, {
        shouldValidate: true,
        shouldDirty: true,
      })
    } else {
      form.setValue("serviceId", 0, { shouldValidate: true })
    }
  }

  const onSubmit = (data: TransportationLogSchemaType) => {
    submitAction(data)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 gap-2">
              <JobOrderTaskAutocomplete
                key={`task-${watchedJobOrderId}`}
                form={form}
                name="taskId"
                jobOrderId={watchedJobOrderId || 0}
                label="Task"
                isRequired
                isDisabled={isConfirmed}
                onChangeEvent={handleTaskChange}
              />
              <JobOrderServiceAutocomplete
                key={`service-${watchedJobOrderId}-${watchedTaskId}`}
                form={form}
                name="serviceId"
                jobOrderId={watchedJobOrderId || 0}
                taskId={watchedTaskId || 0}
                label="Service"
                isRequired
                isDisabled={isConfirmed}
                onChangeEvent={handleServiceChange}
              />
              <ChargeAutocomplete
                form={form}
                name="chargeId"
                label="Charge"
                isDisabled={isConfirmed}
                taskId={watchedTaskId || 0}
                companyId={jobData.companyId}
              />

              <CustomDateNew
                form={form}
                name="transportDate"
                label="Transport Date"
                isRequired
                isDisabled={isConfirmed}
              />
              <TransportLocationAutocomplete
                form={form}
                name="fromLocationId"
                label="From Location"
                isRequired
                isDisabled={isConfirmed}
              />
              <TransportLocationAutocomplete
                form={form}
                name="toLocationId"
                label="To Location"
                isRequired
                isDisabled={isConfirmed}
              />
              <TransportModeAutocomplete
                form={form}
                name="transportModeId"
                label="Transport Mode"
                isRequired
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="vehicleNo"
                label="Vehicle No"
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="driverName"
                label="Driver Name"
                isDisabled={isConfirmed}
              />
              <CustomNumberInput
                form={form}
                name="passengerCount"
                label="Passenger Count"
                isDisabled={isConfirmed}
              />
              <CustomTextarea
                form={form}
                name="remarks"
                label="Remarks"
                isDisabled={isConfirmed}
              />
            </div>
          </div>
          {!isConfirmed && (
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancelAction}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </form>
      </FormProvider>
    </div>
  )
}
