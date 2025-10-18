"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { IBankAddress, IBankContact } from "@/interfaces/bank"
import { ICustomerAddress, ICustomerContact } from "@/interfaces/customer"
import { ISupplierAddress, ISupplierContact } from "@/interfaces/supplier"
import { ApInvoiceHdSchemaType } from "@/schemas/ap-invoice"
import { UseFormReturn } from "react-hook-form"

import { APTransactionId, ModuleId } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import DynamicAddressAutocomplete, {
  EntityType as AddressEntityType,
} from "@/components/autocomplete/autocomplete-address-dynamic"
import DynamicContactAutocomplete, {
  EntityType as ContactEntityType,
} from "@/components/autocomplete/autocomplete-contact-dynamic"
import CountryAutocomplete from "@/components/autocomplete/autocomplete-country"
import CustomInput from "@/components/custom/custom-input"
import CustomTextarea from "@/components/custom/custom-textarea"
import EnhancedDocumentUpload from "@/components/custom/enhanced-document-upload"

interface OtherProps {
  form: UseFormReturn<ApInvoiceHdSchemaType>
}

export default function Other({ form }: OtherProps) {
  const params = useParams()
  const companyId = params.companyId as string

  const [selectedAddress, setSelectedAddress] =
    useState<ISupplierAddress | null>(null)
  const [selectedContact, setSelectedContact] =
    useState<ISupplierContact | null>(null)

  const supplierId = form.getValues().supplierId || 0
  const invoiceId = form.getValues("invoiceId") || "0"
  const invoiceNo = form.getValues("invoiceNo") || ""

  // other.tsx
  useEffect(() => {
    // Initialize address from form values
    const address: ISupplierAddress = {
      supplierId: supplierId,
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
    const contact: ISupplierContact = {
      contactId: form.getValues("contactId") || 0,
      supplierId: supplierId,
      supplierCode: "",
      supplierName: "",
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
  }, [supplierId, form]) // Re-run when supplierId changes

  const handleAddressSelect = (
    address: ICustomerAddress | ISupplierAddress | IBankAddress | null
  ) => {
    // Type guard to ensure we only work with supplier addresses
    const supplierAddress = address as ISupplierAddress | null
    setSelectedAddress(supplierAddress)
    if (supplierAddress) {
      form.setValue("addressId", supplierAddress.addressId)
      form.setValue("address1", supplierAddress.address1 || "")
      form.setValue("address2", supplierAddress.address2 || "")
      form.setValue("address3", supplierAddress.address3 || "")
      form.setValue("address4", supplierAddress.address4 || "")
      form.setValue("pinCode", supplierAddress.pinCode?.toString() || "")
      form.setValue("phoneNo", supplierAddress.phoneNo || "")
      form.setValue("faxNo", supplierAddress.faxNo || "")
      form.setValue("countryId", supplierAddress.countryId || 0)
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
    const supplierContact = contact as ISupplierContact | null
    setSelectedContact(supplierContact)
    if (supplierContact) {
      form.setValue("contactId", supplierContact.contactId)
      form.setValue("contactName", supplierContact.contactName || "")
      form.setValue("emailAdd", supplierContact.otherName || "")
      form.setValue("mobileNo", supplierContact.mobileNo || "")
    } else {
      form.setValue("contactId", 0)
      form.setValue("contactName", "")
      form.setValue("emailAdd", "")
      form.setValue("mobileNo", "")
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <div className="grid grid-cols-2 gap-2">
          {/* Address Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Address Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-1">
                {supplierId > 0 && (
                  <DynamicAddressAutocomplete
                    form={form}
                    name="addressId"
                    label="Address"
                    entityId={supplierId}
                    entityType={AddressEntityType.SUPPLIER}
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
                {supplierId > 0 && (
                  <DynamicContactAutocomplete
                    form={form}
                    name="contactId"
                    label="Contact"
                    entityId={supplierId}
                    entityType={ContactEntityType.SUPPLIER}
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

      {/* Document Upload Section */}
      <EnhancedDocumentUpload
        moduleId={ModuleId.ap}
        transactionId={APTransactionId.invoice}
        recordId={invoiceId}
        recordNo={invoiceNo}
        companyId={Number(companyId)}
        maxFileSize={10}
        maxFiles={10}
      />
    </div>
  )
}
