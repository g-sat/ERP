"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  ICustomer,
  ICustomerAddress,
  ICustomerContact,
  ICustomerFilter,
} from "@/interfaces/customer"
import {
  CustomerAddressSchemaType,
  CustomerContactSchemaType,
  CustomerSchemaType,
} from "@/schemas/customer"
import { usePermissionStore } from "@/stores/permission-store"
import { ListFilter, RotateCcw, Save, Trash2 } from "lucide-react"

import { Customer, CustomerAddress, CustomerContact } from "@/lib/api-routes"
import { MasterTransactionId, ModuleId } from "@/lib/utils"
import { useDelete, useGet, useGetById, usePersist } from "@/hooks/use-common"
import { useGetCustomerById } from "@/hooks/use-master"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DeleteConfirmation } from "@/components/confirmation/delete-confirmation"
import { LoadConfirmation } from "@/components/confirmation/load-confirmation"
import { SaveConfirmation } from "@/components/confirmation/save-confirmation"

import { CustomerAddressForm } from "./components/address-form"
import { AddresssTable } from "./components/address-table"
import { CustomerContactForm } from "./components/contact-form"
import { ContactsTable } from "./components/contact-table"
import CustomerForm from "./components/customer-form"
import { CustomerTable } from "./components/customer-table"

