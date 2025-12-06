"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { IApiSuccessResponse } from "@/interfaces/auth"
import { ITaskService } from "@/interfaces/task-service"
import {
  ServiceFieldValues,
  TaskServiceSchemaType,
  taskServiceFormSchema,
} from "@/schemas/task-service"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { useChartOfAccountLookup } from "@/hooks/use-lookup"
import { useTaskServiceGet, useTaskServiceSave } from "@/hooks/use-task-service"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CarrierTypeAutocomplete,
  ChargeAutocomplete,
  ChartOfAccountAutocomplete,
  ConsignmentTypeAutocomplete,
  LandingTypeAutocomplete,
  ServiceModeAutocomplete,
  StatusTaskAutocomplete,
  UomAutocomplete,
  VisaAutocomplete,
} from "@/components/autocomplete"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"

type TaskServiceResponse = IApiSuccessResponse<ITaskService[]>

// Default task services configuration
const DEFAULT_TASK_SERVICES = [
  { taskId: 1, taskName: "Port Expenses" },
  { taskId: 2, taskName: "Launch Service" },
  { taskId: 3, taskName: "Equipment Used" },
  { taskId: 4, taskName: "Crew SignOn" },
  { taskId: 5, taskName: "Crew SignOff" },
  { taskId: 6, taskName: "Crew Miscellaneous" },
  { taskId: 7, taskName: "Medical Assistance" },
  { taskId: 8, taskName: "Consignment Import" },
  { taskId: 9, taskName: "Consignment Export" },
  { taskId: 10, taskName: "Third Party" },
  { taskId: 11, taskName: "Fresh Water" },
  { taskId: 12, taskName: "Technician Surveyor" },
  { taskId: 13, taskName: "Landing Items" },
  { taskId: 14, taskName: "Other Service" },
  { taskId: 15, taskName: "Agency Remuneration" },
  { taskId: 16, taskName: "Visa Service" },
]

