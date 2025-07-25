"use client"

import { useEffect } from "react"
import { IEmployeeBank } from "@/interfaces/employee"
import { EmployeeBankValues, employeeBankSchema } from "@/schemas/employee"
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

interface EmployeeBankFormProps {
  initialData?: IEmployeeBank
  submitAction: (data: EmployeeBankValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isReadOnly?: boolean
  employeeId: number
}

export function EmployeeBankForm({
  initialData,
  submitAction,
  onCancel,
  isSubmitting = false,
  isReadOnly = false,
  employeeId,
}: EmployeeBankFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const form = useForm<EmployeeBankValues>({
    resolver: zodResolver(employeeBankSchema),
    defaultValues: initialData
      ? { ...initialData }
      : {
          employeeId: employeeId,
          itemNo: 0,
          bankName: "",
          accountNo: "",
          swiftCode: "",
          iban: "",
          remarks: "",
          isDefaultBank: false,
          isActive: true,
        },
  })

  const onSubmit = (data: EmployeeBankValues) => {
    submitAction(data)
  }

  useEffect(() => {
    form.reset(
      initialData || {
        employeeId: employeeId,
        itemNo: 0,
        bankName: "",
        accountNo: "",
        swiftCode: "",
        iban: "",
        remarks: "",
        isDefaultBank: false,
        isActive: true,
      }
    )
  }, [initialData, form, employeeId])

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-2">
              <CustomInput
                form={form}
                name="bankName"
                label="Bank Name"
                isRequired
                isDisabled={isReadOnly}
              />
              <CustomInput
                form={form}
                name="accountNo"
                label="Account Number"
                isRequired
                isDisabled={isReadOnly}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <CustomInput
                form={form}
                name="swiftCode"
                label="Swift Code"
                isDisabled={isReadOnly}
              />
              <CustomInput
                form={form}
                name="iban"
                label="IBAN"
                isDisabled={isReadOnly}
              />
            </div>

            <CustomTextarea
              form={form}
              name="remarks"
              label="Remarks"
              isDisabled={isReadOnly}
            />

            <div className="grid grid-cols-2 gap-2">
              <CustomSwitch
                form={form}
                name="isDefaultBank"
                label="Default Bank"
                activeColor="success"
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
                    ? "Update Bank"
                    : "Add Bank"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