export default function CustomerPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.customer

  const { hasPermission } = usePermissionStore()

  const canCreate = hasPermission(moduleId, transactionId, "isCreate")
  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")

  const [showListDialog, setShowListDialog] = useState(false)
  const [customer, setCustomer] = useState<ICustomer | null>(null)
  const [addresses, setAddresses] = useState<ICustomerAddress[]>([])
  const [contacts, setContacts] = useState<ICustomerContact[]>([])
  const [activeTab, setActiveTab] = useState<"address" | "contact">("address")
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [selectedAddress, setSelectedAddress] =
    useState<ICustomerAddress | null>(null)
  const [selectedContact, setSelectedContact] =
    useState<ICustomerContact | null>(null)
  const [addressMode, setAddressMode] = useState<"view" | "edit" | "add">(
    "view"
  )
  const [contactMode, setContactMode] = useState<"view" | "edit" | "add">(
    "view"
  )
  const [filters, setFilters] = useState<ICustomerFilter>({
    search: "",
    sortOrder: "asc",
  })
  const [key, setKey] = useState(0)

  // State for code availability check
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingCustomer, setExistingCustomer] = useState<ICustomer | null>(
    null
  )

  // Save confirmation states
  const [showCustomerSaveConfirmation, setShowCustomerSaveConfirmation] =
    useState(false)
  const [showAddressSaveConfirmation, setShowAddressSaveConfirmation] =
    useState(false)
  const [showContactSaveConfirmation, setShowContactSaveConfirmation] =
    useState(false)
  const [pendingCustomerData, setPendingCustomerData] =
    useState<CustomerSchemaType | null>(null)
  const [pendingAddressData, setPendingAddressData] =
    useState<CustomerAddressSchemaType | null>(null)
  const [pendingContactData, setPendingContactData] =
    useState<CustomerContactSchemaType | null>(null)

  // Delete confirmation states
  const [showCustomerDeleteConfirmation, setShowCustomerDeleteConfirmation] =
    useState(false)
  const [showAddressDeleteConfirmation, setShowAddressDeleteConfirmation] =
    useState(false)
  const [showContactDeleteConfirmation, setShowContactDeleteConfirmation] =
    useState(false)
  const [pendingDeleteCustomer, setPendingDeleteCustomer] =
    useState<ICustomer | null>(null)
  const [pendingDeleteAddressId, setPendingDeleteAddressId] = useState<
    string | null
  >(null)
  const [pendingDeleteContactId, setPendingDeleteContactId] = useState<
    string | null
  >(null)
  const [pendingDeleteAddress, setPendingDeleteAddress] =
    useState<ICustomerAddress | null>(null)
  const [pendingDeleteContact, setPendingDeleteContact] =
    useState<ICustomerContact | null>(null)

  // Helper function to reset all form and table data
  const resetAllData = () => {
    setAddresses([])
    setContacts([])
    setSelectedAddress(null)
    setSelectedContact(null)
    setShowAddressForm(false)
    setShowContactForm(false)
    setAddressMode("view")
    setContactMode("view")
    setActiveTab("address")
  }

  // API hooks for customers
  const {
    data: customersResponse,
    refetch: refetchCustomers,
    isLoading: isLoadingCustomers,
  } = useGet<ICustomer>(`${Customer.get}`, "customers", filters.search)

  const { refetch: refetchCustomerDetails } = useGetCustomerById<ICustomer>(
    `${Customer.getById}`,
    "customer",
    customer?.customerId || 0,
    customer?.customerCode || "0",
    customer?.customerName || "0"
  )

  const { refetch: refetchAddresses, isLoading: isLoadingAddresses } =
    useGetById<ICustomerAddress>(
      `${CustomerAddress.get}`,
      "customeraddresses",
      customer?.customerId?.toString() || ""
    )

  const { refetch: refetchContacts, isLoading: isLoadingContacts } =
    useGetById<ICustomerContact>(
      `${CustomerContact.get}`,
      "customercontacts",
      customer?.customerId?.toString() || ""
    )

  const { data: customersData } =
    (customersResponse as ApiResponse<ICustomer>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // Mutations
  const saveMutation = usePersist<CustomerSchemaType>(`${Customer.add}`)
  const updateMutation = usePersist<CustomerSchemaType>(`${Customer.add}`)
  const deleteMutation = useDelete(`${Customer.delete}`)
  const saveAddressMutation = usePersist<CustomerAddressSchemaType>(
    `${CustomerAddress.add}`
  )
  const updateAddressMutation = usePersist<CustomerAddressSchemaType>(
    `${CustomerAddress.add}`
  )
  const deleteAddressMutation = useDelete(`${CustomerAddress.delete}`)
  const saveContactMutation = usePersist<CustomerContactSchemaType>(
    `${CustomerContact.add}`
  )
  const updateContactMutation = usePersist<CustomerContactSchemaType>(
    `${CustomerContact.add}`
  )
  const deleteContactMutation = useDelete(`${CustomerContact.delete}`)

  const fetchCustomerData = useCallback(async () => {
    try {
      const { data: response } = await refetchCustomerDetails()
      if (response?.result === 1) {
        const detailedCustomer = Array.isArray(response.data)
          ? response.data[0] || null
          : response.data || null
        if (detailedCustomer?.customerId) {
          const updatedCustomer = {
            ...detailedCustomer,
            currencyId: detailedCustomer.currencyId || 0,
            bankId: detailedCustomer.bankId || 0,
            creditTermId: detailedCustomer.creditTermId || 0,
            parentCustomerId: detailedCustomer.parentCustomerId || 0,
            accSetupId: detailedCustomer.accSetupId || 0,
            customerId: detailedCustomer.customerId || 0,
          }
          setCustomer(updatedCustomer as ICustomer)
        }
      } else {
        console.error("Failed to fetch customer details:", response?.message)
      }

      const [addressesResponse, contactsResponse] = await Promise.all([
        refetchAddresses(),
        refetchContacts(),
      ])

      if (addressesResponse?.data?.result === 1)
        setAddresses(addressesResponse.data.data)
      else setAddresses([])

      if (contactsResponse?.data?.result === 1)
        setContacts(contactsResponse.data.data)
      else setContacts([])
    } catch (error) {
      console.error("Error fetching customer data:", error)
      setAddresses([])
      setContacts([])
    }
  }, [refetchCustomerDetails, refetchAddresses, refetchContacts])

  // Fetch customer details, addresses, and contacts when customer changes
  useEffect(() => {
    if (customer?.customerId) {
      fetchCustomerData()
    }
  }, [customer?.customerId, fetchCustomerData])

  const handleCustomerSave = (savedCustomer: CustomerSchemaType) => {
    setPendingCustomerData(savedCustomer)
    setShowCustomerSaveConfirmation(true)
  }

  const handleCustomerSaveConfirm = async () => {
    if (!pendingCustomerData) return

    try {
      const response =
        pendingCustomerData.customerId === 0
          ? await saveMutation.mutateAsync(pendingCustomerData)
          : await updateMutation.mutateAsync(pendingCustomerData)

      if (response.result === 1) {
        const customerData = Array.isArray(response.data)
          ? response.data[0]
          : response.data
        setCustomer(customerData as ICustomer)
        refetchCustomers()
      } else {
        console.error("Failed to save customer:", response?.message)
      }
    } catch (error) {
      console.error("Error saving customer:", error)
    } finally {
      setPendingCustomerData(null)
      setShowCustomerSaveConfirmation(false)
    }
  }

  const handleCustomerReset = () => {
    setCustomer(null)
    resetAllData()
    setKey((prev) => prev + 1)
  }

  const handleCustomerSelect = (selectedCustomer: ICustomer | null) => {
    if (selectedCustomer) {
      // Reset all data before setting new customer
      resetAllData()

      // Set the new customer
      setCustomer(selectedCustomer)
      setShowListDialog(false)
    }
  }

  const handleCustomerDelete = () => {
    if (!customer) return
    setPendingDeleteCustomer(customer)
    setShowCustomerDeleteConfirmation(true)
  }

  const handleCustomerDeleteConfirm = async () => {
    if (!pendingDeleteCustomer) return

    try {
      const response = await deleteMutation.mutateAsync(
        pendingDeleteCustomer.customerId.toString()
      )
      if (response.result === 1) {
        setCustomer(null)
        setAddresses([])
        setContacts([])
        refetchCustomers()
      } else {
        console.error("Failed to delete customer:", response?.message)
      }
    } catch (error) {
      console.error("Error deleting customer:", error)
    } finally {
      setPendingDeleteCustomer(null)
      setShowCustomerDeleteConfirmation(false)
    }
  }

  const handleAddressSave = (data: CustomerAddressSchemaType) => {
    setPendingAddressData(data)
    setShowAddressSaveConfirmation(true)
  }

  const handleAddressSaveConfirm = async () => {
    if (!pendingAddressData) return

    try {
      const response =
        pendingAddressData.addressId === 0
          ? await saveAddressMutation.mutateAsync({
              ...pendingAddressData,
              customerId: customer?.customerId || 0,
            })
          : await updateAddressMutation.mutateAsync(pendingAddressData)

      if (response.result === 1) {
        const refreshedAddresses = await refetchAddresses()
        if (refreshedAddresses?.data?.result === 1)
          setAddresses(refreshedAddresses.data.data)
        setShowAddressForm(false)
        setSelectedAddress(null)
      } else {
        console.error("Failed to save address:", response?.message)
      }
    } catch (error) {
      console.error("Error saving address:", error)
    } finally {
      setPendingAddressData(null)
      setShowAddressSaveConfirmation(false)
    }
  }

  const handleContactSave = (data: CustomerContactSchemaType) => {
    setPendingContactData(data)
    setShowContactSaveConfirmation(true)
  }

  const handleContactSaveConfirm = async () => {
    if (!pendingContactData) return

    try {
      const response =
        pendingContactData.contactId === 0
          ? await saveContactMutation.mutateAsync({
              ...pendingContactData,
              customerId: customer?.customerId || 0,
            })
          : await updateContactMutation.mutateAsync(pendingContactData)

      if (response.result === 1) {
        const refreshedContacts = await refetchContacts()
        if (refreshedContacts?.data?.result === 1)
          setContacts(refreshedContacts.data.data)
        setShowContactForm(false)
        setSelectedContact(null)
      } else {
        console.error("Failed to save contact:", response?.message)
      }
    } catch (error) {
      console.error("Error saving contact:", error)
    } finally {
      setPendingContactData(null)
      setShowContactSaveConfirmation(false)
    }
  }

  const handleAddressSelect = (address: ICustomerAddress | null) => {
    if (address) {
      setSelectedAddress(address)
      setAddressMode("view")
      setShowAddressForm(true)
    }
  }

  const handleContactSelect = (contact: ICustomerContact | null) => {
    if (contact) {
      setSelectedContact(contact)
      setContactMode("view")
      setShowContactForm(true)
    }
  }

  const handleAddressEdit = (address: ICustomerAddress | null) => {
    if (address) {
      setSelectedAddress(address)
      setAddressMode("edit")
      setShowAddressForm(true)
    }
  }

  const handleContactEdit = (contact: ICustomerContact | null) => {
    if (contact) {
      setSelectedContact(contact)
      setContactMode("edit")
      setShowContactForm(true)
    }
  }

  const handleAddressAdd = () => {
    setSelectedAddress(null)
    setAddressMode("add")
    setShowAddressForm(true)
  }

  const handleContactAdd = () => {
    setSelectedContact(null)
    setContactMode("add")
    setShowContactForm(true)
  }

  const handleAddressDelete = async (addressId: string) => {
    const addressToDelete = addresses.find(
      (addr) => addr.addressId.toString() === addressId
    )
    setPendingDeleteAddressId(addressId)
    setPendingDeleteAddress(addressToDelete || null)
    setShowAddressDeleteConfirmation(true)
  }

  const handleAddressDeleteConfirm = async () => {
    if (!pendingDeleteAddressId || !customer?.customerId) return

    try {
      const response = await deleteAddressMutation.mutateAsync(
        `${customer.customerId}/${pendingDeleteAddressId}`
      )
      if (response.result === 1) {
        const refreshedAddresses = await refetchAddresses()
        if (refreshedAddresses?.data?.result === 1)
          setAddresses(refreshedAddresses.data.data)
      } else {
        console.error("Failed to delete address:", response?.message)
      }
    } catch (error) {
      console.error("Error deleting address:", error)
    } finally {
      setPendingDeleteAddressId(null)
      setPendingDeleteAddress(null)
      setShowAddressDeleteConfirmation(false)
    }
  }

  const handleContactDelete = async (contactId: string) => {
    const contactToDelete = contacts.find(
      (contact) => contact.contactId.toString() === contactId
    )
    setPendingDeleteContactId(contactId)
    setPendingDeleteContact(contactToDelete || null)
    setShowContactDeleteConfirmation(true)
  }

  const handleContactDeleteConfirm = async () => {
    if (!pendingDeleteContactId || !customer?.customerId) return

    try {
      const response = await deleteContactMutation.mutateAsync(
        `${customer.customerId}/${pendingDeleteContactId}`
      )
      if (response.result === 1) {
        const refreshedContacts = await refetchContacts()
        if (refreshedContacts?.data?.result === 1)
          setContacts(refreshedContacts.data.data)
      } else {
        console.error("Failed to delete contact:", response?.message)
      }
    } catch (error) {
      console.error("Error deleting contact:", error)
    } finally {
      setPendingDeleteContactId(null)
      setPendingDeleteContact(null)
      setShowContactDeleteConfirmation(false)
    }
  }

  const handleFilterChange = (newFilters: ICustomerFilter) =>
    setFilters(newFilters)

  const handleCustomerLookup = async (
    customerCode: string,
    customerName: string
  ) => {
    if (!customerCode && !customerName) {
      return
    }

    // Validate input parameters
    if (
      customerCode &&
      customerCode.trim().length === 0 &&
      customerName &&
      customerName.trim().length === 0
    ) {
      return
    }

    // Skip if customer is already loaded (edit mode)
    if (customer?.customerId && customer.customerId > 0) {
      return
    }

    try {
      // Make direct API call with lookup parameters
      const { getById } = await import("@/lib/api-client")
      const response = await getById(
        `${Customer.getById}/0/${customerCode}/${customerName}`
      )

      if (response?.result === 1) {
        const detailedCustomer = Array.isArray(response.data)
          ? response.data[0] || null
          : response.data || null

        if (detailedCustomer?.customerId) {
          const updatedCustomer = {
            ...detailedCustomer,
            currencyId: detailedCustomer.currencyId || 0,
            bankId: detailedCustomer.bankId || 0,
            creditTermId: detailedCustomer.creditTermId || 0,
            parentCustomerId: detailedCustomer.parentCustomerId || 0,
            accSetupId: detailedCustomer.accSetupId || 0,
            customerId: detailedCustomer.customerId || 0,
          }

          // Show load confirmation dialog instead of directly setting customer
          setExistingCustomer(updatedCustomer as ICustomer)
          setShowLoadDialog(true)
        } else {
          // No customer found, clear any existing data
          setCustomer(null)
        }
      } else {
        // No customer found, clear any existing data
        setCustomer(null)
      }
    } catch (error) {
      console.error("Error in customer lookup:", error)
      setCustomer(null)
      setAddresses([])
      setContacts([])
    }
  }

  // Handler for loading existing customer
  const handleLoadExistingCustomer = () => {
    if (existingCustomer) {
      // Set the customer and close dialog
      setCustomer(existingCustomer)
      setShowLoadDialog(false)
      setExistingCustomer(null)
      // Reset the form key to trigger re-render with new data
      setKey((prev) => prev + 1)
    }
  }

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Customer
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage customer information, addresses, and contacts
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowListDialog(true)}
            className="w-full sm:w-auto"
          >
            <ListFilter className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">List</span>
            <span className="sm:hidden">List</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() =>
              document.getElementById("customer-form-submit")?.click()
            }
            disabled={!customer}
            className="w-full sm:w-auto"
          >
            <Save className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Save</span>
            <span className="sm:hidden">Save</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCustomerReset}
            disabled={!customer}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Reset</span>
            <span className="sm:hidden">Reset</span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleCustomerDelete}
            disabled={!customer}
            className="w-full sm:w-auto"
          >
            <Trash2 className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Delete</span>
            <span className="sm:hidden">Delete</span>
          </Button>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <Card>
          <CardContent>
            <CustomerForm
              key={key}
              initialData={customer || undefined}
              onSaveAction={handleCustomerSave}
              onCustomerLookup={handleCustomerLookup}
            />
          </CardContent>
        </Card>

        {customer && (
          <Card>
            <CardContent>
              <Tabs
                defaultValue="address"
                value={activeTab}
                onValueChange={(value) =>
                  setActiveTab(value as "address" | "contact")
                }
                className="w-full"
              >
                <div className="mb-4 flex items-center justify-between">
                  <TabsList className="grid w-[350px] grid-cols-2">
                    <TabsTrigger value="address">
                      Addresses
                      <Badge variant="secondary" className="ml-2">
                        {addresses.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="contact">
                      Contacts
                      <Badge variant="secondary" className="ml-2">
                        {contacts.length}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="address" className="space-y-4">
                  <div className="rounded-md">
                    <AddresssTable
                      key={`address-${customer?.customerId || "new"}`}
                      data={addresses}
                      isLoading={isLoadingAddresses}
                      onSelect={canView ? handleAddressSelect : undefined}
                      onDelete={canDelete ? handleAddressDelete : undefined}
                      onEdit={canEdit ? handleAddressEdit : undefined}
                      onCreate={canCreate ? handleAddressAdd : undefined}
                      onRefresh={() => refetchAddresses()}
                      moduleId={moduleId}
                      transactionId={transactionId}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      canView={canView}
                      canCreate={canCreate}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="contact" className="space-y-4">
                  <div className="rounded-md">
                    <ContactsTable
                      key={`contact-${customer?.customerId || "new"}`}
                      data={contacts}
                      isLoading={isLoadingContacts}
                      onSelect={canView ? handleContactSelect : undefined}
                      onDelete={canDelete ? handleContactDelete : undefined}
                      onEdit={canEdit ? handleContactEdit : undefined}
                      onCreate={canCreate ? handleContactAdd : undefined}
                      onRefresh={() => refetchContacts()}
                      moduleId={moduleId}
                      transactionId={transactionId}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      canView={canView}
                      canCreate={canCreate}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showListDialog} onOpenChange={setShowListDialog}>
        <DialogContent className="container mx-auto h-[85vh] w-[90vw] !max-w-none space-y-2 overflow-y-auto rounded-lg p-4 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">
              Customer List
            </DialogTitle>
            <p className="text-muted-foreground text-sm">
              Manage and select existing customers from the list below. Use
              search to filter records or create new customers.
            </p>
          </DialogHeader>
          <CustomerTable
            data={customersData || []}
            isLoading={isLoadingCustomers}
            onSelect={handleCustomerSelect}
            onFilterChange={handleFilterChange}
            onRefresh={() => refetchCustomers()}
            moduleId={moduleId}
            transactionId={transactionId}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showAddressForm} onOpenChange={setShowAddressForm}>
        <DialogContent
          className="@container w-[70vw] !max-w-none overflow-y-auto rounded-lg p-4"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {addressMode === "view"
                ? "View Address"
                : addressMode === "edit"
                  ? "Edit Address"
                  : "Add Address"}
            </DialogTitle>
            <p className="text-muted-foreground text-sm">
              {addressMode === "view"
                ? "View customer address details."
                : "Manage customer address details."}
            </p>
          </DialogHeader>
          <Separator />
          {customer?.customerId && customer.customerId > 0 && (
            <CustomerAddressForm
              key={`address-form-${selectedAddress?.addressId || "new"}-${addressMode}`}
              initialData={
                addressMode === "edit" || addressMode === "view"
                  ? selectedAddress || undefined
                  : undefined
              }
              customerId={customer.customerId}
              submitAction={handleAddressSave}
              onCancelAction={() => {
                setShowAddressForm(false)
                setSelectedAddress(null)
                setAddressMode("view")
              }}
              isSubmitting={
                saveAddressMutation.isPending || updateAddressMutation.isPending
              }
              isReadOnly={addressMode === "view"}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent
          className="@container w-[70vw] !max-w-none overflow-y-auto rounded-lg p-4"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {contactMode === "view"
                ? "View Contact"
                : contactMode === "edit"
                  ? "Edit Contact"
                  : "Add Contact"}
            </DialogTitle>
            <p className="text-muted-foreground text-sm">
              {contactMode === "view"
                ? "View customer contact details."
                : "Manage customer contact details."}
            </p>
          </DialogHeader>
          <Separator />
          {customer?.customerId && customer.customerId > 0 && (
            <CustomerContactForm
              key={`contact-form-${selectedContact?.contactId || "new"}-${contactMode}`}
              initialData={
                contactMode === "edit" || contactMode === "view"
                  ? selectedContact || undefined
                  : undefined
              }
              customerId={customer.customerId}
              submitAction={handleContactSave}
              onCancelAction={() => {
                setShowContactForm(false)
                setSelectedContact(null)
                setContactMode("view")
              }}
              isSubmitting={
                saveContactMutation.isPending || updateContactMutation.isPending
              }
              isReadOnly={contactMode === "view"}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Load Existing Customer Dialog */}
      <LoadConfirmation
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingCustomer}
        onCancel={() => {
          setExistingCustomer(null)
          setShowLoadDialog(false)
        }}
        code={existingCustomer?.customerCode}
        name={existingCustomer?.customerName}
        typeLabel="Customer"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      {/* Save Confirmation Dialogs */}
      <SaveConfirmation
        open={showCustomerSaveConfirmation}
        onOpenChange={setShowCustomerSaveConfirmation}
        onConfirm={handleCustomerSaveConfirm}
        onCancel={() => {
          setPendingCustomerData(null)
          setShowCustomerSaveConfirmation(false)
        }}
        title="Save Customer"
        itemName={pendingCustomerData?.customerName || "Customer"}
        operationType={
          pendingCustomerData?.customerId === 0 ? "create" : "update"
        }
        isSaving={saveMutation.isPending || updateMutation.isPending}
      />

      <SaveConfirmation
        open={showAddressSaveConfirmation}
        onOpenChange={setShowAddressSaveConfirmation}
        onConfirm={handleAddressSaveConfirm}
        onCancel={() => {
          setPendingAddressData(null)
          setShowAddressSaveConfirmation(false)
        }}
        title="Save Address"
        itemName={pendingAddressData?.address1 || "Address"}
        operationType={
          pendingAddressData?.addressId === 0 ? "create" : "update"
        }
        isSaving={
          saveAddressMutation.isPending || updateAddressMutation.isPending
        }
      />

      <SaveConfirmation
        open={showContactSaveConfirmation}
        onOpenChange={setShowContactSaveConfirmation}
        onConfirm={handleContactSaveConfirm}
        onCancel={() => {
          setPendingContactData(null)
          setShowContactSaveConfirmation(false)
        }}
        title="Save Contact"
        itemName={pendingContactData?.contactName || "Contact"}
        operationType={
          pendingContactData?.contactId === 0 ? "create" : "update"
        }
        isSaving={
          saveContactMutation.isPending || updateContactMutation.isPending
        }
      />

      {/* Delete Confirmation Dialogs */}
      <DeleteConfirmation
        open={showCustomerDeleteConfirmation}
        onOpenChange={setShowCustomerDeleteConfirmation}
        onConfirm={handleCustomerDeleteConfirm}
        onCancel={() => {
          setPendingDeleteCustomer(null)
          setShowCustomerDeleteConfirmation(false)
        }}
        title="Delete Customer"
        itemName={pendingDeleteCustomer?.customerName || "Customer"}
        isDeleting={deleteMutation.isPending}
      />

      <DeleteConfirmation
        open={showAddressDeleteConfirmation}
        onOpenChange={setShowAddressDeleteConfirmation}
        onConfirm={handleAddressDeleteConfirm}
        onCancel={() => {
          setPendingDeleteAddressId(null)
          setPendingDeleteAddress(null)
          setShowAddressDeleteConfirmation(false)
        }}
        title="Delete Address"
        itemName={pendingDeleteAddress?.address1 || "Address"}
        isDeleting={deleteAddressMutation.isPending}
      />

      <DeleteConfirmation
        open={showContactDeleteConfirmation}
        onOpenChange={setShowContactDeleteConfirmation}
        onConfirm={handleContactDeleteConfirm}
        onCancel={() => {
          setPendingDeleteContactId(null)
          setPendingDeleteContact(null)
          setShowContactDeleteConfirmation(false)
        }}
        title="Delete Contact"
        itemName={pendingDeleteContact?.contactName || "Contact"}
        isDeleting={deleteContactMutation.isPending}
      />
    </div>
  )
}
