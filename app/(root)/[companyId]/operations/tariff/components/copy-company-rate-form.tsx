"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ICustomerLookup, IPortLookup } from "@/interfaces/lookup"
import { ITariff } from "@/interfaces/tariff"
import { zodResolver } from "@hookform/resolvers/zod"
import { XIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Tariff } from "@/lib/api-routes"
import { useGetByParams, usePersist } from "@/hooks/use-common"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form } from "@/components/ui/form"
import CompanyAutocomplete from "@/components/autocomplete/autocomplete-company"
import CompanyCustomerAutocomplete from "@/components/autocomplete/autocomplete-company-customer"
import PortAutocomplete from "@/components/autocomplete/autocomplete-port"
import TaskAutocomplete from "@/components/autocomplete/autocomplete-task"

import { TariffTable } from "./tariff-table"

// Schema for copy company rate form
const copyCompanyRateSchema = z.object({
  fromCompanyId: z.number().min(1, "From Company is required"),
  fromCustomerId: z.number().min(1, "From Customer is required"),
  fromPortId: z.number().min(1, "From Port is required"),
  toCompanyId: z.number().min(1, "To Company is required"),
  toCustomerId: z.number().min(1, "To Customer is required"),
  toPortId: z.number().min(1, "To Port is required"),
  fromTaskId: z.number().min(1, "From Task is required"),
  multipleId: z.string().optional(),
  isOverwrite: z.boolean().default(false),
  isDelete: z.boolean().default(false),
})

type CopyCompanyRateFormValues = z.infer<typeof copyCompanyRateSchema>

interface CopyCompanyRateFormProps {
  onClose: () => void
}

