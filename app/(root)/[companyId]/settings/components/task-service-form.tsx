"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { IApiSuccessResponse } from "@/interfaces/auth"
import {
  ITaskService,
  TASK_SERVICES,
  TaskServiceKey,
} from "@/interfaces/task-service"
import {
  TaskServiceFormValues,
  taskServiceFormSchema,
} from "@/schemas/task-service"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { useChartofAccountLookup } from "@/hooks/use-lookup"
import { useTaskServiceGet, useTaskServiceSave } from "@/hooks/use-task-service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SaveConfirmation } from "@/components/save-confirmation"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"
import CarrierTypeAutocomplete from "@/components/ui-custom/autocomplete-carriertype"
import ChargeAutocomplete from "@/components/ui-custom/autocomplete-charge"
import ChartofAccountAutocomplete from "@/components/ui-custom/autocomplete-chartofaccount"
import DocumentTypeAutocomplete from "@/components/ui-custom/autocomplete-document-type"
import ModeTypeAutocomplete from "@/components/ui-custom/autocomplete-modetype"
import UomAutocomplete from "@/components/ui-custom/autocomplete-uom"

type TaskServiceResponse = IApiSuccessResponse<ITaskService[]>

export function TaskServiceForm() {
  const params = useParams()
  const companyId = params.companyId as string
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false)
  const {
    data: taskServiceResponse,
    isLoading,
    isError,
    refetch,
  } = useTaskServiceGet()

  // Get chart of account data to ensure it's loaded before setting form values
  const { data: chartOfAccounts = [], isLoading: isLoadingChartOfAccounts } =
    useChartofAccountLookup(Number(companyId))

  const { mutate: saveTaskServiceSettings, isPending } = useTaskServiceSave()

  const form = useForm<TaskServiceFormValues>({
    resolver: zodResolver(taskServiceFormSchema),
    defaultValues: {
      services: Object.keys(TASK_SERVICES).reduce(
        (acc, serviceKey) => {
          acc[serviceKey] = {
            taskId: 0,
            chargeId: 0,
            glId: 0,
            uomId: 0,
            carrierTypeId: 0,
            modeTypeId: 0,
            documentTypeId: 0,
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
            modeTypeId: number
            documentTypeId: number
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
        console.log("API Response data:", data)
        console.log("TASK_SERVICES:", TASK_SERVICES)

        const servicesData: Record<
          string,
          {
            taskId: number
            chargeId: number
            glId: number
            uomId: number
            carrierTypeId: number
            modeTypeId: number
            documentTypeId: number
          }
        > = {}

        data.forEach((service) => {
          console.log("Processing service:", service)
          console.log("Service ID:", service.id)

          const serviceKey = Object.keys(TASK_SERVICES).find(
            (key) => TASK_SERVICES[key as TaskServiceKey].id === service.id
          ) as TaskServiceKey

          console.log("Found serviceKey:", serviceKey)

          if (serviceKey) {
            servicesData[serviceKey] = {
              taskId: service.taskId || 0,
              chargeId: service.chargeId || 0,
              glId: service.glId || 0,
              uomId: service.uomId || 0,
              carrierTypeId: service.carrierTypeId || 0,
              modeTypeId: service.modeTypeId || 0,
              documentTypeId: service.documentTypeId || 0,
            }
          } else {
            console.log(
              "No matching serviceKey found for serviceId:",
              service.id
            )
          }
        })

        console.log("Final servicesData:", servicesData)

        form.reset({ services: servicesData })
      }
    }
  }, [taskServiceResponse, form, isLoadingChartOfAccounts, chartOfAccounts])

  function onSubmit() {
    setShowSaveConfirmation(true)
  }

  function handleConfirmSave() {
    const formData = form.getValues()
    console.log(formData)

    saveTaskServiceSettings(formData, {
      onSuccess: (response) => {
        const { result, message } = response as IApiSuccessResponse<{
          success: boolean
        }>

        if (result === -2) {
          toast.error("This record is locked")
          return
        }

        if (result === -1) {
          toast.error(message || "Failed to save task service settings")
          return
        }

        if (result === 1) {
          toast.success(message || "Task service settings saved successfully")
          refetch()
        }
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to save task service settings"
        )
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

  const ServiceCard = ({ serviceKey }: { serviceKey: TaskServiceKey }) => {
    const service = TASK_SERVICES[serviceKey]

    return (
      <Card className="p-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{service.name}</CardTitle>
            <Badge variant="secondary">{serviceKey}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Common Fields */}
          <div className="grid grid-cols-1 gap-3">
            <ChargeAutocomplete
              form={form}
              name={`services.${serviceKey}.chargeId`}
              label="Charge"
              taskId={service.id}
              isRequired={true}
            />
            <ChartofAccountAutocomplete
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

          {/* Service-specific Fields */}
          {service.hasCarrierType && (
            <CarrierTypeAutocomplete
              form={form}
              name={`services.${serviceKey}.carrierTypeId`}
              label="Carrier Type"
              isRequired={false}
            />
          )}

          {service.hasModeType && (
            <ModeTypeAutocomplete
              form={form}
              name={`services.${serviceKey}.modeTypeId`}
              label="Mode Type"
              isRequired={false}
            />
          )}

          {service.hasDocumentType && (
            <DocumentTypeAutocomplete
              form={form}
              name={`services.${serviceKey}.documentTypeId`}
              label="Document Type"
              isRequired={false}
            />
          )}
        </CardContent>
      </Card>
    )
  }

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Task Service Settings</h3>
            <p className="text-muted-foreground text-sm">
              Configure default values for all task services
            </p>
          </div>
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Saving..." : "Save All Settings"}
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Services</TabsTrigger>
            <TabsTrigger value="crew">Crew Services</TabsTrigger>
            <TabsTrigger value="cargo">Cargo Services</TabsTrigger>
            <TabsTrigger value="other">Other Services</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.keys(TASK_SERVICES).map((serviceKey) => (
                <ServiceCard
                  key={serviceKey}
                  serviceKey={serviceKey as TaskServiceKey}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="crew" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                "Ser_CrewSignOn",
                "Ser_CrewSignOff",
                "Ser_CrewMiscellaneous",
                "Ser_MedicalAssistance",
              ].map((serviceKey) => (
                <ServiceCard
                  key={serviceKey}
                  serviceKey={serviceKey as TaskServiceKey}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cargo" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                "Ser_ConsignmentImport",
                "Ser_ConsignmentExport",
                "Ser_LandingItems",
              ].map((serviceKey) => (
                <ServiceCard
                  key={serviceKey}
                  serviceKey={serviceKey as TaskServiceKey}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="other" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                "Ser_PortExpenses",
                "Ser_LaunchService",
                "Ser_EquipmentUsed",
                "Ser_ThirdParty",
                "Ser_FreshWater",
                "Ser_TechnicianSurveyor",
                "Ser_OtherService",
                "Ser_AgencyRemuneration",
              ].map((serviceKey) => (
                <ServiceCard
                  key={serviceKey}
                  serviceKey={serviceKey as TaskServiceKey}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  )

  return (
    <div className="rounded-lg border p-4">
      {taskServiceResponse?.result === -2 ? (
        <LockSkeleton locked={true}>{formContent}</LockSkeleton>
      ) : (
        formContent
      )}
      <SaveConfirmation
        title="Save Task Service Settings"
        itemName="task service settings"
        open={showSaveConfirmation}
        onOpenChange={setShowSaveConfirmation}
        onConfirm={handleConfirmSave}
        isSaving={isPending}
        operationType="save"
      />
    </div>
  )
}
