"use client"

import { useEffect } from "react"
import { IBankContact } from "@/interfaces/bank"
import { BankContactFormValues, bankContactSchema } from "@/schemas/bank"
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

interface BankContactFormProps {
  initialData?: IBankContact
  submitAction: (data: BankContactFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isReadOnly?: boolean
}

export function BankContactForm({
  initialData,
  submitAction,
  onCancel,
  isSubmitting = false,
  isReadOnly = false,
}: BankContactFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const form = useForm<BankContactFormValues>({
    resolver: zodResolver(bankContactSchema),
    defaultValues: initialData
      ? { ...initialData }
      : {
          bankId: 0,
          contactId: 0,
          contactName: "",
          otherName: "",
          mobileNo: "",
          offNo: "",
          faxNo: "",
          emailAdd: "",
          isActive: true,
          isSales: false,
          isFinance: false,
          isDefault: false,
          messId: "",
          contactMessType: "",
        },
  })

  const onSubmit = (data: BankContactFormValues) => {
    // Process and handle null values according to BankContactFormValues schema
    const contactData = {
      ...data,
      // Convert numeric fields
      bankId: data.bankId ? Number(data.bankId) : 0,
      contactId: data.contactId ? Number(data.contactId) : 0,

      // Handle string fields
      contactName: data.contactName || "",
      otherName: data.otherName || "",
      mobileNo: data.mobileNo || "",
      offNo: data.offNo || "",
      faxNo: data.faxNo || "",
      emailAdd: data.emailAdd || "",
      messId: data.messId || "",
      contactMessType: data.contactMessType || "",

      // Boolean fields
      isActive: data.isActive ?? true,
      isDefault: data.isDefault ?? false,
      isFinance: data.isFinance ?? false,
      isSales: data.isSales ?? false,
    }
    console.log("Contact data:", contactData)
    submitAction(contactData)
  }

  useEffect(() => {
    form.reset(
      initialData || {
        bankId: 0,
        contactId: 0,
        contactName: "",
        otherName: "",
        mobileNo: "",
        offNo: "",
        faxNo: "",
        emailAdd: "",
        isActive: true,
        isSales: false,
        isFinance: false,
        isDefault: false,
        messId: "",
        contactMessType: "",
      }
    )
  }, [initialData, form])

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-2">
            <div className="grid grid-cols-3 gap-2">
              <CustomInput
                form={form}
                name="contactName"
                label="Contact Name"
                isRequired
                isDisabled={isReadOnly}
              />
              <CustomInput
                form={form}
                name="otherName"
                label="Other Name"
                isDisabled={isReadOnly}
              />

              <CustomInput
                form={form}
                name="mobileNo"
                label="Mobile Number"
                isDisabled={isReadOnly}
              />

              <CustomInput
                form={form}
                name="offNo"
                label="Office Number"
                isDisabled={isReadOnly}
              />
              <CustomInput
                form={form}
                name="faxNo"
                label="Fax Number"
                isDisabled={isReadOnly}
              />
              <CustomInput
                form={form}
                name="emailAdd"
                label="Email Address"
                isDisabled={isReadOnly}
              />
              <CustomInput
                form={form}
                name="messId"
                label="MessId"
                isDisabled={isReadOnly}
              />
              <CustomInput
                form={form}
                name="contactMessType"
                label="Contact Mess Type"
                isDisabled={isReadOnly}
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              <CustomSwitch
                form={form}
                name="isActive"
                label="Active Status"
                activeColor="success"
                isDisabled={isReadOnly}
              />
              <CustomSwitch
                form={form}
                name="isDefault"
                label="Default Contact"
                activeColor="success"
                isDisabled={isReadOnly}
              />
              <CustomSwitch
                form={form}
                name="isSales"
                label="Sales Contact"
                activeColor="success"
                isDisabled={isReadOnly}
              />
              <CustomSwitch
                form={form}
                name="isFinance"
                label="Finance Contact"
                activeColor="success"
                isDisabled={isReadOnly}
              />
            </div>

            {/* Audit Information Section */}
            {initialData &&
              (initialData.createBy ||
                initialData.createDate ||
                initialData.editBy ||
                initialData.editDate) && (
                <div className="space-y-6">
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
                                  : "—"}
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
                {isSubmitting ? "Saving..." : initialData ? "Update" : "Create"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
