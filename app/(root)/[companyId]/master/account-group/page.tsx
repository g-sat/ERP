"use client"

import { useCallback, useState } from "react"
import { IAccountGroup, IAccountGroupFilter } from "@/interfaces/accountgroup"
import { ApiResponse } from "@/interfaces/auth"
import { AccountGroupFormValues } from "@/schemas/accountgroup"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { AccountGroup } from "@/lib/api-routes"
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
import { LoadConfirmation } from "@/components/load-confirmation"
import { SaveConfirmation } from "@/components/save-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"

import { AccountGroupForm } from "./components/account-group-form"
import { AccountGroupTable } from "./components/account-group-table"

export default function AccountGroupPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.accountGroup

  const { hasPermission } = usePermissionStore()

  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  // Fetch account groups from the API using useGet
  const [filters, setFilters] = useState<IAccountGroupFilter>({})

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      console.log("Filter change called with:", newFilters)
      setFilters(newFilters as IAccountGroupFilter)
    },
    []
  )

  const {
    data: accountGroupsResponse,
    refetch,
    isLoading,
  } = useGet<IAccountGroup>(
    `${AccountGroup.get}`,
    "accountGroups",
    filters.search
  )

  // Destructure with fallback values
  const { result: accountGroupsResult, data: accountGroupsData } =
    (accountGroupsResponse as ApiResponse<IAccountGroup>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // Define mutations for CRUD operations
  const saveMutation = usePersist<AccountGroupFormValues>(`${AccountGroup.add}`)
  const updateMutation = usePersist<AccountGroupFormValues>(
    `${AccountGroup.add}`
  )
  const deleteMutation = useDelete(`${AccountGroup.delete}`)

  // State for modal and selected account group
  const [selectedAccountGroup, setSelectedAccountGroup] = useState<
    IAccountGroup | undefined
  >(undefined)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )
  // State for code availability check
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingAccountGroup, setExistingAccountGroup] =
    useState<IAccountGroup | null>(null)
  const [codeToCheck, setCodeToCheck] = useState<string>("")

  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    accountGroupId: string | null
    accountGroupName: string | null
  }>({
    isOpen: false,
    accountGroupId: null,
    accountGroupName: null,
  })

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: AccountGroupFormValues | null
  }>({
    isOpen: false,
    data: null,
  })

  // Add API call for checking code availability
  const { refetch: checkCodeAvailability } = useGetById<IAccountGroup>(
    `${AccountGroup.getByCode}`,
    "accountGroupByCode",
    codeToCheck
  )

  // Handler to Re-fetches data when called
  const handleRefresh = () => {
    refetch()
  }

  // Handler to open modal for creating a new account group
  const handleCreateAccountGroup = () => {
    setModalMode("create")
    setSelectedAccountGroup(undefined)
    setIsModalOpen(true)
  }

  // Handler to open modal for editing an account group
  const handleEditAccountGroup = (accountGroup: IAccountGroup) => {
    console.log("Edit Account Group:", accountGroup)
    setModalMode("edit")
    setSelectedAccountGroup(accountGroup)
    setIsModalOpen(true)
  }

  // Handler to open modal for viewing an account group
  const handleViewAccountGroup = (accountGroup: IAccountGroup | null) => {
    if (!accountGroup) return
    setModalMode("view")
    setSelectedAccountGroup(accountGroup)
    setIsModalOpen(true)
  }

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmit = (data: AccountGroupFormValues) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: AccountGroupFormValues) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data)
        if (response.result === 1) {
          // Invalidate and refetch the accountGroups query
          queryClient.invalidateQueries({ queryKey: ["accountGroups"] })
        }
      } else if (modalMode === "edit" && selectedAccountGroup) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          // Invalidate and refetch the accountGroups query
          queryClient.invalidateQueries({ queryKey: ["accountGroups"] })
        }
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  // Handler for deleting an account group
  const handleDeleteAccountGroup = (accountGroupId: string) => {
    const accountGroupToDelete = accountGroupsData?.find(
      (ag) => ag.accGroupId.toString() === accountGroupId
    )
    if (!accountGroupToDelete) return

    // Open delete confirmation dialog with account group details
    setDeleteConfirmation({
      isOpen: true,
      accountGroupId,
      accountGroupName: accountGroupToDelete.accGroupName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.accountGroupId) {
      deleteMutation.mutateAsync(deleteConfirmation.accountGroupId).then(() => {
        // Invalidate and refetch the accountGroups query after successful deletion
        queryClient.invalidateQueries({ queryKey: ["accountGroups"] })
      })
      setDeleteConfirmation({
        isOpen: false,
        accountGroupId: null,
        accountGroupName: null,
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
        const accountGroupData = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data

        console.log("Processed accountGroupData:", accountGroupData)

        if (accountGroupData) {
          // Ensure all required fields are present
          const validAccountGroupData: IAccountGroup = {
            accGroupId: accountGroupData.accGroupId,
            accGroupCode: accountGroupData.accGroupCode,
            accGroupName: accountGroupData.accGroupName,
            seqNo: accountGroupData.seqNo,
            remarks: accountGroupData.remarks || "",
            isActive: accountGroupData.isActive ?? true,
            companyId: accountGroupData.companyId,
            createBy: accountGroupData.createBy,
            editBy: accountGroupData.editBy,
            createDate: accountGroupData.createDate,
            editDate: accountGroupData.editDate,
          }

          console.log("Setting existing account group:", validAccountGroupData)
          setExistingAccountGroup(validAccountGroupData)
          setShowLoadDialog(true)
        }
      }
    } catch (error) {
      console.error("Error checking code availability:", error)
    }
  }

  // Handler for loading existing account group
  const handleLoadExistingAccountGroup = () => {
    if (existingAccountGroup) {
      // Log the data we're about to set
      console.log("About to load account group data:", {
        existingAccountGroup,
        currentModalMode: modalMode,
        currentSelectedAccountGroup: selectedAccountGroup,
      })

      // Set the states
      setModalMode("edit")
      setSelectedAccountGroup(existingAccountGroup)
      setShowLoadDialog(false)
      setExistingAccountGroup(null)
    }
  }

  const queryClient = useQueryClient()

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Account Groups
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage account group information and settings
          </p>
        </div>
      </div>

      {/* Account Groups Table */}
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
      ) : accountGroupsResult === -2 ? (
        <LockSkeleton locked={true}>
          <AccountGroupTable
            data={[]}
            isLoading={false}
            onSelect={canView ? handleViewAccountGroup : undefined}
            onDelete={canDelete ? handleDeleteAccountGroup : undefined}
            onEdit={canEdit ? handleEditAccountGroup : undefined}
            onCreate={canCreate ? handleCreateAccountGroup : undefined}
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
        </LockSkeleton>
      ) : (
        <AccountGroupTable
          data={filters.search ? [] : accountGroupsData || []}
          isLoading={isLoading}
          onSelect={canView ? handleViewAccountGroup : undefined}
          onDelete={canDelete ? handleDeleteAccountGroup : undefined}
          onEdit={canEdit ? handleEditAccountGroup : undefined}
          onCreate={canCreate ? handleCreateAccountGroup : undefined}
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
              {modalMode === "create" && "Create Account Group"}
              {modalMode === "edit" && "Update Account Group"}
              {modalMode === "view" && "View Account Group"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new account group to the system database."
                : modalMode === "edit"
                  ? "Update account group information in the system database."
                  : "View account group details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <AccountGroupForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedAccountGroup
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

      {/* Load Existing Account Group Dialog */}
      <LoadConfirmation
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingAccountGroup}
        onCancel={() => setExistingAccountGroup(null)}
        code={existingAccountGroup?.accGroupCode}
        name={existingAccountGroup?.accGroupName}
        typeLabel="Account Group"
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
        itemName={deleteConfirmation.accountGroupName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            accountGroupId: null,
            accountGroupName: null,
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
          modalMode === "create"
            ? "Create Account Group"
            : "Update Account Group"
        }
        itemName={saveConfirmation.data?.accGroupName || ""}
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
