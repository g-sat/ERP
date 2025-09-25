"use client"

import { useCallback, useState } from "react"
import { IUserGroup, IUserGroupFilter } from "@/interfaces/admin"
import { ApiResponse } from "@/interfaces/auth"
import { UserGroupFormValues } from "@/schemas/admin"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { UserGroup } from "@/lib/api-routes"
import { AdminTransactionId, ModuleId } from "@/lib/utils"
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
import { SaveConfirmation } from "@/components/confirmation/save-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"

import { UserGroupForm } from "../components/user-group-form"
import { UserGroupTable } from "../components/user-group-table"

export default function AdminUserGroupsPage() {
  const moduleId = ModuleId.admin
  const transactionIdGroup = AdminTransactionId.userGroup

  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionIdGroup, "isEdit")
  const canDelete = hasPermission(moduleId, transactionIdGroup, "isDelete")
  const canView = hasPermission(moduleId, transactionIdGroup, "isRead")
  const canCreate = hasPermission(moduleId, transactionIdGroup, "isCreate")

  const [groupFilters, setGroupFilters] = useState<IUserGroupFilter>({})

  const {
    data: userGroupsResponse,
    refetch: refetchUserGroups,
    isLoading: isLoadingUserGroups,
  } = useGet<IUserGroup>(`${UserGroup.get}`, "usergroups", groupFilters.search)

  const { data: userGroupsData } =
    (userGroupsResponse as ApiResponse<IUserGroup>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  const saveGroupMutation = usePersist(`${UserGroup.add}`)
  const updateGroupMutation = usePersist(`${UserGroup.add}`)
  const deleteGroupMutation = useDelete(`${UserGroup.delete}`)

  const [selectedUserGroup, setSelectedUserGroup] = useState<
    IUserGroup | undefined
  >(undefined)
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    groupId: string | null
    groupName: string | null
  }>({
    isOpen: false,
    groupId: null,
    groupName: null,
  })

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: UserGroupFormValues | null
  }>({
    isOpen: false,
    data: null,
  })

  const queryClient = useQueryClient()

  const handleFilterChange = useCallback(
    (filters: { search?: string; sortOrder?: string }) => {
      console.log("Filter change called with:", filters)
      setGroupFilters(filters as IUserGroupFilter)
    },
    []
  )

  const handleCreateUserGroup = () => {
    setModalMode("create")
    setSelectedUserGroup(undefined)
    setIsGroupModalOpen(true)
  }

  const handleEditUserGroup = (group: IUserGroup) => {
    setModalMode("edit")
    setSelectedUserGroup(group)
    setIsGroupModalOpen(true)
  }

  const handleViewUserGroup = (group: IUserGroup | null) => {
    if (!group) return
    setModalMode("view")
    setSelectedUserGroup(group)
    setIsGroupModalOpen(true)
  }

  const handleDeleteUserGroup = (groupId: string) => {
    const groupToDelete = userGroupsData?.find(
      (g) => g.userGroupId.toString() === groupId
    )
    if (!groupToDelete) return

    // Open delete confirmation dialog with group details
    setDeleteConfirmation({
      isOpen: true,
      groupId,
      groupName: groupToDelete.userGroupName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.groupId) {
      deleteGroupMutation.mutateAsync(deleteConfirmation.groupId).then(() => {
        // Invalidate and refetch the usergroups query after successful deletion
        queryClient.invalidateQueries({ queryKey: ["usergroups"] })
      })
      setDeleteConfirmation({
        isOpen: false,
        groupId: null,
        groupName: null,
      })
    }
  }

  const handleUserGroupFormSubmit = async (data: UserGroupFormValues) => {
    try {
      if (modalMode === "create") {
        const response = await saveGroupMutation.mutateAsync(data)
        if (response.result === 1) {
          // Invalidate and refetch the usergroups query
          queryClient.invalidateQueries({ queryKey: ["usergroups"] })
        }
      } else if (modalMode === "edit" && selectedUserGroup) {
        const response = await updateGroupMutation.mutateAsync(data)
        if (response.result === 1) {
          // Invalidate and refetch the usergroups query
          queryClient.invalidateQueries({ queryKey: ["usergroups"] })
        }
      }
      setIsGroupModalOpen(false)
    } catch (error) {
      console.error("Error in user group form submission:", error)
    }
  }

  const handleSaveConfirmation = (data: UserGroupFormValues) => {
    setSaveConfirmation({
      isOpen: true,
      data,
    })
  }

  const handleConfirmedFormSubmit = async (data: UserGroupFormValues) => {
    try {
      if (modalMode === "create") {
        const response = await saveGroupMutation.mutateAsync(data)
        if (response.result === 1) {
          // Invalidate and refetch the usergroups query
          queryClient.invalidateQueries({ queryKey: ["usergroups"] })
        }
      } else if (modalMode === "edit" && selectedUserGroup) {
        const response = await updateGroupMutation.mutateAsync(data)
        if (response.result === 1) {
          // Invalidate and refetch the usergroups query
          queryClient.invalidateQueries({ queryKey: ["usergroups"] })
        }
      }
      setIsGroupModalOpen(false)
    } catch (error) {
      console.error("Error in user group form submission:", error)
    }
  }

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            User Groups
          </h1>
          <p className="text-muted-foreground text-sm">Manage user groups</p>
        </div>
      </div>

      {isLoadingUserGroups ? (
        <DataTableSkeleton
          columnCount={8}
          filterCount={2}
          cellWidths={[
            "10rem",
            "30rem",
            "10rem",
            "10rem",
            "10rem",
            "10rem",
            "6rem",
            "6rem",
          ]}
          shrinkZero
        />
      ) : (userGroupsResponse as ApiResponse<IUserGroup>)?.result === -2 ? (
        <LockSkeleton locked={true}>
          <UserGroupTable
            data={[]}
            isLoading={false}
            onSelect={canView ? handleViewUserGroup : undefined}
            onDelete={canDelete ? handleDeleteUserGroup : undefined}
            onEdit={canEdit ? handleEditUserGroup : undefined}
            onCreate={canCreate ? handleCreateUserGroup : undefined}
            onRefresh={refetchUserGroups}
            onFilterChange={handleFilterChange}
            moduleId={moduleId}
            transactionId={transactionIdGroup}
            canEdit={canEdit}
            canDelete={canDelete}
            canView={canView}
            canCreate={canCreate}
          />
        </LockSkeleton>
      ) : (
        <UserGroupTable
          data={groupFilters.search ? [] : userGroupsData || []}
          isLoading={isLoadingUserGroups}
          onSelect={canView ? handleViewUserGroup : undefined}
          onDelete={canDelete ? handleDeleteUserGroup : undefined}
          onEdit={canEdit ? handleEditUserGroup : undefined}
          onCreate={canCreate ? handleCreateUserGroup : undefined}
          onRefresh={refetchUserGroups}
          onFilterChange={handleFilterChange}
          moduleId={moduleId}
          transactionId={transactionIdGroup}
          canEdit={canEdit}
          canDelete={canDelete}
          canView={canView}
          canCreate={canCreate}
        />
      )}

      <Dialog
        open={isGroupModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsGroupModalOpen(false)
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
              {modalMode === "create" && "Create User Group"}
              {modalMode === "edit" && "Update User Group"}
              {modalMode === "view" && "View User Group"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new user group to the system database."
                : modalMode === "edit"
                  ? "Update user group information in the system database."
                  : "View user group details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <UserGroupForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedUserGroup
                : undefined
            }
            submitAction={handleUserGroupFormSubmit}
            onCancel={() => setIsGroupModalOpen(false)}
            isSubmitting={
              saveGroupMutation.isPending || updateGroupMutation.isPending
            }
            isReadOnly={modalMode === "view"}
            onSaveConfirmation={handleSaveConfirmation}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete Account Type"
        description="This action cannot be undone. This will permanently delete the account type from our servers."
        itemName={deleteConfirmation.groupName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            groupId: null,
            groupName: null,
          })
        }
        isDeleting={deleteGroupMutation.isPending}
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
        itemName={saveConfirmation.data?.userGroupName || ""}
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
        isSaving={saveGroupMutation.isPending || updateGroupMutation.isPending}
      />
    </div>
  )
}
