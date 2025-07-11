"use client"

import { useEffect } from "react"
import { ISupplierContact } from "@/interfaces/supplier"
import {
  SupplierContactFormValues,
  supplierContactSchema,
} from "@/schemas/supplier"
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

interface SupplierContactFormProps {
  initialData?: ISupplierContact
  submitAction: (data: SupplierContactFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isReadOnly?: boolean
}

export function SupplierContactForm({
  initialData,
  submitAction,
  onCancel,
  isSubmitting = false,
  isReadOnly = false,
}: SupplierContactFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const form = useForm<SupplierContactFormValues>({
    resolver: zodResolver(supplierContactSchema),
    defaultValues: initialData
      ? { ...initialData }
      : {
          supplierId: 0,
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

  const onSubmit = (data: SupplierContactFormValues) => {
    // Process and handle null values according to SupplierContactFormValues schema
    const contactData = {
      ...data,
      // Convert numeric fields
      supplierId: data.supplierId ? Number(data.supplierId) : 0,
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
        supplierId: 0,
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
                {isSubmitting ? "Saving..." : initialData ? "Update" : "Create"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
