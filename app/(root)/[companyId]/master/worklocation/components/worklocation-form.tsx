"use client"

import { useEffect } from "react"
import { IWorkLocation } from "@/interfaces"
import { WorkLocationSchemaType, workLocationSchema } from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/custom/custom-accordion"
import CustomInput from "@/components/custom/custom-input"
import CustomSwitch from "@/components/custom/custom-switch"

interface WorklocationFormProps {
  initialData?: IWorkLocation | null
  submitAction: (data: WorkLocationSchemaType) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isReadOnly?: boolean
  onCodeBlur?: (code: string) => void
}

export function WorklocationForm({
  initialData,
  submitAction,
  onCancel,
  isSubmitting = false,
  isReadOnly = false,
  onCodeBlur,
}: WorklocationFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  const defaultValues = {
    workLocationId: 0,
    workLocationName: "",
    workLocationCode: "",
    address1: "",
    address2: "",
    city: "",
    postalCode: "",
    countryId: 0,
    isActive: true,
  }

  const form = useForm<WorkLocationSchemaType>({
    resolver: zodResolver(workLocationSchema),
    defaultValues: initialData
      ? {
          workLocationId: initialData.workLocationId ?? 0,
          workLocationName: initialData.workLocationName ?? "",
          workLocationCode: initialData.workLocationCode ?? "",
          address1: initialData.address1 ?? "",
          address2: initialData.address2 ?? "",
          city: initialData.city ?? "",
          postalCode: initialData.postalCode ?? "",
          countryId: initialData.countryId ?? 0,
          isActive: initialData.isActive ?? true,
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
            workLocationId: initialData.workLocationId ?? 0,
            workLocationName: initialData.workLocationName ?? "",
            workLocationCode: initialData.workLocationCode ?? "",
            address1: initialData.address1 ?? "",
            address2: initialData.address2 ?? "",
            city: initialData.city ?? "",
            postalCode: initialData.postalCode ?? "",
            countryId: initialData.countryId ?? 0,
            isActive: initialData.isActive ?? true,
          }
        : {
            ...defaultValues,
          }
    )
  }, [initialData, form, defaultValues])

  const handleCodeBlur = () => {
    const code = form.getValues("workLocationCode")
    onCodeBlur?.(code ?? "")
  }

  const onSubmit = (data: WorkLocationSchemaType) => {
    submitAction(data)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
          <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-2">
              <CustomInput
                form={form}
                name="workLocationCode"
                label="Work Location Code"
                isRequired
                isDisabled={isReadOnly || Boolean(initialData)}
                onBlurEvent={handleCodeBlur}
              />
              <CustomInput
                form={form}
                name="workLocationName"
                label="Work Location Name"
                isRequired
                isDisabled={isReadOnly}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <CustomInput
                form={form}
                name="address1"
                label="Address 1"
                isDisabled={isReadOnly}
              />
              <CustomInput
                form={form}
                name="address2"
                label="Address 2"
                isDisabled={isReadOnly}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <CustomInput
                form={form}
                name="city"
                label="City"
                isDisabled={isReadOnly}
              />
              <CustomInput
                form={form}
                name="postalCode"
                label="Postal Code"
                isDisabled={isReadOnly}
              />
            </div>
            <CustomInput
              form={form}
              name="countryId"
              label="Country ID"
              type="number"
              isRequired
              isDisabled={isReadOnly}
            />
            <CustomSwitch
              form={form}
              name="isActive"
              label="Active Status"
              activeColor="success"
              isDisabled={isReadOnly}
            />

            {/* Audit Information Section */}
            {initialData &&
              (initialData.createBy ||
                initialData.createDate ||
                initialData.editBy ||
                initialData.editDate) && (
                <div className="space-y-6 pt-6">
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
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onCancel}>
              {isReadOnly ? "Close" : "Cancel"}
            </Button>
            {!isReadOnly && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : initialData
                    ? "Update WorkLocation"
                    : "Create WorkLocation"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
