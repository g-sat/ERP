//copy-rate-form.tsx
"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ICustomerLookup, IPortLookup } from "@/interfaces/lookup"
import { zodResolver } from "@hookform/resolvers/zod"
import { XIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { copyRateDirect, useGetTariffByTask } from "@/hooks/use-tariff"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form } from "@/components/ui/form"
import CustomerAutocomplete from "@/components/ui-custom/autocomplete-customer"
import PortAutocomplete from "@/components/ui-custom/autocomplete-port"
import TaskAutocomplete from "@/components/ui-custom/autocomplete-task"

import { TariffTable } from "./tariff-table"

const copyRateSchema = z.object({
  fromCustomerId: z.number().min(1, "From Customer is required"),
  fromPortId: z.number().min(1, "From Port is required"),
  toCustomerId: z.number().min(1, "To Customer is required"),
  toPortId: z.number().min(1, "To Port is required"),
  fromTaskId: z.number().min(1, "From Task is required"),
  multipleId: z.string().optional(),
  isOverwrite: z.boolean().default(false),
  isDelete: z.boolean().default(false),
})

type CopyRateFormValues = z.infer<typeof copyRateSchema>

interface CopyRateFormProps {
  onClose: () => void
}

export function CopyRateForm({ onClose }: CopyRateFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showTable, setShowTable] = useState(false)

  const form = useForm<CopyRateFormValues>({
    resolver: zodResolver(copyRateSchema),
    defaultValues: {
      fromCustomerId: 0,
      fromPortId: 0,
      fromTaskId: 0,
      toCustomerId: 0,
      toPortId: 0,
      multipleId: "",
      isOverwrite: true,
      isDelete: false,
    },
  })

  // Direct API function using api-client.ts

  const watchedValues = form.watch([
    "fromCustomerId",
    "fromPortId",
    "fromTaskId",
  ])
  const watchedFromCustomerId = watchedValues[0]
  const watchedFromPortId = watchedValues[1]
  const watchedFromTaskId = watchedValues[2]

  const { data: tariffResponse, isLoading: isLoadingTariffs } =
    useGetTariffByTask(
      watchedFromCustomerId,
      watchedFromPortId,
      watchedFromTaskId,
      watchedFromCustomerId > 0 &&
        watchedFromPortId > 0 &&
        watchedFromTaskId > 0
    )

  const tariffData = useMemo(() => {
    return tariffResponse?.data
      ? Array.isArray(tariffResponse.data)
        ? tariffResponse.data
        : [tariffResponse.data]
      : []
  }, [tariffResponse?.data])

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
    }, 300)

    return () => clearTimeout(timer)
  }, [watchedFromCustomerId, watchedFromPortId, watchedFromTaskId])

  const handleSubmit = async (data: CopyRateFormValues) => {
    setIsLoading(true)
    try {
      const copyRateData = {
        fromCompanyId: 0,
        toCompanyId: 0,
        fromTaskId: data.fromTaskId,
        fromPortId: data.fromPortId,
        toPortId: data.toPortId,
        fromCustomerId: data.fromCustomerId,
        toCustomerId: data.toCustomerId,
        multipleId: data.multipleId || "",
        isOverwrite: data.isOverwrite,
        isDelete: data.isDelete,
      }

      const response = await copyRateDirect(copyRateData)
      if (response?.result === 1) {
        toast.success(response.message || "Rates copied successfully")
        onClose()
        form.reset()
      } else {
        const errorMessage = response?.message || "Failed to copy rates"
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error("Error copying rates:", error)
      toast.error("Failed to copy rates")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomerChange = useCallback(
    (field: "fromCustomerId" | "toCustomerId") =>
      (selectedCustomer: ICustomerLookup | null) => {
        form.setValue(field, selectedCustomer?.customerId || 0)
      },
    [form]
  )

  const handlePortChange = useCallback(
    (field: "fromPortId" | "toPortId") =>
      (selectedPort: IPortLookup | null) => {
        form.setValue(field, selectedPort?.portId || 0)
      },
    [form]
  )

  const handleSelectionChange = useCallback(
    (selectedIds: string[]) => {
      form.setValue("multipleId", selectedIds.join(","))
    },
    [form]
  )

  return (
    <div className="w-full space-y-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="w-full space-y-6"
        >
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">From</h3>
              <CustomerAutocomplete
                form={form}
                name="fromCustomerId"
                label="Customer"
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
              <CustomerAutocomplete
                form={form}
                name="toCustomerId"
                label="Customer"
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

          <div className="w-full space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
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
              </div>
              <div className="flex items-center space-x-2">
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
            </div>

            {showTable && (
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Select Rates</h3>
                  {form.watch("multipleId") && (
                    <span className="text-muted-foreground text-sm">
                      Selected:{" "}
                      {
                        form.watch("multipleId")?.split(",").filter(Boolean)
                          .length
                      }{" "}
                      rate(s)
                    </span>
                  )}
                </div>
                <div className="max-h-[50vh] w-full overflow-auto rounded-md border">
                  <TariffTable
                    data={tariffData}
                    isLoading={isLoadingTariffs}
                    onSelectionChange={handleSelectionChange}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
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
