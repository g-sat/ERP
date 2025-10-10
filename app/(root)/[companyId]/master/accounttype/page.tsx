"use client"

import { useCallback, useState } from "react"
import { IAccountType, IAccountTypeFilter } from "@/interfaces/accounttype"
import { ApiResponse } from "@/interfaces/auth"
import { AccountTypeSchemaType } from "@/schemas/accounttype"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { getById } from "@/lib/api-client"
import { AccountType } from "@/lib/api-routes"
import { MasterTransactionId, ModuleId } from "@/lib/utils"
import { useDelete, useGet, usePersist } from "@/hooks/use-common"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { DeleteConfirmation } from "@/components/confirmation/delete-confirmation"
import { LoadConfirmation } from "@/components/confirmation/load-confirmation"
import { SaveConfirmation } from "@/components/confirmation/save-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"

import { AccountTypeForm } from "./components/account-type-form"
import { AccountTypesTable } from "./components/account-type-table"

export default function AccountTypePage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.accountType

  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  const queryClient = useQueryClient()

  // Fetch account types from the API using useGet
  const [filters, setFilters] = useState<IAccountTypeFilter>({})

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setFilters(newFilters as IAccountTypeFilter)
    },
    []
  )

  const {
    data: accountTypesResponse,
    refetch,
    isLoading,
  } = useGet<IAccountType>(`${AccountType.get}`, "accountTypes", filters.search)

  // Destructure with fallback values
  const { result: accountTypesResult, data: accountTypesData } =
    (accountTypesResponse as ApiResponse<IAccountType>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // Define mutations for CRUD operations
  const saveMutation = usePersist<AccountTypeSchemaType>(`${AccountType.add}`)
  const updateMutation = usePersist<AccountTypeSchemaType>(`${AccountType.add}`)
  const deleteMutation = useDelete(`${AccountType.delete}`)

  // State for modal and selected account type
  const [selectedAccountType, setSelectedAccountType] =
    useState<IAccountType | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )
  // State for code availability check
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingAccountType, setExistingAccountType] =
    useState<IAccountType | null>(null)

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

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: AccountTypeSchemaType | null
  }>({
    isOpen: false,
    data: null,
  })

  // Handler to Re-fetches data when called
  const handleRefresh = () => {
    refetch()
  }

  // Handler to open modal for creating a new account type
  const handleCreateAccountType = () => {
    setModalMode("create")
    setSelectedAccountType(null)
    setIsModalOpen(true)
  }

  // Handler to open modal for editing an account type
  const handleEditAccountType = (accountType: IAccountType) => {
    setModalMode("edit")
    setSelectedAccountType(accountType)
    setIsModalOpen(true)
  }

  // Handler to open modal for viewing an account type
  const handleViewAccountType = (accountType: IAccountType | null) => {
    if (!accountType) return
    setModalMode("view")
    setSelectedAccountType(accountType)
    setIsModalOpen(true)
  }

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmit = (data: AccountTypeSchemaType) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: AccountTypeSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["accountTypes"] })
        }
      } else if (modalMode === "edit" && selectedAccountType) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["accountTypes"] })
        }
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error in form submission:", error)
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
      deleteMutation.mutateAsync(deleteConfirmation.accountTypeId).then(() => {
        queryClient.invalidateQueries({ queryKey: ["accountTypes"] })
      })
      setDeleteConfirmation({
        isOpen: false,
        accountTypeId: null,
        accountTypeName: null,
      })
    }
  }

  // Handler for code availability check
  const handleCodeBlur = useCallback(
    async (code: string) => {
      // Skip if:
      // 1. In edit mode
      // 2. In read-only mode
      if (modalMode === "edit" || modalMode === "view") return

      const trimmedCode = code?.trim()
      if (!trimmedCode) return

      try {
        const response = await getById(
          `${AccountType.getByCode}/${trimmedCode}`
        )
                // Check if response has data and it's not empty
        if (response?.result === 1 && response.data) {
                    // Handle both array and single object responses
          const accountTypeData = Array.isArray(response.data)
            ? response.data[0]
            : response.data

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
            setExistingAccountType(validAccountTypeData)
            setShowLoadDialog(true)
          }
        }
      } catch (error) {
        console.error("Error checking code availability:", error)
      }
    },
    [modalMode]
  )

  // Handler for loading existing account type
  const handleLoadExistingAccountType = () => {
    if (existingAccountType) {
      // Log the data we're about to set
      // Set the states
      setModalMode("edit")
      setSelectedAccountType(existingAccountType)
      setShowLoadDialog(false)
      setExistingAccountType(null)
    }
  }

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Account Types
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage account type information and settings
          </p>
        </div>
      </div>

      {/* Account Types Table */}
      {isLoading ? (
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
      ) : accountTypesResult === -2 ||
        (!canView && !canEdit && !canDelete && !canCreate) ? (
        <LockSkeleton locked={true}>
          <AccountTypesTable
            data={[]}
            isLoading={false}
            onSelect={() => {}}
            onDelete={() => {}}
            onEdit={() => {}}
            onCreate={() => {}}
            onRefresh={() => {}}
            onFilterChange={() => {}}
            moduleId={moduleId}
            transactionId={transactionId}
            canView={false}
            canCreate={false}
            canEdit={false}
            canDelete={false}
          />
        </LockSkeleton>
      ) : (
        <AccountTypesTable
          data={filters.search ? [] : accountTypesData || []}
          isLoading={isLoading}
          onSelect={canView ? handleViewAccountType : undefined}
          onDelete={canDelete ? handleDeleteAccountType : undefined}
          onEdit={canEdit ? handleEditAccountType : undefined}
          onCreate={canCreate ? handleCreateAccountType : undefined}
          onRefresh={handleRefresh}
          onFilterChange={handleFilterChange}
          moduleId={moduleId}
          transactionId={transactionId}
          // Pass permissions to table
          canEdit={canEdit}
          canDelete={canDelete}
          canView={canView}
          canCreate={canCreate}
        />
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
                ? selectedAccountType || undefined
                : undefined
            }
            submitAction={handleFormSubmit}
            onCancelAction={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Load Existing Account Type Dialog */}
      <LoadConfirmation
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

      {/* Save Confirmation Dialog */}
      <SaveConfirmation
        open={saveConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setSaveConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title={
          modalMode === "create" ? "Create Account Type" : "Update Account Type"
        }
        itemName={saveConfirmation.data?.accTypeName || ""}
        operationType={modalMode === "create" ? "create" : "update"}
        onConfirm={() => {
          if (saveConfirmation.data) {
            handleConfirmedFormSubmit(saveConfirmation.data)
          }
          setSaveConfirmation({
            isOpen: false,
            data: null,
          })
        }}
        onCancel={() =>
          setSaveConfirmation({
            isOpen: false,
            data: null,
          })
        }
        isSaving={saveMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}
