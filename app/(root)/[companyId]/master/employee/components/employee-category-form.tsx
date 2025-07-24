"use client"

import { IEmployeeCategory } from "@/interfaces/employee"
import {
  EmployeeCategoryValues,
  employeeCategorySchema,
} from "@/schemas/employee"
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
} from "@/components/ui-custom/custom-accordion"
import CustomInput from "@/components/ui-custom/custom-input"
import CustomSwitch from "@/components/ui-custom/custom-switch"
import CustomTextarea from "@/components/ui-custom/custom-textarea"

interface EmployeeCategoryFormProps {
  initialData?: IEmployeeCategory
  submitAction: (data: EmployeeCategoryValues) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
  isReadOnly?: boolean
  onCodeBlur?: (code: string) => void
}

export function EmployeeCategoryForm({
  initialData,
  submitAction,
  onCancel,
  isSubmitting,
  isReadOnly = false,
  onCodeBlur,
}: EmployeeCategoryFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const form = useForm<EmployeeCategoryValues>({
    resolver: zodResolver(employeeCategorySchema),
    defaultValues: {
      companyId: initialData?.companyId || 0,
      empCategoryId: initialData?.empCategoryId || 0,
      empCategoryCode: initialData?.empCategoryCode || "",
      empCategoryName: initialData?.empCategoryName || "",
      isActive: initialData?.isActive ?? true,
      remarks: initialData?.remarks || "",
    },
  })

  const onSubmit = async (data: EmployeeCategoryValues) => {
    await submitAction(data)
  }

  const handleCodeBlur = () => {
    const code = form.getValues("empCategoryCode")
    onCodeBlur?.(code)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-2">
              <CustomInput
                form={form}
                name="empCategoryCode"
                label="Employee Category Code"
                isRequired
                isDisabled={isReadOnly || isSubmitting}
                onBlurEvent={handleCodeBlur}
              />

              <CustomInput
                form={form}
                name="empCategoryName"
                label="Employee Category Name"
                isRequired
                isDisabled={isReadOnly || isSubmitting}
              />
            </div>

            <CustomTextarea
              form={form}
              name="remarks"
              label="Remarks"
              isDisabled={isReadOnly || isSubmitting}
            />

            <CustomSwitch
              form={form}
              name="isActive"
              label="Active Status"
              activeColor="success"
              isDisabled={isReadOnly || isSubmitting}
            />

            {initialData &&
              (initialData.createById ||
                initialData.createDate ||
                initialData.editById ||
                initialData.editDate) && (
                <CustomAccordion
                  type="single"
                  collapsible
                  className="rounded-md border"
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
                                {initialData.createById}
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
                        {initialData.editById && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">
                              Last Edited By
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-normal">
                                {initialData.editById}
                              </Badge>
                              <span className="text-muted-foreground text-sm">
                                {initialData.editDate
                                  ? format(
                                      new Date(initialData.editDate),
                                      datetimeFormat
                                    )
                                  : "—"}
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
