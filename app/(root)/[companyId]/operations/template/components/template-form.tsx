"use client"

import { forwardRef, useEffect, useImperativeHandle } from "react"
import { ITemplateHd } from "@/interfaces/template"
import { TemplateHdSchemaType, templateHdSchema } from "@/schemas/template"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Form } from "@/components/ui/form"
import ChargeAutocomplete from "@/components/autocomplete/autocomplete-charge"
import TaskAutocomplete from "@/components/autocomplete/autocomplete-task"
import CustomInput from "@/components/custom/custom-input"

// Default values for the template form
const defaultValues: TemplateHdSchemaType = {
  templateId: 0,
  templateName: "",
  taskId: 0,
  chargeId: 0,
  isActive: true,
  editVersion: 0,
  data_details: [],
}
interface TemplateFormProps {
  initialData?: ITemplateHd
  onCancel?: () => void
  isReadOnly?: boolean
  onCodeBlur?: (code: string) => void
  onChange?: (data: TemplateHdSchemaType) => void
}

export const TemplateForm = forwardRef<
  { getFormData: () => TemplateHdSchemaType },
  TemplateFormProps
>(
  (
    {
      initialData,
      onCancel: _onCancel,
      isReadOnly = false,
      onCodeBlur,
      onChange,
    },
    ref
  ) => {
    const form = useForm<TemplateHdSchemaType>({
      resolver: zodResolver(templateHdSchema),
      mode: "onBlur", // Validate on blur for better UX
      defaultValues: initialData
        ? {
            templateId: initialData.templateId ?? 0,
            templateName: initialData.templateName ?? "",
            taskId: initialData.taskId ?? 0,
            chargeId: initialData.chargeId ?? 0,
            isActive: initialData.isActive ?? true,
            editVersion: 0,
            data_details: initialData.data_details ?? [],
          }
        : {
            ...defaultValues,
          },
    })

    // Reset form when initialData changes
    useEffect(() => {
      form.reset(
        initialData
          ? {
              templateId: initialData.templateId ?? 0,
              templateName: initialData.templateName ?? "",
              taskId: initialData.taskId ?? 0,
              chargeId: initialData.chargeId ?? 0,
              isActive: initialData.isActive ?? true,
              editVersion: 0,
              data_details: initialData.data_details ?? [],
            }
          : {
              ...defaultValues,
            }
      )
    }, [initialData, form])

    // Expose form data getter to parent component
    useImperativeHandle(ref, () => ({
      getFormData: () => form.getValues(),
    }))

    // Watch form changes and call onChange
    useEffect(() => {
      if (onChange) {
        const subscription = form.watch((data) => {
          onChange(data as TemplateHdSchemaType)
        })
        return () => subscription.unsubscribe()
      }
    }, [form, onChange])

    const handleCodeBlur = () => {
      const code = form.getValues("templateName")
      onCodeBlur?.(code)
    }

    return (
      <div className="max-w flex flex-col gap-2">
        <Form {...form}>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 gap-2">
              <CustomInput
                form={form}
                name="templateName"
                label="Template Name"
                isRequired
                isDisabled={isReadOnly || Boolean(initialData)}
                onBlurEvent={handleCodeBlur}
              />
              <TaskAutocomplete
                form={form}
                name="taskId"
                label="Task"
                isRequired
                isDisabled={isReadOnly || Boolean(initialData)}
              />
              <ChargeAutocomplete
                form={form}
                name="chargeId"
                label="Charge"
                isRequired
                isDisabled={isReadOnly || Boolean(initialData)}
                taskId={form.watch("taskId")}
              />
            </div>
          </div>
        </Form>
      </div>
    )
  }
)

TemplateForm.displayName = "TemplateForm"
