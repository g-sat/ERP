"use client"

import { IServiceType } from "@/interfaces/servicetype"
import { ServiceTypeFormValues, serviceTypeSchema } from "@/schemas/servicetype"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import ServiceTypeCategoryAutocomplete from "@/components/ui-custom/autocomplete-servicetypecategory"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/ui-custom/custom-accordion"
import CustomInput from "@/components/ui-custom/custom-input"
import CustomSwitch from "@/components/ui-custom/custom-switch"
import CustomTextarea from "@/components/ui-custom/custom-textarea"

interface ServiceTypeFormProps {
  initialData?: IServiceType
  submitAction: (data: ServiceTypeFormValues) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
  isReadOnly?: boolean
  onCodeBlur?: (code: string) => void
}

export function ServiceTypeForm({
  initialData,
  submitAction,
  onCancel,
  isSubmitting,
  isReadOnly = false,
  onCodeBlur,
}: ServiceTypeFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const form = useForm<ServiceTypeFormValues>({
    resolver: zodResolver(serviceTypeSchema),
    defaultValues: {
      serviceTypeId: initialData?.serviceTypeId || 0,
      serviceTypeCode: initialData?.serviceTypeCode || "",
      serviceTypeName: initialData?.serviceTypeName || "",
      serviceTypeCategoryId: initialData?.serviceTypeCategoryId || 0,
      isActive: initialData?.isActive ?? true,
      remarks: initialData?.remarks || "",
    },
  })

  const onSubmit = async (data: ServiceTypeFormValues) => {
    await submitAction(data)
  }

  const handleCodeBlur = () => {
    const code = form.getValues("serviceTypeCode")
    onCodeBlur?.(code)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
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
              onClick={onCancel}
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
