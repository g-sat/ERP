"use client"

import { useEffect, useState } from "react"
import { IUserRole, IUserRoleFilter } from "@/interfaces/admin"
import { ApiResponse } from "@/interfaces/auth"
import { UserRoleFormValues } from "@/schemas/admin"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { UserRole } from "@/lib/api-routes"
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
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"

import { UserRoleForm } from "../components/user-role-form"
import { UserRoleTable } from "../components/user-role-table"

export default function AdminUserRolesPage() {
  const moduleId = ModuleId.admin
  const transactionIdRole = AdminTransactionId.userroles

  const { hasPermission } = usePermissionStore()

  const canEditUserRole = hasPermission(moduleId, transactionIdRole, "isEdit")
  const canDeleteUserRole = hasPermission(
    moduleId,
    transactionIdRole,
    "isDelete"
  )
  const canViewUserRole = hasPermission(moduleId, transactionIdRole, "isRead")
  const canCreateUserRole = hasPermission(
    moduleId,
    transactionIdRole,
    "isCreate"
  )

  const [roleFilters, setRoleFilters] = useState<IUserRoleFilter>({})

  const {
    data: userRolesResponse,
    refetch: refetchUserRoles,
    isLoading: isLoadingUserRoles,
  } = useGet<IUserRole>(`${UserRole.get}`, "userroles", roleFilters.search)

  const { data: userRolesData } =
    (userRolesResponse as ApiResponse<IUserRole>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  const saveRoleMutation = usePersist(`${UserRole.add}`)
  const updateRoleMutation = usePersist(`${UserRole.add}`)
  const deleteRoleMutation = useDelete(`${UserRole.delete}`)

  const [selectedUserRole, setSelectedUserRole] = useState<
    IUserRole | undefined
  >(undefined)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  const queryClient = useQueryClient()

  useEffect(() => {
    if (roleFilters.search !== undefined) {
      refetchUserRoles()
    }
  }, [roleFilters.search, refetchUserRoles])

  const handleCreateUserRole = () => {
    setModalMode("create")
    setSelectedUserRole(undefined)
    setIsRoleModalOpen(true)
  }

  const handleEditUserRole = (role: IUserRole) => {
    setModalMode("edit")
    setSelectedUserRole(role)
    setIsRoleModalOpen(true)
  }

  const handleViewUserRole = (role: IUserRole | undefined) => {
    if (!role) return
    setModalMode("view")
    setSelectedUserRole(role)
    setIsRoleModalOpen(true)
  }

  const handleDeleteUserRole = (roleId: string) => {
    const roleToDelete = userRolesData?.find(
      (r) => r.userRoleId.toString() === roleId
    )
    if (!roleToDelete) return
    deleteRoleMutation.mutateAsync(roleId).then(() => {
      // Invalidate and refetch the userroles query after successful deletion
      queryClient.invalidateQueries({ queryKey: ["userroles"] })
    })
  }

  const handleUserRoleFormSubmit = async (data: UserRoleFormValues) => {
    try {
      if (modalMode === "create") {
        const response = await saveRoleMutation.mutateAsync(data)
        if (response.result === 1) {
          // Invalidate and refetch the userroles query
          queryClient.invalidateQueries({ queryKey: ["userroles"] })
        }
      } else if (modalMode === "edit" && selectedUserRole) {
        const response = await updateRoleMutation.mutateAsync(data)
        if (response.result === 1) {
          // Invalidate and refetch the userroles query
          queryClient.invalidateQueries({ queryKey: ["userroles"] })
        }
      }
      setIsRoleModalOpen(false)
    } catch (error) {
      console.error("Error in user role form submission:", error)
    }
  }

  return (
    <div className="container mx-auto space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            User Roles
          </h1>
          <p className="text-muted-foreground text-sm">Manage user roles</p>
        </div>
      </div>

      {isLoadingUserRoles ? (
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
      ) : (userRolesResponse as ApiResponse<IUserRole>)?.result === -2 ? (
        <LockSkeleton locked={true}>
          <UserRoleTable
            data={userRolesData || []}
            isLoading={isLoadingUserRoles}
            onUserRoleSelect={canViewUserRole ? handleViewUserRole : undefined}
            onDeleteUserRole={
              canDeleteUserRole ? handleDeleteUserRole : undefined
            }
            onEditUserRole={canEditUserRole ? handleEditUserRole : undefined}
            onCreateUserRole={
              canCreateUserRole ? handleCreateUserRole : undefined
            }
            onRefresh={refetchUserRoles}
            onFilterChange={setRoleFilters}
            moduleId={moduleId}
            transactionId={transactionIdRole}
          />
        </LockSkeleton>
      ) : (
        <UserRoleTable
          data={userRolesData || []}
          isLoading={isLoadingUserRoles}
          onUserRoleSelect={canViewUserRole ? handleViewUserRole : undefined}
          onDeleteUserRole={
            canDeleteUserRole ? handleDeleteUserRole : undefined
          }
          onEditUserRole={canEditUserRole ? handleEditUserRole : undefined}
          onCreateUserRole={
            canCreateUserRole ? handleCreateUserRole : undefined
          }
          onRefresh={refetchUserRoles}
          onFilterChange={setRoleFilters}
          moduleId={moduleId}
          transactionId={transactionIdRole}
        />
      )}

      <Dialog
        open={isRoleModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsRoleModalOpen(false)
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
              {modalMode === "create" && "Create User Role"}
              {modalMode === "edit" && "Update User Role"}
              {modalMode === "view" && "View User Role"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new user role to the system database."
                : modalMode === "edit"
                  ? "Update user role information in the system database."
                  : "View user role details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <UserRoleForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedUserRole
                : undefined
            }
            submitAction={handleUserRoleFormSubmit}
            onCancel={() => setIsRoleModalOpen(false)}
            isSubmitting={
              saveRoleMutation.isPending || updateRoleMutation.isPending
            }
            isReadOnly={modalMode === "view"}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
