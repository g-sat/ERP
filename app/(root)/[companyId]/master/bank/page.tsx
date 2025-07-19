"use client"

import { useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  IBank,
  IBankAddress,
  IBankContact,
  IBankFilter,
} from "@/interfaces/bank"
import {
  BankAddressFormValues,
  BankContactFormValues,
  BankFormValues,
} from "@/schemas/bank"
import { usePermissionStore } from "@/stores/permission-store"
import { ListFilter, RotateCcw, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Bank, BankAddress, BankContact } from "@/lib/api-routes"
import { MasterTransactionId, ModuleId } from "@/lib/utils"
import {
  useDelete,
  useGet,
  useGetById,
  useSave,
  useUpdate,
} from "@/hooks/use-common"
import { useGetBankById } from "@/hooks/use-master"
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

import { BankAddressForm } from "./components/address-form"
import { AddresssTable } from "./components/address-table"
import BankForm from "./components/bank-form"
import { BankTable } from "./components/bank-table"
import { BankContactForm } from "./components/contact-form"
import { ContactsTable } from "./components/contact-table"

export default function BankPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.bank

  const { hasPermission } = usePermissionStore()

  const canCreate = hasPermission(moduleId, transactionId, "isCreate")
  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")

  const [showListDialog, setShowListDialog] = useState(false)
  const [bank, setBank] = useState<IBank | null>(null)
  const [addresses, setAddresses] = useState<IBankAddress[]>([])
  const [contacts, setContacts] = useState<IBankContact[]>([])
  const [activeTab, setActiveTab] = useState<"address" | "contact">("address")
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<IBankAddress | null>(
    null
  )
  const [selectedContact, setSelectedContact] = useState<IBankContact | null>(
    null
  )
  const [addressMode, setAddressMode] = useState<"view" | "edit" | "add">(
    "view"
  )
  const [contactMode, setContactMode] = useState<"view" | "edit" | "add">(
    "view"
  )
  const [filters, setFilters] = useState<IBankFilter>({
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

  // API hooks for banks
  const {
    data: banksResponse,
    refetch: refetchBanks,
    isLoading: isLoadingBanks,
    isRefetching: isRefetchingBanks,
  } = useGet<IBank>(`${Bank.get}`, "banks", filters.search)

  const { refetch: refetchBankDetails } = useGetBankById<IBank>(
    `${Bank.getById}`,
    "bank",
    bank?.bankId || 0,
    bank?.bankCode || "0",
    bank?.bankName || "0"
  )

  const { refetch: refetchAddresses, isLoading: isLoadingAddresses } =
    useGetById<IBankAddress>(
      `${BankAddress.get}`,
      "bankaddresses",
      bank?.bankId?.toString() || "",
      { enabled: !!bank?.bankId }
    )

  const { refetch: refetchContacts, isLoading: isLoadingContacts } =
    useGetById<IBankContact>(
      `${BankContact.get}`,
      "bankcontacts",
      bank?.bankId?.toString() || "",
      { enabled: !!bank?.bankId }
    )

  const { data: banksData } = (banksResponse as ApiResponse<IBank>) ?? {
    result: 0,
    message: "",
    data: [],
  }

  // Mutations
  const saveMutation = useSave<BankFormValues>(`${Bank.add}`)
  const updateMutation = useUpdate<BankFormValues>(`${Bank.add}`)
  const deleteMutation = useDelete(`${Bank.delete}`)
  const saveAddressMutation = useSave<BankAddressFormValues>(
    `${BankAddress.add}`
  )
  const updateAddressMutation = useUpdate<BankAddressFormValues>(
    `${BankAddress.add}`
  )
  const deleteAddressMutation = useDelete(`${BankAddress.delete}`)
  const saveContactMutation = useSave<BankContactFormValues>(
    `${BankContact.add}`
  )
  const updateContactMutation = useUpdate<BankContactFormValues>(
    `${BankContact.add}`
  )
  const deleteContactMutation = useDelete(`${BankContact.delete}`)

  // Fetch bank details, addresses, and contacts when bank changes
  useEffect(() => {
    if (bank?.bankId) {
      fetchBankData()
    }
  }, [bank?.bankId])

  const fetchBankData = async () => {
    try {
      const { data: response } = await refetchBankDetails()
      if (response?.result === 1) {
        const detailedBank = Array.isArray(response.data)
          ? response.data[0] || null
          : response.data || null
        if (detailedBank?.bankId) {
          const updatedBank = {
            ...detailedBank,
            currencyId: detailedBank.currencyId || 0,
            bankId: detailedBank.bankId || 0,
          }
          setBank(updatedBank as IBank)
        }
      } else {
        toast.error(response?.message || "Failed to fetch bank details")
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
      toast.error("Network error while fetching data")
      setAddresses([])
      setContacts([])
    }
  }

  const handleBankSave = async (savedBank: BankFormValues) => {
    try {
      const response =
        savedBank.bankId === 0
          ? await saveMutation.mutateAsync(savedBank)
          : await updateMutation.mutateAsync(savedBank)

      if (response.result === 1) {
        const bankData = Array.isArray(response.data)
          ? response.data[0]
          : response.data
        setBank(bankData as IBank)
        toast.success("Bank saved successfully")
        refetchBanks()
      } else {
        toast.error(response.message || "Failed to save bank")
      }
    } catch {
      toast.error("Network error while saving bank")
    }
  }

  const handleBankSelect = (selectedBank: IBank | undefined) => {
    if (selectedBank) {
      // Reset all data before setting new bank
      resetAllData()

      // Set the new bank
      setBank(selectedBank)
      setShowListDialog(false)
    }
  }

  const handleBankDelete = async () => {
    if (!bank) return

    try {
      const response = await deleteMutation.mutateAsync(bank.bankId.toString())
      if (response.result === 1) {
        setBank(null)
        setAddresses([])
        setContacts([])
        toast.success("Bank deleted successfully")
        refetchBanks()
      } else {
        toast.error(response.message || "Failed to delete bank")
      }
    } catch {
      toast.error("Network error while deleting bank")
    }
  }

  const handleBankReset = () => {
    setBank(null)
    resetAllData()
    setKey((prev) => prev + 1)
  }

  const handleAddressSave = async (data: BankAddressFormValues) => {
    try {
      const response =
        data.addressId === 0
          ? await saveAddressMutation.mutateAsync({
              ...data,
              bankId: bank?.bankId || 0,
            })
          : await updateAddressMutation.mutateAsync(data)

      if (response.result === 1) {
        toast.success("Address saved successfully")
        const refreshedAddresses = await refetchAddresses()
        if (refreshedAddresses?.data?.result === 1)
          setAddresses(refreshedAddresses.data.data)
        setShowAddressForm(false)
        setSelectedAddress(null)
      } else {
        toast.error(response.message || "Failed to save address")
      }
    } catch {
      toast.error("Network error while saving address")
    }
  }

  const handleContactSave = async (data: BankContactFormValues) => {
    try {
      const response =
        data.contactId === 0
          ? await saveContactMutation.mutateAsync({
              ...data,
              bankId: bank?.bankId || 0,
            })
          : await updateContactMutation.mutateAsync(data)

      if (response.result === 1) {
        toast.success("Contact saved successfully")
        const refreshedContacts = await refetchContacts()
        if (refreshedContacts?.data?.result === 1)
          setContacts(refreshedContacts.data.data)
        setShowContactForm(false)
        setSelectedContact(null)
      } else {
        toast.error(response.message || "Failed to save contact")
      }
    } catch {
      toast.error("Network error while saving contact")
    }
  }

  const handleAddressSelect = (address: IBankAddress | undefined) => {
    if (address) {
      setSelectedAddress(address)
      setAddressMode("view")
      setShowAddressForm(true)
    }
  }

  const handleContactSelect = (contact: IBankContact | undefined) => {
    if (contact) {
      setSelectedContact(contact)
      setContactMode("view")
      setShowContactForm(true)
    }
  }

  const handleAddressEdit = (address: IBankAddress | undefined) => {
    if (address) {
      setSelectedAddress(address)
      setAddressMode("edit")
      setShowAddressForm(true)
    }
  }

  const handleContactEdit = (contact: IBankContact | undefined) => {
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
        toast.success("Address deleted successfully")
        const refreshedAddresses = await refetchAddresses()
        if (refreshedAddresses?.data?.result === 1)
          setAddresses(refreshedAddresses.data.data)
      } else {
        toast.error(response.message || "Failed to delete address")
      }
    } catch {
      toast.error("Network error while deleting address")
    }
  }

  const handleContactDelete = async (contactId: string) => {
    try {
      const response = await deleteContactMutation.mutateAsync(contactId)
      if (response.result === 1) {
        toast.success("Contact deleted successfully")
        const refreshedContacts = await refetchContacts()
        if (refreshedContacts?.data?.result === 1)
          setContacts(refreshedContacts.data.data)
      } else {
        toast.error(response.message || "Failed to delete contact")
      }
    } catch {
      toast.error("Network error while deleting contact")
    }
  }

  const handleFilterChange = (newFilters: IBankFilter) => setFilters(newFilters)

  const handleBankLookup = async (bankCode: string, bankName: string) => {
    if (!bankCode && !bankName) {
      toast.error("Please provide a bank code or name")
      return
    }

    // Reset all data before fetching new bank
    resetAllData()

    try {
      const { data: response } = await refetchBankDetails()
      if (response?.result === 1) {
        const detailedBank = Array.isArray(response.data)
          ? response.data[0] || null
          : response.data || null
        if (detailedBank?.bankId) {
          const updatedBank = {
            ...detailedBank,
            currencyId: detailedBank.currencyId || 0,
            bankId: detailedBank.bankId || 0,
          }
          setBank(updatedBank as IBank)
        } else {
          toast.error("No bank found with the provided details")
        }
      } else {
        toast.error(response?.message || "Failed to fetch bank")
      }
    } catch {
      toast.error("Network error while fetching bank")
      setBank(null)
      setAddresses([])
      setContacts([])
    }
  }

  return (
    <div className="@container flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Bank</h1>
          <p className="text-muted-foreground text-sm">
            Manage bank information, addresses, and contacts
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
            onClick={() => document.getElementById("bank-form-submit")?.click()}
            disabled={!bank}
          >
            <Save className="mr-1 h-4 w-4" />
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBankReset}
            disabled={!bank}
          >
            <RotateCcw className="mr-1 h-4 w-4" />
            Reset
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBankDelete}
            disabled={!bank}
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
            <BankForm
              key={key}
              initialData={bank || undefined}
              onSave={handleBankSave}
              onBankLookup={handleBankLookup}
            />
          </CardContent>
        </Card>

        {bank && (
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
                      key={`address-${bank?.bankId || "new"}`}
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
                      key={`contact-${bank?.bankId || "new"}`}
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
              Bank List
            </DialogTitle>
            <p className="text-muted-foreground text-sm">
              Manage and select existing banks from the list below. Use search
              to filter records or create new banks.
            </p>
          </DialogHeader>
          <BankTable
            data={banksData || []}
            isLoading={isLoadingBanks || isRefetchingBanks}
            onBankSelect={handleBankSelect}
            onFilterChange={handleFilterChange}
            onRefresh={() => refetchBanks()}
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
                ? "View bank address details."
                : "Manage bank address details."}
            </p>
          </DialogHeader>
          <Separator />
          <BankAddressForm
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
                ? "View bank contact details."
                : "Manage bank contact details."}
            </p>
          </DialogHeader>
          <Separator />
          <BankContactForm
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
