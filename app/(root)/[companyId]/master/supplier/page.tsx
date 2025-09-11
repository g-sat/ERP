"use client"

import { useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  ISupplier,
  ISupplierAddress,
  ISupplierContact,
  ISupplierFilter,
} from "@/interfaces/supplier"
import {
  SupplierAddressFormValues,
  SupplierContactFormValues,
  SupplierFormValues,
} from "@/schemas/supplier"
import { usePermissionStore } from "@/stores/permission-store"
import { ListFilter, RotateCcw, Save, Trash2 } from "lucide-react"

import { Supplier, SupplierAddress, SupplierContact } from "@/lib/api-routes"
import { MasterTransactionId, ModuleId } from "@/lib/utils"
import { useDelete, useGet, useGetById, usePersist } from "@/hooks/use-common"
import { useGetSupplierById } from "@/hooks/use-master"
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
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { SaveConfirmation } from "@/components/save-confirmation"

import { SupplierAddressForm } from "./components/address-form"
import { AddresssTable } from "./components/address-table"
import { SupplierContactForm } from "./components/contact-form"
import { ContactsTable } from "./components/contact-table"
import SupplierForm from "./components/supplier-form"
import { SupplierTable } from "./components/supplier-table"

export default function SupplierPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.supplier

  const { hasPermission } = usePermissionStore()

  const canCreate = hasPermission(moduleId, transactionId, "isCreate")
  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")

  const [showListDialog, setShowListDialog] = useState(false)
  const [supplier, setSupplier] = useState<ISupplier | null>(null)
  const [addresses, setAddresses] = useState<ISupplierAddress[]>([])
  const [contacts, setContacts] = useState<ISupplierContact[]>([])
  const [activeTab, setActiveTab] = useState<"address" | "contact">("address")
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [selectedAddress, setSelectedAddress] =
    useState<ISupplierAddress | null>(null)
  const [selectedContact, setSelectedContact] =
    useState<ISupplierContact | null>(null)
  const [addressMode, setAddressMode] = useState<"view" | "edit" | "add">(
    "view"
  )
  const [contactMode, setContactMode] = useState<"view" | "edit" | "add">(
    "view"
  )
  const [filters, setFilters] = useState<ISupplierFilter>({
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

  // API hooks for suppliers
  const {
    data: suppliersResponse,
    refetch: refetchSuppliers,
    isLoading: isLoadingSuppliers,
    isRefetching: isRefetchingSuppliers,
  } = useGet<ISupplier>(`${Supplier.get}`, "suppliers", filters.search)

  const { refetch: refetchSupplierDetails } = useGetSupplierById<ISupplier>(
    `${Supplier.getById}`,
    "supplier",
    supplier?.supplierId || 0,
    supplier?.supplierCode || "0",
    supplier?.supplierName || "0"
  )

  const { refetch: refetchAddresses, isLoading: isLoadingAddresses } =
    useGetById<ISupplierAddress>(
      `${SupplierAddress.get}`,
      "supplieraddresses",

      supplier?.supplierId?.toString() || "",
      { enabled: !!supplier?.supplierId }
    )

  const { refetch: refetchContacts, isLoading: isLoadingContacts } =
    useGetById<ISupplierContact>(
      `${SupplierContact.get}`,
      "suppliercontacts",

      supplier?.supplierId?.toString() || "",
      { enabled: !!supplier?.supplierId }
    )

  const { data: suppliersData } =
    (suppliersResponse as ApiResponse<ISupplier>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // Mutations
  const saveMutation = usePersist<SupplierFormValues>(`${Supplier.add}`)
  const updateMutation = usePersist<SupplierFormValues>(`${Supplier.add}`)
  const deleteMutation = useDelete(`${Supplier.delete}`)
  const saveAddressMutation = usePersist<SupplierAddressFormValues>(
    `${SupplierAddress.add}`
  )
  const updateAddressMutation = usePersist<SupplierAddressFormValues>(
    `${SupplierAddress.add}`
  )
  const deleteAddressMutation = useDelete(`${SupplierAddress.delete}`)
  const saveContactMutation = usePersist<SupplierContactFormValues>(
    `${SupplierContact.add}`
  )
  const updateContactMutation = usePersist<SupplierContactFormValues>(
    `${SupplierContact.add}`
  )
  const deleteContactMutation = useDelete(`${SupplierContact.delete}`)

  // Fetch supplier details, addresses, and contacts when supplier changes
  useEffect(() => {
    if (supplier?.supplierId) {
      fetchSupplierData()
    }
  }, [supplier?.supplierId])

  const fetchSupplierData = async () => {
    try {
      const { data: response } = await refetchSupplierDetails()
      if (response?.result === 1) {
        const detailedSupplier = Array.isArray(response.data)
          ? response.data[0] || null
          : response.data || null
        if (detailedSupplier?.supplierId) {
          const updatedSupplier = {
            ...detailedSupplier,
            currencyId: detailedSupplier.currencyId || 0,
            bankId: detailedSupplier.bankId || 0,
            creditTermId: detailedSupplier.creditTermId || 0,
            parentSupplierId: detailedSupplier.parentSupplierId || 0,
            accSetupId: detailedSupplier.accSetupId || 0,
            supplierId: detailedSupplier.supplierId || 0,
          }
          setSupplier(updatedSupplier as ISupplier)
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

  const handleSupplierSave = async (savedSupplier: SupplierFormValues) => {
    try {
      const response =
        savedSupplier.supplierId === 0
          ? await saveMutation.mutateAsync(savedSupplier)
          : await updateMutation.mutateAsync(savedSupplier)

      if (response.result === 1) {
        const supplierData = Array.isArray(response.data)
          ? response.data[0]
          : response.data
        setSupplier(supplierData as ISupplier)
        refetchSuppliers()
      } else {
      }
    } catch {}
  }

  const handleSupplierSelect = (selectedSupplier: ISupplier | undefined) => {
    if (selectedSupplier) {
      // Reset all data before setting new supplier
      resetAllData()

      // Set the new supplier
      setSupplier(selectedSupplier)
      setShowListDialog(false)
    }
  }

  const handleSupplierDelete = async () => {
    if (!supplier) return

    try {
      const response = await deleteMutation.mutateAsync(
        supplier.supplierId.toString()
      )
      if (response.result === 1) {
        setSupplier(null)
        setAddresses([])
        setContacts([])
        refetchSuppliers()
      } else {
      }
    } catch {}
  }

  const handleSupplierReset = () => {
    setSupplier(null)
    resetAllData()
    setKey((prev) => prev + 1)
  }

  const handleAddressSave = async (data: SupplierAddressFormValues) => {
    try {
      const response =
        data.addressId === 0
          ? await saveAddressMutation.mutateAsync({
              ...data,
              supplierId: supplier?.supplierId || 0,
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

  const handleContactSave = async (data: SupplierContactFormValues) => {
    try {
      const response =
        data.contactId === 0
          ? await saveContactMutation.mutateAsync({
              ...data,
              supplierId: supplier?.supplierId || 0,
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

  const handleAddressSelect = (address: ISupplierAddress | undefined) => {
    if (address) {
      setSelectedAddress(address)
      setAddressMode("view")
      setShowAddressForm(true)
    }
  }

  const handleContactSelect = (contact: ISupplierContact | undefined) => {
    if (contact) {
      setSelectedContact(contact)
      setContactMode("view")
      setShowContactForm(true)
    }
  }

  const handleAddressEdit = (address: ISupplierAddress | undefined) => {
    if (address) {
      setSelectedAddress(address)
      setAddressMode("edit")
      setShowAddressForm(true)
    }
  }

  const handleContactEdit = (contact: ISupplierContact | undefined) => {
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

  const handleFilterChange = (newFilters: ISupplierFilter) =>
    setFilters(newFilters)

  const handleSupplierLookup = async (
    supplierCode: string,
    supplierName: string
  ) => {
    if (!supplierCode && !supplierName) {
      return
    }

    // Reset all data before fetching new supplier
    resetAllData()

    try {
      const { data: response } = await refetchSupplierDetails()
      if (response?.result === 1) {
        const detailedSupplier = Array.isArray(response.data)
          ? response.data[0] || null
          : response.data || null
        if (detailedSupplier?.supplierId) {
          const updatedSupplier = {
            ...detailedSupplier,
            currencyId: detailedSupplier.currencyId || 0,
            bankId: detailedSupplier.bankId || 0,
            creditTermId: detailedSupplier.creditTermId || 0,
            parentSupplierId: detailedSupplier.parentSupplierId || 0,
            accSetupId: detailedSupplier.accSetupId || 0,
            supplierId: detailedSupplier.supplierId || 0,
          }
          setSupplier(updatedSupplier as ISupplier)
        } else {
        }
      } else {
      }
    } catch {
      setSupplier(null)
      setAddresses([])
      setContacts([])
    }
  }

  return (
    <div className="@container flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Supplier</h1>
          <p className="text-muted-foreground text-sm">
            Manage supplier information, addresses, and contacts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowListDialog(true)}
          >
            <ListFilter className="mr-1 h-4 w-4" />
            List
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() =>
              document.getElementById("supplier-form-submit")?.click()
            }
            disabled={!supplier}
          >
            <Save className="mr-1 h-4 w-4" />
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSupplierReset}
            disabled={!supplier}
          >
            <RotateCcw className="mr-1 h-4 w-4" />
            Reset
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSupplierDelete}
            disabled={!supplier}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <Card>
          <CardContent>
            <SupplierForm
              key={key}
              initialData={supplier || undefined}
              onSave={handleSupplierSave}
              onSupplierLookup={handleSupplierLookup}
            />
          </CardContent>
        </Card>

        {supplier && (
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
                      key={`address-${supplier?.supplierId || "new"}`}
                      data={addresses}
                      isLoading={isLoadingAddresses}
                      onAddressSelect={
                        canView ? handleAddressSelect : undefined
                      }
                      onDeleteAddress={
                        canDelete ? handleAddressDelete : undefined
                      }
                      onEditAddress={canEdit ? handleAddressEdit : undefined}
                      onCreateAddress={canCreate ? handleAddressAdd : undefined}
                      moduleId={moduleId}
                      transactionId={transactionId}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="contact" className="space-y-4">
                  <div className="rounded-md">
                    <ContactsTable
                      key={`contact-${supplier?.supplierId || "new"}`}
                      data={contacts}
                      isLoading={isLoadingContacts}
                      onContactSelect={
                        canView ? handleContactSelect : undefined
                      }
                      onDeleteContact={
                        canDelete ? handleContactDelete : undefined
                      }
                      onEditContact={canEdit ? handleContactEdit : undefined}
                      onCreateContact={canCreate ? handleContactAdd : undefined}
                      moduleId={moduleId}
                      transactionId={transactionId}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showListDialog} onOpenChange={setShowListDialog}>
        <DialogContent className="@container h-[90vh] w-[90vw] !max-w-none overflow-y-auto rounded-lg p-4">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold tracking-tight">
              Supplier List
            </DialogTitle>
            <p className="text-muted-foreground text-sm">
              Manage and select existing suppliers from the list below. Use
              search to filter records or create new suppliers.
            </p>
          </DialogHeader>
          <SupplierTable
            data={suppliersData || []}
            isLoading={isLoadingSuppliers || isRefetchingSuppliers}
            onSupplierSelect={handleSupplierSelect}
            onFilterChange={handleFilterChange}
            onRefresh={() => refetchSuppliers()}
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
                ? "View supplier address details."
                : "Manage supplier address details."}
            </p>
          </DialogHeader>
          <Separator />
          <SupplierAddressForm
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
                ? "View supplier contact details."
                : "Manage supplier contact details."}
            </p>
          </DialogHeader>
          <Separator />
          <SupplierContactForm
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
