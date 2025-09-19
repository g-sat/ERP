"use client"

import { useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  ICustomer,
  ICustomerAddress,
  ICustomerContact,
  ICustomerFilter,
} from "@/interfaces/customer"
import {
  CustomerAddressFormValues,
  CustomerContactFormValues,
  CustomerFormValues,
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

  console.log(
    "Permission customer details",
    canCreate,
    canDelete,
    canEdit,
    canView
  )

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
  const saveMutation = usePersist<CustomerFormValues>(`${Customer.add}`)
  const updateMutation = usePersist<CustomerFormValues>(`${Customer.add}`)
  const deleteMutation = useDelete(`${Customer.delete}`)
  const saveAddressMutation = usePersist<CustomerAddressFormValues>(
    `${CustomerAddress.add}`
  )
  const updateAddressMutation = usePersist<CustomerAddressFormValues>(
    `${CustomerAddress.add}`
  )
  const deleteAddressMutation = useDelete(`${CustomerAddress.delete}`)
  const saveContactMutation = usePersist<CustomerContactFormValues>(
    `${CustomerContact.add}`
  )
  const updateContactMutation = usePersist<CustomerContactFormValues>(
    `${CustomerContact.add}`
  )
  const deleteContactMutation = useDelete(`${CustomerContact.delete}`)

  // Fetch customer details, addresses, and contacts when customer changes
  useEffect(() => {
    if (customer?.customerId) {
      fetchCustomerData()
    }
  }, [customer?.customerId])

  const fetchCustomerData = async () => {
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
    } catch {
      setAddresses([])
      setContacts([])
    }
  }

  const handleCustomerSave = async (savedCustomer: CustomerFormValues) => {
    try {
      const response =
        savedCustomer.customerId === 0
          ? await saveMutation.mutateAsync(savedCustomer)
          : await updateMutation.mutateAsync(savedCustomer)

      if (response.result === 1) {
        const customerData = Array.isArray(response.data)
          ? response.data[0]
          : response.data
        setCustomer(customerData as ICustomer)
        refetchCustomers()
      } else {
      }
    } catch {}
  }

  const handleCustomerReset = () => {
    setCustomer(null)
    resetAllData()
    setKey((prev) => prev + 1)
  }

  const handleCustomerSelect = (selectedCustomer: ICustomer | undefined) => {
    if (selectedCustomer) {
      // Reset all data before setting new customer
      resetAllData()

      // Set the new customer
      setCustomer(selectedCustomer)
      setShowListDialog(false)
    }
  }

  const handleCustomerDelete = async () => {
    if (!customer) return

    try {
      const response = await deleteMutation.mutateAsync(
        customer.customerId.toString()
      )
      if (response.result === 1) {
        setCustomer(null)
        setAddresses([])
        setContacts([])
        refetchCustomers()
      } else {
      }
    } catch {}
  }

  const handleAddressSave = async (data: CustomerAddressFormValues) => {
    try {
      const response =
        data.addressId === 0
          ? await saveAddressMutation.mutateAsync({
              ...data,
              customerId: customer?.customerId || 0,
            })
          : await updateAddressMutation.mutateAsync(data)

      if (response.result === 1) {
        const refreshedAddresses = await refetchAddresses()
        if (refreshedAddresses?.data?.result === 1)
          setAddresses(refreshedAddresses.data.data)
        setShowAddressForm(false)
        setSelectedAddress(null)
      } else {
      }
    } catch {}
  }

  const handleContactSave = async (data: CustomerContactFormValues) => {
    try {
      const response =
        data.contactId === 0
          ? await saveContactMutation.mutateAsync({
              ...data,
              customerId: customer?.customerId || 0,
            })
          : await updateContactMutation.mutateAsync(data)

      if (response.result === 1) {
        const refreshedContacts = await refetchContacts()
        if (refreshedContacts?.data?.result === 1)
          setContacts(refreshedContacts.data.data)
        setShowContactForm(false)
        setSelectedContact(null)
      } else {
      }
    } catch {}
  }

  const handleAddressSelect = (address: ICustomerAddress | undefined) => {
    if (address) {
      setSelectedAddress(address)
      setAddressMode("view")
      setShowAddressForm(true)
    }
  }

  const handleContactSelect = (contact: ICustomerContact | undefined) => {
    if (contact) {
      setSelectedContact(contact)
      setContactMode("view")
      setShowContactForm(true)
    }
  }

  const handleAddressEdit = (address: ICustomerAddress | undefined) => {
    if (address) {
      setSelectedAddress(address)
      setAddressMode("edit")
      setShowAddressForm(true)
    }
  }

  const handleContactEdit = (contact: ICustomerContact | undefined) => {
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
    try {
      const response = await deleteAddressMutation.mutateAsync(addressId)
      if (response.result === 1) {
        const refreshedAddresses = await refetchAddresses()
        if (refreshedAddresses?.data?.result === 1)
          setAddresses(refreshedAddresses.data.data)
      } else {
      }
    } catch {}
  }

  const handleContactDelete = async (contactId: string) => {
    try {
      const response = await deleteContactMutation.mutateAsync(contactId)
      if (response.result === 1) {
        const refreshedContacts = await refetchContacts()
        if (refreshedContacts?.data?.result === 1)
          setContacts(refreshedContacts.data.data)
      } else {
      }
    } catch {}
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

    // Reset all data before fetching new customer
    resetAllData()

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
        } else {
        }
      } else {
      }
    } catch {
      setCustomer(null)
      setAddresses([])
      setContacts([])
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
              onSave={handleCustomerSave}
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
            onCustomerSelect={handleCustomerSelect}
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
          <CustomerAddressForm
            key={`address-form-${selectedAddress?.addressId || "new"}-${addressMode}`}
            initialData={
              addressMode === "edit" || addressMode === "view"
                ? selectedAddress || undefined
                : undefined
            }
            submitAction={handleAddressSave}
            onCancel={() => {
              setShowAddressForm(false)
              setSelectedAddress(null)
              setAddressMode("view")
            }}
            isSubmitting={
              saveAddressMutation.isPending || updateAddressMutation.isPending
            }
            isReadOnly={addressMode === "view"}
          />
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
          <CustomerContactForm
            key={`contact-form-${selectedContact?.contactId || "new"}-${contactMode}`}
            initialData={
              contactMode === "edit" || contactMode === "view"
                ? selectedContact || undefined
                : undefined
            }
            submitAction={handleContactSave}
            onCancel={() => {
              setShowContactForm(false)
              setSelectedContact(null)
              setContactMode("view")
            }}
            isSubmitting={
              saveContactMutation.isPending || updateContactMutation.isPending
            }
            isReadOnly={contactMode === "view"}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
