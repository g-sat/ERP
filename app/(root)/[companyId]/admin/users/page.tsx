"use client"

import { useEffect, useState } from "react"
import { IUser, IUserFilter } from "@/interfaces/admin"
import { ApiResponse } from "@/interfaces/auth"
import { UserFormValues } from "@/schemas/admin"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { User } from "@/lib/api-routes"
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

import { UserForm } from "../components/user-form"
import { UserTable } from "../components/user-table"

export default function AdminUsersPage() {
  const moduleId = ModuleId.admin
  const transactionId = AdminTransactionId.user

  const { hasPermission } = usePermissionStore()

  const canEditUser = hasPermission(moduleId, transactionId, "isEdit")
  const canDeleteUser = hasPermission(moduleId, transactionId, "isDelete")
  const canViewUser = hasPermission(moduleId, transactionId, "isRead")
  const canCreateUser = hasPermission(moduleId, transactionId, "isCreate")

  const [filters, setFilters] = useState<IUserFilter>({})

  const {
    data: usersResponse,
    refetch: refetchUsers,
    isLoading: isLoadingUsers,
    isRefetching: isRefetchingUsers,
  } = useGet<IUser>(`${User.get}`, "users", filters.search)

  const { data: usersData } = (usersResponse as ApiResponse<IUser>) ?? {
    result: 0,
    message: "",
    data: [],
  }

  const saveMutation = usePersist(`${User.add}`)
  const updateMutation = usePersist(`${User.add}`)
  const deleteMutation = useDelete(`${User.delete}`)

  const [selectedUser, setSelectedUser] = useState<IUser | undefined>(undefined)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  const queryClient = useQueryClient()

  useEffect(() => {
    if (filters.search !== undefined) {
      refetchUsers()
    }
  }, [filters.search, refetchUsers])

  const handleCreateUser = () => {
    setModalMode("create")
    setSelectedUser(undefined)
    setIsUserModalOpen(true)
  }

  const handleEditUser = (user: IUser) => {
    setModalMode("edit")
    setSelectedUser(user)
    setIsUserModalOpen(true)
  }

  const handleViewUser = (user: IUser | undefined) => {
    if (!user) return
    setModalMode("view")
    setSelectedUser(user)
    setIsUserModalOpen(true)
  }

  const handleDeleteUser = (userId: string) => {
    const userToDelete = usersData?.find((u) => u.userId.toString() === userId)
    if (!userToDelete) return
    toast.promise(deleteMutation.mutateAsync(userId), {
      loading: `Deleting ${userToDelete.userName}...`,
      success: `${userToDelete.userName} has been deleted`,
      error: `Failed to delete user`,
    })
  }

  const handleUserFormSubmit = async (data: UserFormValues) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data)
        if (response.result === 1) {
          toast.success(response.message || "User created successfully")
          queryClient.setQueryData<ApiResponse<IUser>>(["users"], (old) => {
            if (!old) return { result: 1, message: "", data: [] }
            const newData = { ...old, data: [...old.data, response.data] }
            return newData as ApiResponse<IUser>
          })
        } else {
          toast.error(response.message || "Failed to create user")
        }
      } else if (modalMode === "edit" && selectedUser) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          toast.success(response.message || "User updated successfully")
          queryClient.setQueryData<ApiResponse<IUser>>(["users"], (old) => {
            if (!old) return { result: 1, message: "", data: [] }
            const newData = {
              ...old,
              data: old.data.map((user) =>
                user.userId === selectedUser.userId ? response.data : user
              ),
            }
            return newData as ApiResponse<IUser>
          })
        } else {
          toast.error(response.message || "Failed to update user")
        }
      }
      setIsUserModalOpen(false)
    } catch (error) {
      console.error("Error in user form submission:", error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("An unexpected error occurred")
      }
    }
  }

  return (
    <div className="container mx-auto space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Users
          </h1>
          <p className="text-muted-foreground text-sm">Manage users</p>
        </div>
      </div>

      {isLoadingUsers || isRefetchingUsers ? (
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
      ) : (usersResponse as ApiResponse<IUser>)?.result === -2 ? (
        <LockSkeleton locked={true}>
          <UserTable
            data={usersData || []}
            isLoading={isLoadingUsers}
            onUserSelect={canViewUser ? handleViewUser : undefined}
            onDeleteUser={canDeleteUser ? handleDeleteUser : undefined}
            onEditUser={canEditUser ? handleEditUser : undefined}
            onCreateUser={canCreateUser ? handleCreateUser : undefined}
            onRefresh={refetchUsers}
            onFilterChange={setFilters}
            moduleId={moduleId}
            transactionId={transactionId}
          />
        </LockSkeleton>
      ) : (
        <UserTable
          data={usersData || []}
          isLoading={isLoadingUsers}
          onUserSelect={canViewUser ? handleViewUser : undefined}
          onDeleteUser={canDeleteUser ? handleDeleteUser : undefined}
          onEditUser={canEditUser ? handleEditUser : undefined}
          onCreateUser={canCreateUser ? handleCreateUser : undefined}
          onRefresh={refetchUsers}
          onFilterChange={setFilters}
          moduleId={moduleId}
          transactionId={transactionId}
        />
      )}

      <Dialog
        open={isUserModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsUserModalOpen(false)
          }
        }}
      >
        <DialogContent
          className="overflow-visible sm:max-w-2xl" // Added overflow-visible
          onPointerDownOutside={(e) => {
            e.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" && "Create User"}
              {modalMode === "edit" && "Update User"}
              {modalMode === "view" && "View User"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new user to the system database."
                : modalMode === "edit"
                  ? "Update user information in the system database."
                  : "View user details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <UserForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedUser
                : undefined
            }
            submitAction={handleUserFormSubmit}
            onCancel={() => setIsUserModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view"}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
