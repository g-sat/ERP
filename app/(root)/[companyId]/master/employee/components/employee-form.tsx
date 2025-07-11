"use client"

import { IEmployee } from "@/interfaces/employee"
import { EmployeeFormValues, employeeSchema } from "@/schemas/employee"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import DepartmentAutocomplete from "@/components/ui-custom/autocomplete-department"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/ui-custom/custom-accordion"
import CustomInput from "@/components/ui-custom/custom-input"
import CustomSwitch from "@/components/ui-custom/custom-switch"
import CustomTextarea from "@/components/ui-custom/custom-textarea"

interface EmployeeFormProps {
  initialData?: IEmployee
  submitAction: (data: EmployeeFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isReadOnly?: boolean
  departments?: { value: string; label: string }[]
  designations?: { value: string; label: string }[]
}

export function EmployeeForm({
  initialData,
  submitAction,
  onCancel,
  isSubmitting = false,
  isReadOnly = false,
}: EmployeeFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: initialData
      ? { ...initialData }
      : {
          employeeId: 0,
          employeeCode: "",
          employeeName: "",
          employeeOtherName: "",
          employeePhoto: "",
          employeeSignature: "",
          empCategoryId: 0,
          departmentId: 0,
          employeeSex: "",
          martialStatus: "",
          employeeDOB: undefined,
          employeeJoinDate: undefined,
          employeeLastDate: undefined,
          employeeOffEmailAdd: "",
          employeeOtherEmailAdd: "",
          isActive: true,
          remarks: "",
        },
  })

  const onSubmit = (data: EmployeeFormValues) => {
    submitAction(data)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-2">
            <div className="grid grid-cols-3 gap-2">
              <CustomInput
                form={form}
                name="employeeCode"
                label="Employee Code"
                isRequired
                isDisabled={isReadOnly}
              />
              <CustomInput
                form={form}
                name="employeeName"
                label="Employee Name"
                isRequired
                isDisabled={isReadOnly}
              />

              <CustomInput
                form={form}
                name="employeeOtherName"
                label="Other Name"
                isDisabled={isReadOnly}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <DepartmentAutocomplete
                form={form}
                name="departmentId"
                label="Department"
                isDisabled={isReadOnly}
                isRequired
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <CustomInput
                form={form}
                name="employeeSex"
                label="Gender"
                isRequired
                isDisabled={isReadOnly}
              />
              <CustomInput
                form={form}
                name="martialStatus"
                label="Marital Status"
                isRequired
                isDisabled={isReadOnly}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <CustomInput
                form={form}
                name="employeeOffEmailAdd"
                label="Office Email"
                type="email"
                isDisabled={isReadOnly}
              />
              <CustomInput
                form={form}
                name="employeeOtherEmailAdd"
                label="Other Email"
                type="email"
                isDisabled={isReadOnly}
              />
            </div>

            <CustomTextarea
              form={form}
              name="remarks"
              label="Remarks"
              isDisabled={isReadOnly}
            />
            <div className="grid grid-cols-1 gap-2">
              <CustomSwitch
                form={form}
                name="isActive"
                label="Active Status"
                activeColor="success"
                isDisabled={isReadOnly}
              />
            </div>

            {initialData &&
              (initialData.createBy ||
                initialData.createDate ||
                initialData.editBy ||
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
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onCancel}>
              {isReadOnly ? "Close" : "Cancel"}
            </Button>
            {!isReadOnly && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : initialData
                    ? "Update Employee"
                    : "Create Employee"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
