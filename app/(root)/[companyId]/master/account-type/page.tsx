"use client"

import { useEffect, useState } from "react"
import { IAccountType, IAccountTypeFilter } from "@/interfaces/accounttype"
import { ApiResponse } from "@/interfaces/auth"
import { AccountTypeFormValues } from "@/schemas/accounttype"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { AccountType } from "@/lib/api-routes"
import { MasterTransactionId, ModuleId } from "@/lib/utils"
import { useDelete, useGet, useGetById, usePersist } from "@/hooks/use-common"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LoadExistingDialog } from "@/components/ui-custom/master-loadexisting-dialog"

import { AccountTypeForm } from "./components/account-type-form"
import { AccountTypesTable } from "./components/account-type-table"

export default function AccountTypePage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.account_type

  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")

  // Fetch account types from the API using useGet
  const [filters, setFilters] = useState<IAccountTypeFilter>({})

  const {
    data: accountTypesResponse,
    refetch,
    isLoading,
    isRefetching,
  } = useGet<IAccountType>(`${AccountType.get}`, "accountTypes", filters.search)

  // Destructure with fallback values
  const { result: accountTypesResult, data: accountTypesData } =
    (accountTypesResponse as ApiResponse<IAccountType>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // Define mutations for CRUD operations
  const saveMutation = usePersist<AccountTypeFormValues>(`${AccountType.add}`)
  const updateMutation = usePersist<AccountTypeFormValues>(`${AccountType.add}`)
  const deleteMutation = useDelete(`${AccountType.delete}`)

  // State for modal and selected account type
  const [selectedAccountType, setSelectedAccountType] = useState<
    IAccountType | undefined
  >(undefined)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )
  // State for code availability check
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingAccountType, setExistingAccountType] =
    useState<IAccountType | null>(null)
  const [codeToCheck, setCodeToCheck] = useState<string>("")

  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    accountTypeId: string | null
    accountTypeName: string | null
  }>({
    isOpen: false,
    accountTypeId: null,
    accountTypeName: null,
  })

  // Add API call for checking code availability
  const { refetch: checkCodeAvailability } = useGetById<IAccountType>(
    `${AccountType.getByCode}`,
    "accountTypeByCode",

    codeToCheck
  )

  // Handler to Re-fetches data when called
  const handleRefresh = () => {
    refetch()
  }

  // Handler to open modal for creating a new account type
  const handleCreateAccountType = () => {
    setModalMode("create")
    setSelectedAccountType(undefined)
    setIsModalOpen(true)
  }

  // Handler to open modal for editing an account type
  const handleEditAccountType = (accountType: IAccountType) => {
    console.log("Edit Account Type:", accountType)
    setModalMode("edit")
    setSelectedAccountType(accountType)
    setIsModalOpen(true)
  }

  // Handler to open modal for viewing an account type
  const handleViewAccountType = (accountType: IAccountType | undefined) => {
    if (!accountType) return
    setModalMode("view")
    setSelectedAccountType(accountType)
    setIsModalOpen(true)
  }

  // Handler for form submission (create or edit)
  const handleFormSubmit = async (data: AccountTypeFormValues) => {
    try {
      if (modalMode === "create") {
        // Create a new account type using the save mutation with toast feedback
        const response = (await saveMutation.mutateAsync(
          data
        )) as ApiResponse<IAccountType>

        if (response.result === 1) {
          toast.success("Account Type created successfully")
          queryClient.invalidateQueries({ queryKey: ["accountTypes"] }) // Triggers refetch
          setIsModalOpen(false)
        } else {
          toast.error(response.message || "Failed to create account type")
        }
      } else if (modalMode === "edit" && selectedAccountType) {
        // Update the selected account type using the update mutation with toast feedback
        const response = (await updateMutation.mutateAsync(
          data
        )) as ApiResponse<IAccountType>

        if (response.result === 1) {
          toast.success("Account Type updated successfully")
          queryClient.invalidateQueries({ queryKey: ["accountTypes"] }) // Triggers refetch
          setIsModalOpen(false)
        } else {
          toast.error(response.message || "Failed to update account type")
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error)
      // Handle API error response
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("An unexpected error occurred")
      }
    }
  }

  // Handler for deleting an account type
  const handleDeleteAccountType = (accountTypeId: string) => {
    const accountTypeToDelete = accountTypesData?.find(
      (at) => at.accTypeId.toString() === accountTypeId
    )
    if (!accountTypeToDelete) return

    // Open delete confirmation dialog with account type details
    setDeleteConfirmation({
      isOpen: true,
      accountTypeId,
      accountTypeName: accountTypeToDelete.accTypeName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.accountTypeId) {
      toast.promise(
        deleteMutation.mutateAsync(deleteConfirmation.accountTypeId),
        {
          loading: `Deleting ${deleteConfirmation.accountTypeName}...`,
          success: () => {
            queryClient.invalidateQueries({ queryKey: ["accountTypes"] }) // Triggers refetch
            return `${deleteConfirmation.accountTypeName} has been deleted`
          },
          error: "Failed to delete account type",
        }
      )
      setDeleteConfirmation({
        isOpen: false,
        accountTypeId: null,
        accountTypeName: null,
      })
    }
  }

  // Handler for code availability check
  const handleCodeBlur = async (code: string) => {
    // Skip if:
    // 1. In edit mode
    // 2. In read-only mode
    if (modalMode === "edit" || modalMode === "view") return

    const trimmedCode = code?.trim()
    if (!trimmedCode) return

    setCodeToCheck(trimmedCode)
    try {
      const response = await checkCodeAvailability()
      console.log("Full API Response:", response)

      // Check if response has data and it's not empty
      if (response?.data?.result === 1 && response.data.data) {
        console.log("Response data:", response.data.data)

        // Handle both array and single object responses
        const accountTypeData = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data

        console.log("Processed accountTypeData:", accountTypeData)

        if (accountTypeData) {
          // Ensure all required fields are present
          const validAccountTypeData: IAccountType = {
            accTypeId: accountTypeData.accTypeId,
            accTypeCode: accountTypeData.accTypeCode,
            accTypeName: accountTypeData.accTypeName,
            seqNo: accountTypeData.seqNo,
            accGroupName: accountTypeData.accGroupName || "",
            remarks: accountTypeData.remarks || "",
            isActive: accountTypeData.isActive ?? true,
            companyId: accountTypeData.companyId,
            createBy: accountTypeData.createBy,
            editBy: accountTypeData.editBy,
            createDate: accountTypeData.createDate,
            editDate: accountTypeData.editDate,
          }

          console.log("Setting existing account type:", validAccountTypeData)
          setExistingAccountType(validAccountTypeData)
          setShowLoadDialog(true)
        }
      }
    } catch (error) {
      console.error("Error checking code availability:", error)
    }
  }

  // Handler for loading existing account type
  const handleLoadExistingAccountType = () => {
    if (existingAccountType) {
      // Log the data we're about to set
      console.log("About to load account type data:", {
        existingAccountType,
        currentModalMode: modalMode,
        currentSelectedAccountType: selectedAccountType,
      })

      // Set the states
      setModalMode("edit")
      setSelectedAccountType(existingAccountType)
      setShowLoadDialog(false)
      setExistingAccountType(null)
    }
  }

  const queryClient = useQueryClient()

  // Add useEffect hooks to track state changes
  useEffect(() => {
    console.log("Modal Mode Updated:", modalMode)
  }, [modalMode])

  useEffect(() => {
    if (selectedAccountType) {
      console.log("Selected Account Type Updated:", {
        accTypeId: selectedAccountType.accTypeId,
        accTypeCode: selectedAccountType.accTypeCode,
        accTypeName: selectedAccountType.accTypeName,
        // Log all other relevant fields
        fullObject: selectedAccountType,
      })
    }
  }, [selectedAccountType])

  return (
    <div className="@container flex flex-1 flex-col gap-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 @md/main:flex-row @md/main:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Account Types</h1>
          <p className="text-muted-foreground text-sm">
            Manage account type information and settings
          </p>
        </div>
      </div>

      {/* Account Types Table */}
      {isLoading || isRefetching ? (
        <DataTableSkeleton
          columnCount={7}
          filterCount={2}
          cellWidths={[
            "10rem",
            "30rem",
            "10rem",
            "10rem",
            "6rem",
            "6rem",
            "6rem",
          ]}
          shrinkZero
        />
      ) : accountTypesResult ? (
        <AccountTypesTable
          data={accountTypesData || []}
          onAccountTypeSelect={handleViewAccountType}
          onDeleteAccountType={canDelete ? handleDeleteAccountType : undefined}
          onEditAccountType={canEdit ? handleEditAccountType : undefined}
          onCreateAccountType={handleCreateAccountType}
          onRefresh={() => {
            handleRefresh()
            toast("Refreshing data...Fetching the latest account type data.")
          }}
          onFilterChange={setFilters}
          moduleId={moduleId}
          transactionId={transactionId}
        />
      ) : (
        <div>No data available</div>
      )}

      {/* Modal for Create, Edit, and View */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsModalOpen(false)
          }
        }}
      >
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => {
            e.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" && "Create Account Type"}
              {modalMode === "edit" && "Update Account Type"}
              {modalMode === "view" && "View Account Type"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new account type to the system database."
                : modalMode === "edit"
                  ? "Update account type information in the system database."
                  : "View account type details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <AccountTypeForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedAccountType
                : undefined
            }
            submitAction={handleFormSubmit}
            onCancel={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Load Existing Account Type Dialog */}
      <LoadExistingDialog
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingAccountType}
        onCancel={() => setExistingAccountType(null)}
        code={existingAccountType?.accTypeCode}
        name={existingAccountType?.accTypeName}
        typeLabel="Account Type"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete Account Type"
        description="This action cannot be undone. This will permanently delete the account type from our servers."
        itemName={deleteConfirmation.accountTypeName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            accountTypeId: null,
            accountTypeName: null,
          })
        }
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}
