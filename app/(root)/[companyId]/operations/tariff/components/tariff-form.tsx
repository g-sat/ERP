"use client"

import React, { useEffect, useMemo } from "react"
import { ICustomerLookup } from "@/interfaces/lookup"
import { ITariff } from "@/interfaces/tariff"
import { TariffSchemaType, tariffSchema } from "@/schemas/tariff"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { XIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { useCompanyCustomerLookup } from "@/hooks/use-lookup"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import {
  ChargeAutocomplete,
  CurrencyAutocomplete,
  CustomerAutocomplete,
  PortAutocomplete,
  TaskAutocomplete,
  UomAutocomplete,
  VisaAutocomplete,
} from "@/components/autocomplete"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/custom/custom-accordion"
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomSwitch from "@/components/custom/custom-switch"
import CustomTextarea from "@/components/custom/custom-textarea"

interface TariffFormProps {
  initialData?: ITariff
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
  initialData,
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
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  const { data: customers = [] } = useCompanyCustomerLookup(companyId)

  // Extract currency ID to prevent infinite loop - useMemo ensures stable reference
  const firstCustomerCurrencyId = customers[0]?.currencyId
  const defaultCurrencyId = useMemo(() => {
    return firstCustomerCurrencyId || 0
  }, [firstCustomerCurrencyId])

  const form = useForm<TariffSchemaType>({
    resolver: zodResolver(tariffSchema),
    defaultValues: {
      tariffId: initialData?.tariffId || 0,
      taskId: initialData?.taskId || taskId,
      chargeId: initialData?.chargeId || 0,
      portId: initialData?.portId || portId,
      customerId: initialData?.customerId || customerId,
      currencyId: initialData?.currencyId || defaultCurrencyId,
      uomId: initialData?.uomId || 0,
      visaId: initialData?.visaId || 0,
      displayRate: initialData?.displayRate || 0,
      basicRate: initialData?.basicRate || 0,
      minUnit: initialData?.minUnit || 0,
      maxUnit: initialData?.maxUnit || 0,
      isAdditional: initialData?.isAdditional || false,
      additionalUnit: initialData?.additionalUnit || 0,
      additionalRate: initialData?.additionalRate || 0,
      prepaymentPercentage: initialData?.prepaymentPercentage || 0,
      isPrepayment: initialData?.isPrepayment || false,
      seqNo: initialData?.seqNo || 0,
      isDefault: initialData?.isDefault || true,
      isActive: initialData?.isActive || true,
      remarks: initialData?.remarks || "",
      editVersion: initialData?.editVersion || 0,
    },
  })

  useEffect(() => {
    console.log("TariffForm useEffect triggered:", {
      mode,
      currencyId: defaultCurrencyId,
      customerId,
      portId,
      taskId,
      tariff: !!initialData,
    })

    if (initialData) {
      form.reset({
        tariffId: initialData.tariffId || 0,
        taskId: initialData.taskId || taskId,
        chargeId: initialData.chargeId || 0,
        portId: initialData.portId || portId,
        customerId: initialData.customerId || customerId,
        currencyId: initialData.currencyId || defaultCurrencyId,
        uomId: initialData.uomId || 0,
        visaId: initialData.visaId || 0,
        displayRate: initialData.displayRate || 0,
        basicRate: initialData.basicRate || 0,
        minUnit: initialData.minUnit || 0,
        maxUnit: initialData.maxUnit || 0,
        isAdditional: initialData.isAdditional || false,
        additionalUnit: initialData.additionalUnit || 0,
        additionalRate: initialData.additionalRate || 0,
        prepaymentPercentage: initialData.prepaymentPercentage || 0,
        isPrepayment: initialData.isPrepayment || false,
        seqNo: initialData.seqNo || 0,
        isDefault: initialData.isDefault || true,
        isActive: initialData.isActive || true,
        remarks: initialData.remarks || "",
        editVersion: initialData.editVersion || 0,
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
        currencyId: defaultCurrencyId,
        uomId: 0,
        visaId: 0,
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
        editVersion: 0,
      })
    }
  }, [initialData, form, customerId, portId, taskId, mode, defaultCurrencyId])

  // Watch form values for debugging
  const watchedCustomerId = form.watch("customerId")
  const watchedPortId = form.watch("portId")
  const watchedTaskId = form.watch("taskId")

  // Watch switch states for conditional field editing
  const isAdditional = form.watch("isAdditional")
  const isPrepayment = form.watch("isPrepayment")

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
      visaId: data.visaId,
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
      editVersion: data.editVersion || 0,
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
          <div className="grid grid-cols-4 gap-2">
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
          </div>
          <div className="grid grid-cols-3 gap-2">
            <ChargeAutocomplete
              form={form}
              name="chargeId"
              label="Charge"
              isRequired
              isDisabled={mode === "view"}
            />

            <VisaAutocomplete
              form={form}
              name="visaId"
              label="Visa Type"
              isRequired
              isDisabled={mode === "view"}
            />

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
          <>
            {/* Audit Information Section */}
            {initialData &&
              (initialData.createBy ||
                initialData.createDate ||
                initialData.editBy ||
                initialData.editDate) && (
                <div className="space-y-2">
                  <div className="border-border border-b pb-4"></div>

                  <CustomAccordion
                    type="single"
                    collapsible
                    className="border-border bg-muted/50 rounded-lg border"
                  >
                    <CustomAccordionItem
                      value="audit-info"
                      className="border-none"
                    >
                      <CustomAccordionTrigger className="hover:bg-muted rounded-lg px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">View Audit Trail</span>
                          <Badge variant="secondary" className="text-xs">
                            {initialData.createDate ? "Created" : ""}
                            {initialData.editDate ? " • Modified" : ""}
                          </Badge>
                          {initialData.editVersion && (
                            <Badge
                              variant="destructive"
                              className="bg-primary text-primary-foreground text-xs font-semibold"
                            >
                              V {initialData.editVersion}
                            </Badge>
                          )}
                        </div>
                      </CustomAccordionTrigger>
                      <CustomAccordionContent className="px-6 pb-4">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          {initialData.createDate && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-foreground text-sm font-medium">
                                  Created By
                                </span>
                                <Badge
                                  variant="outline"
                                  className="font-normal"
                                >
                                  {initialData.createBy}
                                </Badge>
                              </div>
                              <div className="text-muted-foreground text-sm">
                                {format(
                                  new Date(initialData.createDate),
                                  datetimeFormat
                                )}
                              </div>
                            </div>
                          )}
                          {initialData.editBy && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-foreground text-sm font-medium">
                                  Last Modified By
                                </span>
                                <Badge
                                  variant="outline"
                                  className="font-normal"
                                >
                                  {initialData.editBy}
                                </Badge>
                              </div>
                              <div className="text-muted-foreground text-sm">
                                {initialData.editDate
                                  ? format(
                                      new Date(initialData.editDate),
                                      datetimeFormat
                                    )
                                  : "-"}
                              </div>
                            </div>
                          )}
                        </div>
                      </CustomAccordionContent>
                    </CustomAccordionItem>
                  </CustomAccordion>
                </div>
              )}
          </>

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