export function CopyCompanyRateForm({ onClose }: CopyCompanyRateFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFromCompanyId, setSelectedFromCompanyId] = useState<number>(0)
  const [selectedToCompanyId, setSelectedToCompanyId] = useState<number>(0)
  const [showTable, setShowTable] = useState(false)

  const form = useForm<CopyCompanyRateFormValues>({
    resolver: zodResolver(copyCompanyRateSchema),
    defaultValues: {
      fromCompanyId: 0,
      fromCustomerId: 0,
      fromPortId: 0,
      fromTaskId: 0,
      toCompanyId: 0,
      toCustomerId: 0,
      toPortId: 0,
      multipleId: "",
      isOverwrite: true,
      isDelete: false,
    },
  })

  // Copy tariff mutation
  const copyTariffMutation = usePersist(Tariff.copyCompanyTariff)

  // Watch form values to determine when to show table
  const watchedValues = form.watch([
    "fromCustomerId",
    "fromPortId",
    "fromTaskId",
  ])
  const watchedFromCustomerId = watchedValues[0]
  const watchedFromPortId = watchedValues[1]
  const watchedFromTaskId = watchedValues[2]

  // Create a stable key for the API call
  const apiKey = useMemo(() => {
    if (
      watchedFromCustomerId > 0 &&
      watchedFromPortId > 0 &&
      watchedFromTaskId > 0
    ) {
      return `copyCompanyRateTariffs-${watchedFromCustomerId}-${watchedFromPortId}-${watchedFromTaskId}`
    }
    return null
  }, [watchedFromCustomerId, watchedFromPortId, watchedFromTaskId])

  // Fetch tariff data when all required fields are selected
  const { data: tariffResponse, isLoading: isLoadingTariffs } =
    useGetByParams<ITariff>(
      Tariff.getTariffByTask,
      apiKey || "copyCompanyRateTariffs",
      `${watchedFromCustomerId}/${watchedFromPortId}/${watchedFromTaskId}`
    )

  // Process tariff data
  const tariffData = useMemo(() => {
    return tariffResponse?.data
      ? Array.isArray(tariffResponse.data)
        ? tariffResponse.data
        : [tariffResponse.data]
      : []
  }, [tariffResponse?.data])

  // Show table when all required fields are selected and data is loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        watchedFromCustomerId > 0 &&
        watchedFromPortId > 0 &&
        watchedFromTaskId > 0
      ) {
        setShowTable(true)
      } else {
        setShowTable(false)
      }
    }, 300) // Small delay to prevent rapid state changes

    return () => clearTimeout(timer)
  }, [watchedFromCustomerId, watchedFromPortId, watchedFromTaskId])

  const handleSubmit = async (data: CopyCompanyRateFormValues) => {
    setIsLoading(true)
    try {
      // Prepare copy rate data
      const copyRateData = {
        fromCompanyId: data.fromCompanyId,
        toCompanyId: data.toCompanyId,
        fromTaskId: data.fromTaskId,
        fromPortId: data.fromPortId,
        toPortId: data.toPortId,
        fromCustomerId: data.fromCustomerId,
        toCustomerId: data.toCustomerId,
        multipleId: data.multipleId || "",
        isOverwrite: data.isOverwrite,
        isDelete: data.isDelete,
      }

      // Call the copy tariff API
      copyTariffMutation.mutate(copyRateData, {
        onSuccess: (response) => {
          console.log("Copy response:", response)
          if (response?.result === 1) {
            toast.success("Rates copied successfully")
            onClose()
            form.reset()
          } else {
            const errorMessage = response?.message || "Failed to copy rates"
            toast.error(errorMessage)
          }
        },
        onError: (error) => {
          console.error("Error copying rates:", error)
          toast.error("Failed to copy rates")
        },
      })
    } catch (error) {
      console.error("Error copying rates:", error)
      toast.error("Failed to copy rates")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomerChange = useCallback(
    (field: "fromCustomerId" | "toCustomerId") => {
      return (selectedCustomer: ICustomerLookup | null) => {
        if (selectedCustomer) {
          form.setValue(field, selectedCustomer.customerId || 0)
        } else {
          form.setValue(field, 0)
        }
      }
    },
    [form]
  )

  const handlePortChange = useCallback(
    (field: "fromPortId" | "toPortId") => {
      return (selectedPort: IPortLookup | null) => {
        if (selectedPort) {
          form.setValue(field, selectedPort.portId || 0)
        } else {
          form.setValue(field, 0)
        }
      }
    },
    [form]
  )

  const handleSelectionChange = useCallback(
    (selectedIds: string[]) => {
      // Update the multipleId field with comma-separated IDs
      form.setValue("multipleId", selectedIds.join(","))
    },
    [form]
  )

  const handleCompanyChange = useCallback(
    (field: "fromCompanyId" | "toCompanyId") => {
      return (selectedCompany: { companyId?: number; id?: number } | null) => {
        if (selectedCompany) {
          const companyId = selectedCompany.companyId || selectedCompany.id || 0
          form.setValue(field, companyId)

          // Update the selected company ID state
          if (field === "fromCompanyId") {
            setSelectedFromCompanyId(companyId)
          } else {
            setSelectedToCompanyId(companyId)
          }

          // Clear customer when company changes
          if (field === "fromCompanyId") {
            form.setValue("fromCustomerId", 0)
          } else {
            form.setValue("toCustomerId", 0)
          }
        } else {
          form.setValue(field, 0)
          if (field === "fromCompanyId") {
            setSelectedFromCompanyId(0)
          } else {
            setSelectedToCompanyId(0)
          }
        }
      }
    },
    [form]
  )

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">From</h3>
              <CompanyAutocomplete
                form={form}
                name="fromCompanyId"
                label="Company"
                isRequired
                onChangeEvent={handleCompanyChange("fromCompanyId")}
              />
              <CompanyCustomerAutocomplete
                form={form}
                name="fromCustomerId"
                label="Customer"
                companyId={selectedFromCompanyId}
                isRequired
                onChangeEvent={handleCustomerChange("fromCustomerId")}
              />
              <PortAutocomplete
                form={form}
                name="fromPortId"
                label="Port"
                isRequired
                onChangeEvent={handlePortChange("fromPortId")}
              />
              <TaskAutocomplete
                form={form}
                name="fromTaskId"
                label="Task"
                isRequired
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">To</h3>
              <CompanyAutocomplete
                form={form}
                name="toCompanyId"
                label="Company"
                isRequired
                onChangeEvent={handleCompanyChange("toCompanyId")}
              />
              <CompanyCustomerAutocomplete
                form={form}
                name="toCustomerId"
                label="Customer"
                companyId={selectedToCompanyId}
                isRequired
                onChangeEvent={handleCustomerChange("toCustomerId")}
              />
              <PortAutocomplete
                form={form}
                name="toPortId"
                label="Port"
                isRequired
                onChangeEvent={handlePortChange("toPortId")}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Checkbox
              id="isOverwrite"
              checked={form.watch("isOverwrite")}
              onCheckedChange={(c) => {
                const isChecked = c as boolean
                form.setValue("isOverwrite", isChecked)
                // If overwrite is checked, uncheck delete
                if (isChecked) {
                  form.setValue("isDelete", false)
                }
              }}
            />
            <label htmlFor="isOverwrite">Overwrite existing</label>
            <Checkbox
              id="isDelete"
              checked={form.watch("isDelete")}
              onCheckedChange={(c) => {
                const isChecked = c as boolean
                form.setValue("isDelete", isChecked)
                // If delete is checked, uncheck overwrite
                if (isChecked) {
                  form.setValue("isOverwrite", false)
                }
              }}
            />
            <label htmlFor="isDelete">Delete source after copy</label>
          </div>

          {showTable && (
            <div className="w-full space-y-2">
              <h3 className="text-lg font-semibold">Select Rates</h3>
              {form.watch("multipleId") && (
                <p className="text-sm">
                  Selected:{" "}
                  {form.watch("multipleId")?.split(",").filter(Boolean).length}{" "}
                  rate(s)
                </p>
              )}
              <div className="max-h-96 w-full overflow-auto">
                <TariffTable
                  data={tariffData}
                  isLoading={isLoadingTariffs}
                  onSelectionChange={handleSelectionChange}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex items-center gap-2"
            >
              <XIcon className="h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Copying..." : "Copy Rates"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
