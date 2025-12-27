"use client"

import React, { forwardRef, useEffect, useImperativeHandle } from "react"
import { ITemplateHd } from "@/interfaces/template"
import { TemplateHdSchemaType, templateHdSchema } from "@/schemas/template"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Form } from "@/components/ui/form"
import { ChargeAutocomplete, TaskAutocomplete } from "@/components/autocomplete"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/custom/custom-accordion"
import CustomInput from "@/components/custom/custom-input"
import CustomSwitch from "@/components/custom/custom-switch"

import { TemplateDetailsForm } from "./template-details-form"

interface TemplateFormProps {
  initialData?: ITemplateHd
  onSaveAction: (data: ITemplateHd) => void
  onCloseAction: () => void
  mode: "create" | "edit" | "view"
  companyId: number
  onValidationError?: (hasErrors: boolean) => void
}

export interface TemplateFormRef {
  submit: () => void
}

export const TemplateForm = forwardRef<TemplateFormRef, TemplateFormProps>(
  (
    {
      initialData,
      onSaveAction,
      onCloseAction: _onCloseAction,
      mode,
      companyId,
      onValidationError,
    },
    ref
  ) => {
    const { decimals } = useAuthStore()
    const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

    const form = useForm<TemplateHdSchemaType>({
      resolver: zodResolver(templateHdSchema),
      defaultValues: {
        templateId: initialData?.templateId || 0,
        templateName: initialData?.templateName || "",
        taskId: initialData?.taskId || 0,
        chargeId: initialData?.chargeId || 0,
        isActive: initialData?.isActive ?? true,
        editVersion: initialData?.editVersion || 0,
        data_details: initialData?.data_details || [],
      },
    })

    useEffect(() => {
      if (initialData) {
        form.reset({
          templateId: initialData.templateId || 0,
          templateName: initialData.templateName || "",
          taskId: initialData.taskId || 0,
          chargeId: initialData.chargeId || 0,
          isActive: initialData.isActive ?? true,
          editVersion: initialData.editVersion || 0,
          data_details: initialData.data_details || [],
        })
      } else if (mode === "create") {
        form.reset({
          templateId: 0,
          templateName: "",
          taskId: 0,
          chargeId: 0,
          isActive: true,
          editVersion: 0,
          data_details: [],
        })
      }
    }, [initialData, form, mode])

    // Watch form values
    const watchedTaskId = form.watch("taskId")
    const watchedDetails = form.watch("data_details")

    // Check if details exist - if so, Task and Charge should be read-only
    const hasDetails = watchedDetails && watchedDetails.length > 0

    // Get form errors for display
    const formErrors = form.formState.errors

    // Expose submit function via ref
    useImperativeHandle(ref, () => ({
      submit: () => {
        form.handleSubmit(onSubmit)()
      },
    }))

    function onSubmit(data: TemplateHdSchemaType) {
      const templateData: ITemplateHd = {
        companyId: companyId,
        templateId: data.templateId,
        templateName: data.templateName,
        taskId: data.taskId,
        chargeId: data.chargeId,
        isActive: data.isActive,
        createById: initialData?.createById || 0,
        editById: initialData?.editById || 0,
        createBy: initialData?.createBy || "",
        editBy: initialData?.editBy || null,
        createDate: initialData?.createDate || new Date(),
        editDate: initialData?.editDate || new Date(),
        editVersion: data.editVersion || initialData?.editVersion || 0,
        data_details: (data.data_details || []).map((detail) => ({
          ...detail,
          remarks: detail.remarks || "",
        })),
      }

      onSaveAction(templateData)
    }

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
                <li key={field}>
                  • {error?.message || `${field} is required`}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              (data) => {
                toast.success("Form validation passed! Saving template...")
                onValidationError?.(false)
                onSubmit(data)
              },
              (errors) => {
                onValidationError?.(true)
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
              <CustomInput
                form={form}
                name="templateName"
                label="Template Name"
                isRequired
                isDisabled={mode === "view"}
              />
              <TaskAutocomplete
                form={form}
                name="taskId"
                label="Task"
                isRequired
                isDisabled={mode === "view" || hasDetails}
              />
              <ChargeAutocomplete
                form={form}
                name="chargeId"
                label="Charge"
                isRequired
                isDisabled={mode === "view" || hasDetails}
                taskId={watchedTaskId || 0}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <CustomSwitch
                form={form}
                name="isActive"
                label="Active"
                isDisabled={mode === "view"}
              />
            </div>

            {/* Details Section */}
            {mode !== "view" && (
              <div className="space-y-2">
                <TemplateDetailsForm
                  form={form}
                  taskId={watchedTaskId || 0}
                  templateId={form.watch("templateId") || 0}
                />
              </div>
            )}

            {/* View Details Section */}
            {mode === "view" && watchedDetails && watchedDetails.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Template Details</h4>
                <div className="bg-muted/50 rounded-lg border p-4">
                  <div className="space-y-2">
                    {watchedDetails.map((detail, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded border p-2"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{detail.itemNo}</Badge>
                          <span className="text-sm">
                            {detail.chargeName ||
                              `Charge ID: ${detail.chargeId}`}
                          </span>
                        </div>
                        {detail.remarks && (
                          <span className="text-muted-foreground text-xs">
                            {detail.remarks}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <>
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
            </>
          </form>
        </Form>
      </div>
    )
  }
)

TemplateForm.displayName = "TemplateForm"
