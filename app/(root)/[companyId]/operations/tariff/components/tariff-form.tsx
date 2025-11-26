"use client"

import React, { useEffect } from "react"
import { ICustomerLookup } from "@/interfaces/lookup"
import { ITariff } from "@/interfaces/tariff"
import { TariffSchemaType, tariffSchema } from "@/schemas/tariff"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { XIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Task } from "@/lib/operations-utils"
import { useCompanyCustomerLookup } from "@/hooks/use-lookup"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import {
  ChargeAutocomplete,
  CurrencyAutocomplete,
  CustomerAutocomplete,
  PortAutocomplete,
  TaskAutocomplete,
  UomAutocomplete,
  VisaTypeAutocomplete,
} from "@/components/autocomplete"
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomSwitch from "@/components/custom/custom-switch"
import CustomTextarea from "@/components/custom/custom-textarea"

interface TariffFormProps {
  tariff?: ITariff
  onSaveAction: (data: ITariff) => void
  onCloseAction: () => void
  mode: "create" | "edit" | "view"
  companyId: number
  customerId: number
  portId: number
  taskId: number
  onValidationError?: (hasErrors: boolean) => void
}

export function TariffForm({
  tariff,
  onSaveAction,
  onCloseAction,
  mode,
  companyId,
  customerId,
  portId,
  taskId,
  onValidationError,
}: TariffFormProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2

  const { data: customers = [] } = useCompanyCustomerLookup(companyId)

  const form = useForm<TariffSchemaType>({
    resolver: zodResolver(tariffSchema),
    defaultValues: {
      tariffId: tariff?.tariffId || 0,
      taskId: tariff?.taskId || taskId,
      chargeId: tariff?.chargeId || 0,
      portId: tariff?.portId || portId,
      customerId: tariff?.customerId || customerId,
      currencyId: tariff?.currencyId || customers[0]?.currencyId || 0,
      uomId: tariff?.uomId || 0,
      visaTypeId: tariff?.visaTypeId || 0,
      displayRate: tariff?.displayRate || 0,
      basicRate: tariff?.basicRate || 0,
      minUnit: tariff?.minUnit || 0,
      maxUnit: tariff?.maxUnit || 0,
      isAdditional: tariff?.isAdditional || false,
      additionalUnit: tariff?.additionalUnit || 0,
      additionalRate: tariff?.additionalRate || 0,
      prepaymentPercentage: tariff?.prepaymentPercentage || 0,
      isPrepayment: tariff?.isPrepayment || false,
      seqNo: tariff?.seqNo || 0,
      isDefault: tariff?.isDefault || true,
      isActive: tariff?.isActive || true,
      remarks: tariff?.remarks || "",
    },
  })

  useEffect(() => {
    console.log("TariffForm useEffect triggered:", {
      mode,
      currencyId: customers[0]?.currencyId || 0,
      customerId,
      portId,
      taskId,
      tariff: !!tariff,
    })

    if (tariff) {
      form.reset({
        tariffId: tariff.tariffId || 0,
        taskId: tariff.taskId || taskId,
        chargeId: tariff.chargeId || 0,
        portId: tariff.portId || portId,
        customerId: tariff.customerId || customerId,
        currencyId: tariff.currencyId || customers[0]?.currencyId || 0,
        uomId: tariff.uomId || 0,
        visaTypeId: tariff.visaTypeId || 0,
        displayRate: tariff.displayRate || 0,
        basicRate: tariff.basicRate || 0,
        minUnit: tariff.minUnit || 0,
        maxUnit: tariff.maxUnit || 0,
        isAdditional: tariff.isAdditional || false,
        additionalUnit: tariff.additionalUnit || 0,
        additionalRate: tariff.additionalRate || 0,
        prepaymentPercentage: tariff.prepaymentPercentage || 0,
        isPrepayment: tariff.isPrepayment || false,
        seqNo: tariff.seqNo || 0,
        isDefault: tariff.isDefault || true,
        isActive: tariff.isActive || true,
        remarks: tariff.remarks || "",
      })
    } else if (mode === "create") {
      // For create mode, reset form with props values
      console.log("Setting form values for create mode:", {
        customerId,
        portId,
        taskId,
      })
      form.reset({
        tariffId: 0,
        taskId: taskId,
        chargeId: 0,
        portId: portId,
        customerId: customerId,
        currencyId: customers[0]?.currencyId || 0,
        uomId: 0,
        visaTypeId: 0,
        displayRate: 0,
        basicRate: 0,
        minUnit: 0,
        maxUnit: 0,
        isAdditional: false,
        additionalUnit: 0,
        additionalRate: 0,
        prepaymentPercentage: 0,
        isPrepayment: false,
        seqNo: 0,
        isDefault: true,
        isActive: true,
        remarks: "",
      })
    }
  }, [tariff, form, customerId, portId, taskId, mode, customers])

  // Watch switch states for conditional field editing
  const isAdditional = form.watch("isAdditional")
  const isPrepayment = form.watch("isPrepayment")

  // Watch form values for debugging
  const watchedCustomerId = form.watch("customerId")
  const watchedPortId = form.watch("portId")
  const watchedTaskId = form.watch("taskId")

  // Check if current task is VisaService (taskId = 16)
  const isVisaService = watchedTaskId === Task.VisaService

  console.log("Form watched values:", {
    customerId: watchedCustomerId,
    portId: watchedPortId,
    taskId: watchedTaskId,
  })

  // Get form errors for display
  const formErrors = form.formState.errors

  function onSubmit(data: TariffSchemaType) {
    console.log("Form submitted with data:", data)

    const tariffData: ITariff = {
      tariffId: data.tariffId,
      taskId: data.taskId,
      chargeId: data.chargeId,
      portId: data.portId,
      customerId: data.customerId,
      currencyId: data.currencyId || 0,
      uomId: data.uomId,
      visaTypeId: data.visaTypeId,
      displayRate: data.displayRate,
      basicRate: data.basicRate,
      minUnit: data.minUnit,
      maxUnit: data.maxUnit,
      isAdditional: data.isAdditional,
      additionalUnit: data.additionalUnit,
      additionalRate: data.additionalRate,
      isPrepayment: data.isPrepayment,
      prepaymentPercentage: data.prepaymentPercentage,
      seqNo: data.seqNo,
      isDefault: data.isDefault,
      isActive: data.isActive,
      remarks: data.remarks || "",
    }

    console.log("Calling onSaveAction with tariffData:", tariffData)
    onSaveAction(tariffData)
  }

  // Handle customer selection
  const handleCustomerChange = React.useCallback(
    async (selectedCustomer: ICustomerLookup | null) => {
      form.setValue("currencyId", selectedCustomer?.currencyId || 0)
      form.trigger()
    },
    [form]
  )

  return (
    <div className="max-w flex flex-col gap-2">
      {/* Validation Status */}
      {Object.keys(formErrors).length > 0 && (
        <div className="bg-destructive/10 border-destructive/20 mb-4 rounded-md border p-3">
          <h4 className="text-destructive mb-2 text-sm font-medium">
            Please fix the following errors:
          </h4>
          <ul className="text-destructive space-y-1 text-sm">
            {Object.entries(formErrors).map(([field, error]) => (
              <li key={field}>• {error?.message || `${field} is required`}</li>
            ))}
          </ul>
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            (data) => {
              console.log("Form validation passed, calling onSubmit")
              toast.success("Form validation passed! Saving tariff...")
              onValidationError?.(false) // No validation errors
              onSubmit(data)
            },
            (errors) => {
              console.error("Form validation failed:", errors)
              console.error("Form values:", form.getValues())
              console.error(
                "Form errors details:",
                JSON.stringify(errors, null, 2)
              )

              // Notify parent about validation errors
              onValidationError?.(true)

              // Show toast for validation errors
              const errorMessages = Object.values(errors)
                .map((error) => error?.message)
                .filter(Boolean)
              if (errorMessages.length > 0) {
                toast.error(
                  `Please fix the following errors: ${errorMessages.join(", ")}`
                )
              } else {
                toast.error("Please fill in all required fields")
              }
            }
          )}
          className="space-y-3"
        >
          <div className="grid grid-cols-3 gap-2">
            <CustomerAutocomplete
              key={`customer-autocomplete-${mode}-${customerId}`}
              form={form}
              name="customerId"
              label="Customer-S"
              isRequired={true}
              isDisabled={mode === "view"}
              onChangeEvent={handleCustomerChange}
            />

            <CurrencyAutocomplete
              form={form}
              name="currencyId"
              label="Currency"
              isRequired
              isDisabled={true}
            />
            <PortAutocomplete
              key={`port-${mode}-${portId}`}
              form={form}
              name="portId"
              label="Port"
              isRequired
              isDisabled={mode === "view"}
            />
            <TaskAutocomplete
              form={form}
              name="taskId"
              label="Task"
              isRequired
              isDisabled={mode === "view"}
            />

            <ChargeAutocomplete
              form={form}
              name="chargeId"
              label="Charge"
              taskId={form.watch("taskId") || taskId}
              isRequired
              isDisabled={mode === "view"}
            />
            {isVisaService && (
              <VisaTypeAutocomplete
                form={form}
                name="visaTypeId"
                label="Visa Type"
                isRequired={isVisaService}
                isDisabled={mode === "view"}
              />
            )}
            <UomAutocomplete
              form={form}
              name="uomId"
              label="Unit of Measure"
              isRequired
              isDisabled={mode === "view"}
            />
          </div>
          <div className="bg-card grid grid-cols-4 gap-2 rounded-lg border p-2 shadow-sm">
            <CustomNumberInput
              form={form}
              name="displayRate"
              label="Display Rate"
              isRequired
              isDisabled={mode === "view"}
              round={amtDec}
            />
            <CustomNumberInput
              form={form}
              name="basicRate"
              label="Basic Rate"
              isRequired
              isDisabled={mode === "view"}
              round={amtDec}
            />
            <CustomNumberInput
              form={form}
              name="minUnit"
              label="Min Unit"
              isRequired
              isDisabled={mode === "view"}
              round={amtDec}
            />
            <CustomNumberInput
              form={form}
              name="maxUnit"
              label="Max Unit"
              isRequired
              isDisabled={mode === "view"}
              round={amtDec}
            />
          </div>
          <div className="bg-card grid grid-cols-3 gap-2 rounded-lg border p-2 shadow-sm">
            <CustomSwitch
              form={form}
              name="isAdditional"
              label="Additional"
              isDisabled={mode === "view"}
            />
            <CustomNumberInput
              form={form}
              name="additionalUnit"
              label="Additional Unit"
              isRequired={isAdditional}
              isDisabled={mode === "view" || !isAdditional}
              round={amtDec}
            />
            <CustomNumberInput
              form={form}
              name="additionalRate"
              label="Additional Rate"
              isRequired={isAdditional}
              isDisabled={mode === "view" || !isAdditional}
              round={amtDec}
            />
          </div>
          <div className="bg-card grid grid-cols-2 gap-2 rounded-lg border p-2 shadow-sm">
            <CustomSwitch
              form={form}
              name="isPrepayment"
              label="Prepayment"
              isDisabled={mode === "view"}
            />
            <CustomNumberInput
              form={form}
              name="prepaymentPercentage"
              label="Prepayment Rate"
              isRequired={isPrepayment}
              isDisabled={mode === "view" || !isPrepayment}
              round={amtDec}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <CustomTextarea
              form={form}
              name="remarks"
              label="Remarks"
              isDisabled={mode === "view"}
            />
            <CustomSwitch
              form={form}
              name="isDefault"
              label="Default"
              isDisabled={mode === "view"}
            />
            <CustomSwitch
              form={form}
              name="isActive"
              label="Active"
              isDisabled={mode === "view"}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCloseAction}
              className="flex items-center gap-2"
            >
              <XIcon className="h-4 w-4" />
              Close
            </Button>
            {mode !== "view" && (
              <>
                <Button
                  type="submit"
                  onClick={() => console.log("Submit button clicked")}
                >
                  {mode === "create" ? "Create Tariff" : "Save Changes"}
                </Button>
              </>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
