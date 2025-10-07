"use client"

import { useEffect } from "react"
import { IServiceType } from "@/interfaces/servicetype"
import { ServiceTypeSchemaType, serviceTypeSchema } from "@/schemas/servicetype"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import ServiceTypeCategoryAutocomplete from "@/components/autocomplete/autocomplete-servicetypecategory"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/custom/custom-accordion"
import CustomInput from "@/components/custom/custom-input"
import CustomSwitch from "@/components/custom/custom-switch"
import CustomTextarea from "@/components/custom/custom-textarea"

const defaultValues = {
  serviceTypeId: 0,
  serviceTypeCode: "",
  serviceTypeName: "",
  serviceTypeCategoryId: 0,
  isActive: true,
  remarks: "",
}
interface ServiceTypeFormProps {
  initialData?: IServiceType
  submitAction: (data: ServiceTypeSchemaType) => Promise<void>
  onCancelAction: () => void
  isSubmitting: boolean
  isReadOnly?: boolean
  onCodeBlur?: (code: string) => void
}

export function ServiceTypeForm({
  initialData,
  submitAction,
  onCancelAction,
  isSubmitting,
  isReadOnly = false,
  onCodeBlur,
}: ServiceTypeFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  const form = useForm<ServiceTypeSchemaType>({
    resolver: zodResolver(serviceTypeSchema),
    defaultValues: initialData
      ? {
          serviceTypeId: initialData.serviceTypeId ?? 0,
          serviceTypeCode: initialData.serviceTypeCode ?? "",
          serviceTypeName: initialData.serviceTypeName ?? "",
          serviceTypeCategoryId: initialData.serviceTypeCategoryId ?? 0,
          isActive: initialData.isActive ?? true,
          remarks: initialData.remarks ?? "",
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
            serviceTypeId: initialData.serviceTypeId ?? 0,
            serviceTypeCode: initialData.serviceTypeCode ?? "",
            serviceTypeName: initialData.serviceTypeName ?? "",
            serviceTypeCategoryId: initialData.serviceTypeCategoryId ?? 0,
            isActive: initialData.isActive ?? true,
            remarks: initialData.remarks ?? "",
          }
        : {
            ...defaultValues,
          }
    )
  }, [initialData, form])

  const onSubmit = async (data: ServiceTypeSchemaType) => {
    await submitAction(data)
  }

  const handleCodeBlur = () => {
    const code = form.getValues("serviceTypeCode")
    onCodeBlur?.(code)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <div className="grid gap-2">
            <div className="grid grid-cols-3 gap-2">
              <ServiceTypeCategoryAutocomplete
                form={form}
                name="serviceTypeCategoryId"
                label="ServiceType Category"
                isDisabled={isReadOnly || Boolean(initialData)}
                isRequired={true}
              />

              <CustomInput
                form={form}
                name="serviceTypeCode"
                label="ServiceType Code"
                isRequired={true}
                isDisabled={isReadOnly}
                onBlurEvent={handleCodeBlur}
              />

              <CustomInput
                form={form}
                name="serviceTypeName"
                label="ServiceType Name"
                isRequired={true}
                isDisabled={isReadOnly}
              />

              <CustomSwitch
                form={form}
                name="isActive"
                label="Active Status"
                activeColor="success"
                isDisabled={isReadOnly}
              />
            </div>

            <CustomTextarea
              form={form}
              name="remarks"
              label="Remarks"
              isDisabled={isReadOnly}
            />
            {initialData &&
              (initialData.createBy ||
                initialData.createDate ||
                initialData.editBy ||
                initialData.editDate) && (
                <CustomAccordion
                  type="single"
                  collapsible
                  className="bservice rounded-md"
                >
                  <CustomAccordionItem value="audit-info">
                    <CustomAccordionTrigger className="px-4">
                      Audit Information
                    </CustomAccordionTrigger>
                    <CustomAccordionContent className="px-2">
                      <div className="grid grid-cols-2 gap-4">
                        {initialData.createDate && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">
                              Created By
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-normal">
                                {initialData.createBy}
                              </Badge>
                              <span className="text-muted-foreground text-sm">
                                {format(
                                  new Date(initialData.createDate),
                                  datetimeFormat
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                        {initialData.editBy && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">
                              Last Edited By
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-normal">
                                {initialData.editBy}
                              </Badge>
                              <span className="text-muted-foreground text-sm">
                                {initialData.editDate
                                  ? format(
                                      new Date(initialData.editDate),
                                      datetimeFormat
                                    )
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CustomAccordionContent>
                  </CustomAccordionItem>
                </CustomAccordion>
              )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancelAction}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            {!isReadOnly && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
