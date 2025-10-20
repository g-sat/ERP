"use client"

import { useEffect } from "react"
import { ICustomerAddress } from "@/interfaces/customer"
import {
  CustomerAddressSchemaType,
  customerAddressSchema,
} from "@/schemas/customer"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { CountryAutocomplete } from "@/components/autocomplete"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/custom/custom-accordion"
import CustomInput from "@/components/custom/custom-input"
import CustomSwitch from "@/components/custom/custom-switch"
import CustomTextarea from "@/components/custom/custom-textarea"

// Default values for the address form
const defaultAddressSchemaType: CustomerAddressSchemaType = {
  customerId: 0,
  addressId: 0,
  address1: "",
  address2: "",
  address3: "",
  address4: "",
  pinCode: "",
  countryId: 0,
  phoneNo: "",
  faxNo: "",
  emailAdd: "",
  webUrl: "",
  isActive: true,
  isDefaultAdd: false,
  isDeliveryAdd: false,
  isFinAdd: false,
  isSalesAdd: false,
}

interface CustomerAddressFormProps {
  initialData?: ICustomerAddress
  customerId?: number
  submitAction: (data: CustomerAddressSchemaType) => void
  onCancelAction?: () => void
  isSubmitting?: boolean
  isReadOnly?: boolean
}

export function CustomerAddressForm({
  initialData,
  customerId,
  submitAction,
  onCancelAction,
  isSubmitting = false,
  isReadOnly = false,
}: CustomerAddressFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  // Validate that customerId is provided and valid
  if (!customerId || customerId <= 0) {
    throw new Error("Valid customerId is required for address form")
  }
  const form = useForm<CustomerAddressSchemaType>({
    resolver: zodResolver(customerAddressSchema),
    defaultValues: initialData
      ? {
          customerId: initialData.customerId ?? customerId,
          addressId: initialData.addressId ?? 0,
          address1: initialData.address1 ?? "",
          address2: initialData.address2 ?? "",
          address3: initialData.address3 ?? "",
          address4: initialData.address4 ?? "",
          pinCode: initialData.pinCode ?? "",
          countryId: initialData.countryId ?? 0,
          phoneNo: initialData.phoneNo ?? "",
          faxNo: initialData.faxNo ?? "",
          emailAdd: initialData.emailAdd ?? "",
          webUrl: initialData.webUrl ?? "",
          isActive: initialData.isActive ?? true,
          isDefaultAdd: initialData.isDefaultAdd ?? false,
          isDeliveryAdd: initialData.isDeliveryAdd ?? false,
          isFinAdd: initialData.isFinAdd ?? false,
          isSalesAdd: initialData.isSalesAdd ?? false,
        }
      : {
          ...defaultAddressSchemaType,
          customerId: customerId,
        },
  })

  const onSubmit = (data: CustomerAddressSchemaType) => {
    console.log("Form submitted with data:", data)
    console.log("Form validation errors:", form.formState.errors)

    // Process the form data according to CustomerAddressSchemaType schema
    const addressData = {
      ...data,
      // Convert numeric fields and handle null values
      customerId: data.customerId ? Number(data.customerId) : customerId,
      addressId: data.addressId ? Number(data.addressId) : 0,
      countryId: data.countryId ? Number(data.countryId) : 0,

      // Handle string fields
      address1: data.address1 || "",
      address2: data.address2 || "",
      address3: data.address3 || "",
      address4: data.address4 || "",
      pinCode: data.pinCode ?? "",
      phoneNo: data.phoneNo || "",
      faxNo: data.faxNo || "",
      emailAdd: data.emailAdd || "",
      webUrl: data.webUrl || "",

      // Boolean fields
      isActive: data.isActive ?? true,
      isDefaultAdd: data.isDefaultAdd ?? false,
      isDeliveryAdd: data.isDeliveryAdd ?? false,
      isFinAdd: data.isFinAdd ?? false,
      isSalesAdd: data.isSalesAdd ?? false,
    }

    console.log("Processed address data:", addressData)
    console.log("Calling submitAction...")
    submitAction(addressData)
  }

  useEffect(() => {
    form.reset(
      initialData
        ? {
            customerId: initialData.customerId ?? customerId,
            addressId: initialData.addressId ?? 0,
            address1: initialData.address1 ?? "",
            address2: initialData.address2 ?? "",
            address3: initialData.address3 ?? "",
            address4: initialData.address4 ?? "",
            pinCode: initialData.pinCode ?? "",
            countryId: initialData.countryId ?? 0,
            phoneNo: initialData.phoneNo ?? "",
            faxNo: initialData.faxNo ?? "",
            emailAdd: initialData.emailAdd ?? "",
            webUrl: initialData.webUrl ?? "",
            isActive: initialData.isActive ?? true,
            isDefaultAdd: initialData.isDefaultAdd ?? false,
            isDeliveryAdd: initialData.isDeliveryAdd ?? false,
            isFinAdd: initialData.isFinAdd ?? false,
            isSalesAdd: initialData.isSalesAdd ?? false,
          }
        : {
            ...defaultAddressSchemaType,
            customerId: customerId,
          }
    )
  }, [initialData, customerId, form])

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.log("Form validation failed:", errors)
          })}
          className="space-y-4"
        >
          <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-2">
              <CustomTextarea
                form={form}
                name="address1"
                label="Address Line 1"
                isDisabled={isReadOnly}
                isRequired={true}
              />

              <CustomTextarea
                form={form}
                name="address2"
                label="Address Line 2"
                isDisabled={isReadOnly}
                isRequired={true}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <CustomTextarea
                form={form}
                name="address3"
                label="Address Line 3"
                isDisabled={isReadOnly}
              />

              <CustomTextarea
                form={form}
                name="address4"
                label="Address Line 4"
                isDisabled={isReadOnly}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <CustomInput
                form={form}
                name="pinCode"
                label="PIN Code"
                isDisabled={isReadOnly}
              />
              <CountryAutocomplete
                form={form}
                name="countryId"
                label="Country"
                isRequired={true}
              />

              <CustomInput
                form={form}
                name="phoneNo"
                label="Phone Number"
                isDisabled={isReadOnly}
                isRequired={true}
              />

              <CustomInput
                form={form}
                name="emailAdd"
                label="Email Address"
                isDisabled={isReadOnly}
              />
            </div>

            <div className="grid grid-cols-6 gap-2">
              <CustomSwitch
                form={form}
                name="isActive"
                label="Active Status"
                activeColor="success"
                isDisabled={isReadOnly}
              />
              <CustomSwitch
                form={form}
                name="isDefaultAdd"
                label="Default Address"
                activeColor="success"
                isDisabled={isReadOnly}
              />
              <CustomSwitch
                form={form}
                name="isDeliveryAdd"
                label="Delivery Address"
                activeColor="success"
                isDisabled={isReadOnly}
              />
              <CustomSwitch
                form={form}
                name="isFinAdd"
                label="Finance Address"
                activeColor="success"
                isDisabled={isReadOnly}
              />
              <CustomSwitch
                form={form}
                name="isSalesAdd"
                label="Sales Address"
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
                <div className="space-y-2">
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
            <Button variant="outline" type="button" onClick={onCancelAction}>
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