export function TaskServiceForm() {
  const params = useParams()
  const companyId = params.companyId as string
  const [savingService, setSavingService] = useState<string | null>(null)
  const [recentlySaved, setRecentlySaved] = useState<string | null>(null)
  const {
    data: taskServiceResponse,
    isLoading,
    isError,
    refetch,
  } = useTaskServiceGet()

  // Get chart of account data to ensure it's loaded before setting form values
  const { data: chartOfAccounts = [], isLoading: isLoadingChartOfAccounts } =
    useChartOfAccountLookup(Number(companyId))

  const { mutate: saveTaskServiceSettings, isPending } = useTaskServiceSave()

  const form = useForm<TaskServiceSchemaType>({
    resolver: zodResolver(taskServiceFormSchema),
    defaultValues: {
      services: DEFAULT_TASK_SERVICES.reduce(
        (acc, service) => {
          acc[`service_${service.taskId}`] = {
            taskId: service.taskId,
            chargeId: 0,
            glId: 0,
            uomId: 0,
            carrierTypeId: 0,
            serviceModeId: 0,
            consignmentTypeId: 0,
            visaId: 0,
            landingTypeId: 0,
            statusTypeId: 0,
          }
          return acc
        },
        {} as Record<
          string,
          {
            taskId: number
            chargeId: number
            glId: number
            uomId: number
            carrierTypeId: number
            serviceModeId: number
            consignmentTypeId: number
            visaId: number
            landingTypeId: number
            statusTypeId: number
          }
        >
      ),
    },
  })

  // Update form values when both task service data and chart of account data are loaded
  useEffect(() => {
    if (
      taskServiceResponse &&
      !isLoadingChartOfAccounts &&
      chartOfAccounts.length > 0
    ) {
      const { result, message, data } =
        taskServiceResponse as TaskServiceResponse

      if (result === -2) {
        return
      }

      if (result === -1) {
        toast.error(message || "No data available")
        return
      }

      if (result === 1 && data) {
        const servicesData: Record<
          string,
          {
            taskId: number
            chargeId: number
            glId: number
            uomId: number
            carrierTypeId: number
            serviceModeId: number
            consignmentTypeId: number
            visaId: number
            landingTypeId: number
            statusTypeId: number
          }
        > = {}

        data.forEach((service) => {
          // Use taskId as the key since we don't have TASK_SERVICES mapping
          const serviceKey = `service_${service.taskId}`

          servicesData[serviceKey] = {
            taskId: service.taskId || 0,
            chargeId: service.chargeId || 0,
            glId: service.glId || 0,
            uomId: service.uomId || 0,
            carrierTypeId: service.carrierTypeId || 0,
            serviceModeId: service.serviceModeId || 0,
            consignmentTypeId: service.consignmentTypeId || 0,
            visaId: service.visaId || 0,
            landingTypeId: service.landingTypeId || 0,
            statusTypeId: service.statusTypeId || 0,
          }
        })

        form.reset({ services: servicesData })
      }
    }
  }, [taskServiceResponse, form, isLoadingChartOfAccounts, chartOfAccounts])

  function handleSaveIndividualService(serviceKey: string) {
    setSavingService(serviceKey)
    const formData = form.getValues()
    const serviceData = formData.services[serviceKey]

    // Validate mandatory fields
    const errors: string[] = []

    if (!serviceData.chargeId || serviceData.chargeId === 0) {
      errors.push("Charge is required")
    }

    if (!serviceData.glId || serviceData.glId === 0) {
      errors.push("GL Account is required")
    }

    if (!serviceData.uomId || serviceData.uomId === 0) {
      errors.push("UOM is required")
    }

    // Find the service name for error messages
    const serviceInfo = DEFAULT_TASK_SERVICES.find(
      (s) => s.taskId === serviceData.taskId
    )
    const serviceName = serviceInfo?.taskName || `Service ${serviceData.taskId}`

    if (errors.length > 0) {
      toast.error(`${serviceName}: ${errors.join(", ")}`)
      setSavingService(null)
      return
    }

    const individualPayload: ServiceFieldValues = {
      taskId: serviceData.taskId,
      chargeId: serviceData.chargeId,
      glId: serviceData.glId,
      uomId: serviceData.uomId,
      carrierTypeId: serviceData.carrierTypeId,
      serviceModeId: serviceData.serviceModeId,
      consignmentTypeId: serviceData.consignmentTypeId,
      visaId: serviceData.visaId,
      landingTypeId: serviceData.landingTypeId,
      statusTypeId: serviceData.statusTypeId,
    }

    saveTaskServiceSettings(individualPayload, {
      onSuccess: (response) => {
        const { result, message } = response as IApiSuccessResponse<{
          success: boolean
        }>

        if (result === -2) {
          toast.error("This record is locked")
          return
        }

        if (result === -1) {
          // Find the service name for the error message
          const serviceInfo = DEFAULT_TASK_SERVICES.find(
            (s) => s.taskId === serviceData.taskId
          )
          const serviceName =
            serviceInfo?.taskName || `Service ${serviceData.taskId}`

          toast.error(message || `Failed to save ${serviceName} settings`)
          return
        }

        if (result === 1) {
          // Find the service name for the success message
          const serviceInfo = DEFAULT_TASK_SERVICES.find(
            (s) => s.taskId === serviceData.taskId
          )
          const serviceName =
            serviceInfo?.taskName || `Service ${serviceData.taskId}`

          toast.success(`${serviceName} settings saved successfully`)
          setRecentlySaved(serviceKey)
          setTimeout(() => setRecentlySaved(null), 3000) // Clear after 3 seconds
          refetch()
        }
      },
      onError: (error) => {
        // Find the service name for the error message
        const serviceInfo = DEFAULT_TASK_SERVICES.find(
          (s) => s.taskId === serviceData.taskId
        )
        const serviceName =
          serviceInfo?.taskName || `Service ${serviceData.taskId}`

        toast.error(
          error instanceof Error
            ? error.message
            : `Failed to save ${serviceName} settings`
        )
      },
      onSettled: () => {
        setSavingService(null)
      },
    })
  }

  if (isLoading || isLoadingChartOfAccounts) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 15 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <p className="text-destructive">Failed to load task service settings</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    )
  }

  const ServiceCard = ({
    serviceKey,
    serviceData,
  }: {
    serviceKey: string
    serviceData: {
      taskId: number
      chargeId: number
      glId: number
      uomId: number
      carrierTypeId: number
      serviceModeId: number
      consignmentTypeId: number
      visaId: number
      landingTypeId: number
      statusTypeId: number
    }
  }) => {
    const isSaving = savingService === serviceKey
    const wasRecentlySaved = recentlySaved === serviceKey

    // Find the service name from DEFAULT_TASK_SERVICES
    const serviceInfo = DEFAULT_TASK_SERVICES.find(
      (s) => s.taskId === serviceData.taskId
    )
    const serviceName = serviceInfo?.taskName || `Service ${serviceData.taskId}`

    return (
      <div
        className={`rounded-lg border p-4 transition-all duration-300 ${wasRecentlySaved ? "bg-green-50 ring-2 ring-green-500 dark:bg-green-950" : ""}`}
      >
        <div className="mb-3 border-b pb-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold">{serviceName}</h3>
                {wasRecentlySaved && (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-xs font-medium">Saved</span>
                  </div>
                )}
              </div>
            </div>
            <Button
              size="sm"
              variant={
                isSaving
                  ? "secondary"
                  : wasRecentlySaved
                    ? "outline"
                    : "default"
              }
              onClick={() => handleSaveIndividualService(serviceKey)}
              disabled={isSaving || isPending}
              className="ml-2 min-w-[80px]"
            >
              {isSaving ? (
                <>
                  <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : wasRecentlySaved ? (
                "Saved ✓"
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {/* Common Fields - Always show for all services */}
          <div className="grid grid-cols-1 gap-3">
            <ChargeAutocomplete
              form={form}
              name={`services.${serviceKey}.chargeId`}
              label="Charge"
              taskId={serviceData.taskId}
              isRequired={true}
            />
            <ChartOfAccountAutocomplete
              form={form}
              name={`services.${serviceKey}.glId`}
              label="GL Account"
              isRequired={true}
              companyId={Number(companyId)}
            />
            <UomAutocomplete
              form={form}
              name={`services.${serviceKey}.uomId`}
              label="UOM"
              isRequired={true}
            />
          </div>

          {/* Conditional Fields based on taskId */}

          {/* Visa Type - Show for taskId 4,5 */}
          {[4, 5].includes(serviceData.taskId) && (
            <VisaAutocomplete
              form={form}
              name={`services.${serviceKey}.visaId`}
              label="Visa Type"
              isRequired={false}
            />
          )}

          {/* Carrier Type, Mode Type, Consignment Type, Landing Type - Show for taskId 8,9 */}
          {[8, 9].includes(serviceData.taskId) && (
            <>
              <CarrierTypeAutocomplete
                form={form}
                name={`services.${serviceKey}.carrierTypeId`}
                label="Carrier Type"
                isRequired={false}
              />

              <ServiceModeAutocomplete
                form={form}
                name={`services.${serviceKey}.serviceModeId`}
                label="Mode Type"
                isRequired={false}
              />

              <ConsignmentTypeAutocomplete
                form={form}
                name={`services.${serviceKey}.consignmentTypeId`}
                label="Consignment Type"
                isRequired={false}
              />

              <LandingTypeAutocomplete
                form={form}
                name={`services.${serviceKey}.landingTypeId`}
                label="Landing Type"
                isRequired={false}
              />
            </>
          )}

          {/* Status Type - Show for all services */}
          <StatusTaskAutocomplete
            form={form}
            name={`services.${serviceKey}.statusTypeId`}
            label="Status Type"
            isRequired={false}
          />
        </div>
      </div>
    )
  }

  const formContent = (
    <Form {...form}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Task Service Settings</h3>
          <p className="text-muted-foreground text-sm">
            Configure default values for all task services. Save individual
            services using the save button on each card.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {DEFAULT_TASK_SERVICES.map((service) => {
              const serviceKey = `service_${service.taskId}`
              const serviceData = form.getValues().services[serviceKey] || {
                taskId: service.taskId,
                chargeId: 0,
                glId: 0,
                uomId: 0,
                carrierTypeId: 0,
                serviceModeId: 0,
                consignmentTypeId: 0,
                landingTypeId: 0,
                visaId: 0,
                statusTypeId: 0,
              }
              return (
                <ServiceCard
                  key={serviceKey}
                  serviceKey={serviceKey}
                  serviceData={serviceData}
                />
              )
            })}
          </div>
        </div>
      </div>
    </Form>
  )

  return (
    <div className="rounded-lg border p-4">
      {taskServiceResponse?.result === -2 ? (
        <LockSkeleton locked={true}>{formContent}</LockSkeleton>
      ) : (
        formContent
      )}
    </div>
  )
}
