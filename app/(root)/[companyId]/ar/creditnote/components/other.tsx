"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { IBankAddress, IBankContact } from "@/interfaces/bank"
import { ICustomerAddress, ICustomerContact } from "@/interfaces/customer"
import { ISupplierAddress, ISupplierContact } from "@/interfaces/supplier"
import { ArCreditNoteHdSchemaType } from "@/schemas"
import { UseFormReturn } from "react-hook-form"

import { ARTransactionId, ModuleId } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { CountryAutocomplete } from "@/components/autocomplete"
import DynamicAddressAutocomplete, {
  EntityType as AddressEntityType,
} from "@/components/autocomplete/autocomplete-address-dynamic"
import DynamicContactAutocomplete, {
  EntityType as ContactEntityType,
} from "@/components/autocomplete/autocomplete-contact-dynamic"
import CustomInput from "@/components/custom/custom-input"
import CustomTextarea from "@/components/custom/custom-textarea"
import DocumentManager from "@/components/document-manager"

interface OtherProps {
  form: UseFormReturn<ArCreditNoteHdSchemaType>
}

export default function Other({ form }: OtherProps) {
  const params = useParams()
  const companyId = params.companyId as string

  const [selectedAddress, setSelectedAddress] =
    useState<ICustomerAddress | null>(null)
  const [selectedContact, setSelectedContact] =
    useState<ICustomerContact | null>(null)

  const customerId = form.getValues().customerId || 0
  const creditNoteId = form.getValues("creditNoteId") || "0"
  const creditNoteNo = form.getValues("creditNoteNo") || ""

  // other.tsx
  useEffect(() => {
    // Initialize address from form values
    const address: ICustomerAddress = {
      customerId: customerId,
      addressId: form.getValues("addressId") || 0,
      address1: form.getValues("address1") || "",
      address2: form.getValues("address2") || "",
      address3: form.getValues("address3") || "",
      address4: form.getValues("address4") || "",
      pinCode: form.getValues("pinCode") || "",
      countryId: form.getValues("countryId") || 0,
      phoneNo: form.getValues("phoneNo") || "",
      faxNo: form.getValues("faxNo") || "",
      emailAdd: "",
      webUrl: "",
      isDefaultAdd: false,
      isDeliveryAdd: false,
      isFinAdd: false,
      isSalesAdd: false,
      isActive: true,
      createById: 0,
      createDate: new Date(),
      editById: 0,
      editDate: new Date(),
      createBy: "",
      editBy: "",
    }
    setSelectedAddress(address)

    // Initialize contact from form values
    const contact: ICustomerContact = {
      contactId: form.getValues("contactId") || 0,
      customerId: customerId,
      customerCode: "",
      customerName: "",
      contactName: form.getValues("contactName") || "",
      otherName: form.getValues("emailAdd") || "",
      mobileNo: form.getValues("mobileNo") || "",
      offNo: "",
      faxNo: "",
      emailAdd: "",
      messId: "",
      contactMessType: "",
      isDefault: false,
      isFinance: false,
      isSales: false,
      isActive: true,
      createById: 0,
      createDate: new Date(),
      editById: 0,
      editDate: new Date(),
      createBy: "",
      editBy: "",
    }
    setSelectedContact(contact)
  }, [customerId, form]) // Re-run when customerId changes

  const handleAddressSelect = (
    address: ICustomerAddress | ISupplierAddress | IBankAddress | null
  ) => {
    // Type guard to ensure we only work with supplier addresses
    const customerAddress = address as ICustomerAddress | null
    setSelectedAddress(customerAddress)
    if (customerAddress) {
      form.setValue("addressId", customerAddress.addressId)
      form.setValue("address1", customerAddress.address1 || "")
      form.setValue("address2", customerAddress.address2 || "")
      form.setValue("address3", customerAddress.address3 || "")
      form.setValue("address4", customerAddress.address4 || "")
      form.setValue("pinCode", customerAddress.pinCode?.toString() || "")
      form.setValue("phoneNo", customerAddress.phoneNo || "")
      form.setValue("faxNo", customerAddress.faxNo || "")
      form.setValue("countryId", customerAddress.countryId || 0)
    } else {
      form.setValue("addressId", 0)
      form.setValue("address1", "")
      form.setValue("address2", "")
      form.setValue("address3", "")
      form.setValue("address4", "")
      form.setValue("pinCode", "")
      form.setValue("phoneNo", "")
      form.setValue("faxNo", "")
      form.setValue("countryId", 0)
    }
  }

  const handleContactSelect = (
    contact: ICustomerContact | ISupplierContact | IBankContact | null
  ) => {
    // Type guard to ensure we only work with supplier contacts
    const customerContact = contact as ICustomerContact | null
    setSelectedContact(customerContact)
    if (customerContact) {
      form.setValue("contactId", customerContact.contactId)
      form.setValue("contactName", customerContact.contactName || "")
      form.setValue("emailAdd", customerContact.otherName || "")
      form.setValue("mobileNo", customerContact.mobileNo || "")
    } else {
      form.setValue("contactId", 0)
      form.setValue("contactName", "")
      form.setValue("emailAdd", "")
      form.setValue("mobileNo", "")
    }
  }

  return (
    <div className="space-y-2">
      <Form {...form}>
        <div className="grid grid-cols-2 gap-2">
          {/* Address Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Address Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-1">
                {customerId > 0 && (
                  <DynamicAddressAutocomplete
                    form={form}
                    name="addressId"
                    label="Address"
                    entityId={customerId}
                    entityType={AddressEntityType.CUSTOMER}
                    onChangeEvent={handleAddressSelect}
                  />
                )}
                <Separator className="my-2" />
                <div className="grid grid-cols-2 gap-2">
                  <CustomTextarea
                    form={form}
                    name="address1"
                    label="Address Line 1"
                    isDisabled={!selectedAddress}
                  />
                  <CustomTextarea
                    form={form}
                    name="address2"
                    label="Address Line 2"
                    isDisabled={!selectedAddress}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <CustomTextarea
                    form={form}
                    name="address3"
                    label="Address Line 3"
                    isDisabled={!selectedAddress}
                  />
                  <CustomTextarea
                    form={form}
                    name="address4"
                    label="Address Line 4"
                    isDisabled={!selectedAddress}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <CountryAutocomplete
                    form={form}
                    name="countryId"
                    label="Country"
                  />
                  <CustomInput
                    form={form}
                    name="pinCode"
                    label="Pin Code"
                    isDisabled={!selectedAddress}
                  />
                  <CustomInput
                    form={form}
                    name="phoneNo"
                    label="Phone No"
                    isDisabled={!selectedAddress}
                  />
                  <CustomInput
                    form={form}
                    name="faxNo"
                    label="Fax No"
                    isDisabled={!selectedAddress}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2"></div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {customerId > 0 && (
                  <DynamicContactAutocomplete
                    form={form}
                    name="contactId"
                    label="Contact"
                    entityId={customerId}
                    entityType={ContactEntityType.CUSTOMER}
                    onChangeEvent={handleContactSelect}
                  />
                )}
                <Separator className="my-2" />
                <div className="grid grid-cols-2 gap-2">
                  <CustomInput
                    form={form}
                    name="contactName"
                    label="Contact Name"
                    isDisabled={!selectedContact}
                  />
                  <CustomInput
                    form={form}
                    name="emailAdd"
                    label="Email"
                    isDisabled={!selectedAddress}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <CustomInput
                    form={form}
                    name="mobileNo"
                    label="Mobile No"
                    isDisabled={!selectedContact}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Form>

      {/* Document Upload Section - Only show after creditNote is saved */}
      {creditNoteId !== "0" && (
        <DocumentManager
          moduleId={ModuleId.ar}
          transactionId={ARTransactionId.creditNote}
          recordId={creditNoteId}
          recordNo={creditNoteNo}
          companyId={Number(companyId)}
          maxFileSize={10}
          maxFiles={10}
        />
      )}
    </div>
  )
}
