"use client"

import { useEffect } from "react"
import { ITemplateDt } from "@/interfaces/template"
import { TemplateDtSchemaType, templateDtSchema } from "@/schemas/template"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { ChargeAutocomplete } from "@/components/autocomplete"
import CustomInput from "@/components/custom/custom-input"
import CustomSwitch from "@/components/custom/custom-switch"
import CustomTextarea from "@/components/custom/custom-textarea"

// Default values for the template details form
const defaultValues: TemplateDtSchemaType = {
  templateId: 0,
  itemNo: 1,
  chargeId: 0,
  chargeName: "",
  remarks: "",
  editVersion: 0,
  isServiceCharge: false,
  serviceCharge: 0,
}

interface TemplateDetailsFormProps {
  initialData?: ITemplateDt
  submitAction: (data: TemplateDtSchemaType) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isReadOnly?: boolean
  shouldReset?: boolean
  onReset?: () => void
  taskId?: number
}

export function TemplateDetailsForm({
  initialData,
  submitAction,
  onCancel,
  isSubmitting = false,
  isReadOnly = false,
  shouldReset = false,
  onReset,
  taskId,
}: TemplateDetailsFormProps) {
  const form = useForm<TemplateDtSchemaType>({
    resolver: zodResolver(templateDtSchema),
    mode: "onBlur", // Validate on blur for better UX
    defaultValues: initialData
      ? {
          templateId: initialData.templateId ?? 0,
          itemNo: initialData.itemNo ?? 0,
          chargeId: initialData.chargeId ?? 0,
          chargeName: initialData.chargeName ?? "",
          remarks: initialData.remarks ?? "",
          editVersion: initialData.editVersion ?? 0,
          isServiceCharge: initialData.isServiceCharge ?? false,
          serviceCharge: initialData.serviceCharge ?? 0,
        }
      : {
          ...defaultValues,
        },
  })

  // Reset form when initialData changes
  useEffect(() => {
    console.log("TemplateDetailsForm - initialData changed:", initialData)
    form.reset(
      initialData
        ? {
            templateId: initialData.templateId ?? 0,
            itemNo: initialData.itemNo ?? 0,
            chargeId: initialData.chargeId ?? 0,
            chargeName: initialData.chargeName ?? "",
            remarks: initialData.remarks ?? "",
            isServiceCharge: initialData.isServiceCharge ?? false,
            serviceCharge: initialData.serviceCharge ?? 0,
            editVersion: initialData.editVersion ?? 0,
          }
        : {
            ...defaultValues,
          }
    )
  }, [initialData, form])

  // Handle form reset
  useEffect(() => {
    if (shouldReset) {
      form.reset(defaultValues)
      onReset?.()
    }
  }, [shouldReset, form, onReset])

  // Handle charge selection and auto-populate remarks
  const handleChargeChange = (
    selectedCharge: { chargeName: string } | null
  ) => {
    if (selectedCharge && selectedCharge.chargeName) {
      // Store the charge name in a hidden field for form submission
      form.setValue("chargeName", selectedCharge.chargeName)

      // Only auto-populate if remarks is empty or only whitespace
      const currentRemarks = form.getValues("remarks") || ""
      if (currentRemarks.trim() === "") {
        // Auto-populate remarks with charge name
        form.setValue("remarks", selectedCharge.chargeName)
        console.log(
          "Auto-populated remarks with charge name:",
          selectedCharge.chargeName
        )
      } else {
        console.log(
          "Remarks already has content, not overwriting:",
          currentRemarks
        )
      }
    }
  }

  // Watch isServiceCharge to control Service Charge field
  const watchedIsServiceCharge = form.watch("isServiceCharge")

  // Auto-increment itemNo for new items (when initialData is undefined)
  useEffect(() => {
    if (!initialData) {
      // This is a new item, auto-increment itemNo
      // The parent component should handle the actual increment logic
      // For now, we'll set it to 1 and let the parent handle the increment
      form.setValue("itemNo", 1)
    }
  }, [initialData, form])

  const onSubmit = (values: TemplateDtSchemaType) => {
    submitAction(values)
  }

  const onError = (errors: Record<string, unknown>) => {
    console.log("Form validation errors:", errors)
    console.log("Form state:", form.formState)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onError)}>
          {/* Hidden fields for templateId, itemNo, and chargeName */}
          <input type="hidden" {...form.register("templateId")} />
          <input type="hidden" {...form.register("itemNo")} />
          <input type="hidden" {...form.register("chargeName")} />
          <div className="grid gap-2">
            <div className="grid grid-cols-6 gap-2">
              <ChargeAutocomplete
                form={form}
                name="chargeId"
                label="Charge"
                isRequired
                isDisabled={isReadOnly}
                taskId={taskId ?? 0}
                onChangeEvent={handleChargeChange}
              />
              <div className="col-span-2 flex w-full gap-2">
                <div className="w-1/3">
                  <CustomSwitch
                    form={form}
                    name="isServiceCharge"
                    label="Is Service Charge"
                    activeColor="success"
                    isDisabled={isReadOnly}
                  />
                </div>
                <div className="w-1/3">
                  <CustomInput
                    form={form}
                    name="serviceCharge"
                    label="Service Charge"
                    type="number"
                    isDisabled={isReadOnly || !watchedIsServiceCharge}
                  />
                </div>
                <div className="w-1/3">
                  <CustomInput
                    form={form}
                    name="itemNo"
                    label="Item No"
                    type="number"
                    isDisabled={isReadOnly}
                  />
                </div>
              </div>
              <div className="col-span-2">
                <CustomTextarea
                  form={form}
                  name="remarks"
                  label="Remarks"
                  isDisabled={isReadOnly}
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" type="button" onClick={onCancel}>
                  {isReadOnly ? "Close" : "Cancel"}
                </Button>
                {!isReadOnly && (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Saving..."
                      : initialData
                        ? "Update"
                        : "Add"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
