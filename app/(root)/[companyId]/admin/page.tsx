"use client"

import { useEffect, useState } from "react"
import {
  IUser,
  IUserFilter,
  IUserGroup,
  IUserGroupFilter,
  IUserRole,
  IUserRoleFilter,
} from "@/interfaces/admin"
import { ApiResponse } from "@/interfaces/auth"
import {
  UserFormValues,
  UserGroupFormValues,
  UserRoleFormValues,
} from "@/schemas/admin"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { User, UserGroup, UserRole } from "@/lib/api-routes"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"

import { NotificationPreferencesTable } from "./components/notification-preferences-table"
import { ShareDataTable } from "./components/sharedata-table"
import { UserForm } from "./components/user-form"
import { UserGroupForm } from "./components/user-group-form"
import { UserGroupTable } from "./components/user-group-table"
import { UserRoleForm } from "./components/user-role-form"
import { UserRoleTable } from "./components/user-role-table"
import { UserTable } from "./components/user-table"
import { UserGroupReportRightsTable } from "./components/usergroupreportrights-table"
import { UserGroupRightsTable } from "./components/usergrouprights-table"
import { UserRightsTable } from "./components/userrights-table"
import { UserWiseRightsTable } from "./components/userwiserights-table"

export default function AdminPage() {
  const moduleId = ModuleId.admin
  const transactionId = AdminTransactionId.user
  const transactionIdGroup = AdminTransactionId.user_group
  const transactionIdRole = AdminTransactionId.user_role

  const { hasPermission } = usePermissionStore()

  const canEditUser = hasPermission(moduleId, transactionId, "isEdit")
  const canDeleteUser = hasPermission(moduleId, transactionId, "isDelete")
  const canEditUserGroup = hasPermission(moduleId, transactionIdGroup, "isEdit")
  const canDeleteUserGroup = hasPermission(
    moduleId,
    transactionIdGroup,
    "isDelete"
  )
  const canEditUserRole = hasPermission(moduleId, transactionIdRole, "isEdit")
  const canDeleteUserRole = hasPermission(
    moduleId,
    transactionIdRole,
    "isDelete"
  )
  const canViewUser = hasPermission(moduleId, transactionId, "isRead")
  const canViewUserGroup = hasPermission(moduleId, transactionIdGroup, "isRead")
  const canViewUserRole = hasPermission(moduleId, transactionIdRole, "isRead")
  const canCreateUser = hasPermission(moduleId, transactionId, "isCreate")
  const canCreateUserGroup = hasPermission(
    moduleId,
    transactionIdGroup,
    "isCreate"
  )
  const canCreateUserRole = hasPermission(
    moduleId,
    transactionIdRole,
    "isCreate"
  )

  const [filters, setFilters] = useState<IUserFilter>({})
  const [groupFilters, setGroupFilters] = useState<IUserGroupFilter>({})
  const [roleFilters, setRoleFilters] = useState<IUserRoleFilter>({})

  const {
    data: usersResponse,
    refetch: refetchUsers,
    isLoading: isLoadingUsers,
    isRefetching: isRefetchingUsers,
  } = useGet<IUser>(`${User.get}`, "users", filters.search)

  const {
    data: userGroupsResponse,
    refetch: refetchUserGroups,
    isLoading: isLoadingUserGroups,
    isRefetching: isRefetchingUserGroups,
  } = useGet<IUserGroup>(`${UserGroup.get}`, "usergroups", groupFilters.search)

  const {
    data: userRolesResponse,
    refetch: refetchUserRoles,
    isLoading: isLoadingUserRoles,
    isRefetching: isRefetchingUserRoles,
  } = useGet<IUserRole>(`${UserRole.get}`, "userroles", roleFilters.search)

  const { data: usersData } = (usersResponse as ApiResponse<IUser>) ?? {
    result: 0,
    message: "",
    data: [],
  }

  const { data: userGroupsData } =
    (userGroupsResponse as ApiResponse<IUserGroup>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  const { data: userRolesData } =
    (userRolesResponse as ApiResponse<IUserRole>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  const saveMutation = usePersist(`${User.add}`)
  const updateMutation = usePersist(`${User.add}`)
  const deleteMutation = useDelete(`${User.delete}`)

  const saveGroupMutation = usePersist(`${UserGroup.add}`)
  const updateGroupMutation = usePersist(`${UserGroup.add}`)
  const deleteGroupMutation = useDelete(`${UserGroup.delete}`)

  const saveRoleMutation = usePersist(`${UserRole.add}`)
  const updateRoleMutation = usePersist(`${UserRole.add}`)
  const deleteRoleMutation = useDelete(`${UserRole.delete}`)

  const [selectedUser, setSelectedUser] = useState<IUser | undefined>(undefined)
  const [selectedUserGroup, setSelectedUserGroup] = useState<
    IUserGroup | undefined
  >(undefined)
  const [selectedUserRole, setSelectedUserRole] = useState<
    IUserRole | undefined
  >(undefined)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    id: string | null
    name: string | null
    type: "user" | "usergroup" | "userrole"
  }>({
    isOpen: false,
    id: null,
    name: null,
    type: "user",
  })

  const queryClient = useQueryClient()

  useEffect(() => {
    if (filters.search !== undefined) {
      refetchUsers()
    }
  }, [filters.search])

  useEffect(() => {
    if (groupFilters.search !== undefined) {
      refetchUserGroups()
    }
  }, [groupFilters.search])

  useEffect(() => {
    if (roleFilters.search !== undefined) {
      refetchUserRoles()
    }
  }, [roleFilters.search])

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

  const handleViewUserGroup = (group: IUserGroup | undefined) => {
    if (!group) return
    setModalMode("view")
    setSelectedUserGroup(group)
    setIsGroupModalOpen(true)
  }

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

  const handleUserGroupFormSubmit = async (data: UserGroupFormValues) => {
    try {
      if (modalMode === "create") {
        const response = await saveGroupMutation.mutateAsync(data)
        if (response.result === 1) {
          toast.success(response.message || "User group created successfully")
          queryClient.setQueryData<ApiResponse<IUserGroup>>(
            ["usergroups"],
            (old) => {
              if (!old) return { result: 1, message: "", data: [] }
              const newData = { ...old, data: [...old.data, response.data] }
              return newData as ApiResponse<IUserGroup>
            }
          )
        } else {
          toast.error(response.message || "Failed to create user group")
        }
      } else if (modalMode === "edit" && selectedUserGroup) {
        const response = await updateGroupMutation.mutateAsync(data)
        if (response.result === 1) {
          toast.success(response.message || "User group updated successfully")
          queryClient.setQueryData<ApiResponse<IUserGroup>>(
            ["usergroups"],
            (old) => {
              if (!old) return { result: 1, message: "", data: [] }
              const newData = {
                ...old,
                data: old.data.map((group) =>
                  group.userGroupId === selectedUserGroup.userGroupId
                    ? response.data
                    : group
                ),
              }
              return newData as ApiResponse<IUserGroup>
            }
          )
        } else {
          toast.error(response.message || "Failed to update user group")
        }
      }
      setIsGroupModalOpen(false)
    } catch (error) {
      console.error("Error in user group form submission:", error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("An unexpected error occurred")
      }
    }
  }

  const handleUserRoleFormSubmit = async (data: UserRoleFormValues) => {
    try {
      if (modalMode === "create") {
        const response = await saveRoleMutation.mutateAsync(data)
        if (response.result === 1) {
          toast.success(response.message || "User role created successfully")
          queryClient.setQueryData<ApiResponse<IUserRole>>(
            ["userroles"],
            (old) => {
              if (!old) return { result: 1, message: "", data: [] }
              const newData = { ...old, data: [...old.data, response.data] }
              return newData as ApiResponse<IUserRole>
            }
          )
        } else {
          toast.error(response.message || "Failed to create user role")
        }
      } else if (modalMode === "edit" && selectedUserRole) {
        const response = await updateRoleMutation.mutateAsync(data)
        if (response.result === 1) {
          toast.success(response.message || "User role updated successfully")
          queryClient.setQueryData<ApiResponse<IUserRole>>(
            ["userroles"],
            (old) => {
              if (!old) return { result: 1, message: "", data: [] }
              const newData = {
                ...old,
                data: old.data.map((role) =>
                  role.userRoleId === selectedUserRole.userRoleId
                    ? response.data
                    : role
                ),
              }
              return newData as ApiResponse<IUserRole>
            }
          )
        } else {
          toast.error(response.message || "Failed to update user role")
        }
      }
      setIsRoleModalOpen(false)
    } catch (error) {
      console.error("Error in user role form submission:", error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("An unexpected error occurred")
      }
    }
  }

  const handleDeleteUser = (userId: string) => {
    const userToDelete = usersData?.find((u) => u.userId.toString() === userId)
    if (!userToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      id: userId,
      name: userToDelete.userName,
      type: "user",
    })
  }

  const handleDeleteUserGroup = (groupId: string) => {
    const groupToDelete = userGroupsData?.find(
      (g) => g.userGroupId.toString() === groupId
    )
    if (!groupToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      id: groupId,
      name: groupToDelete.userGroupName,
      type: "usergroup",
    })
  }

  const handleDeleteUserRole = (roleId: string) => {
    const roleToDelete = userRolesData?.find(
      (r) => r.userRoleId.toString() === roleId
    )
    if (!roleToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      id: roleId,
      name: roleToDelete.userRoleName,
      type: "userrole",
    })
  }

  const handleConfirmDelete = () => {
    if (!deleteConfirmation.id) return

    let mutation
    switch (deleteConfirmation.type) {
      case "user":
        mutation = deleteMutation
        break
      case "usergroup":
        mutation = deleteGroupMutation
        break
      case "userrole":
        mutation = deleteRoleMutation
        break
      default:
        return
    }

    toast.promise(mutation.mutateAsync(deleteConfirmation.id), {
      loading: `Deleting ${deleteConfirmation.name}...`,
      success: `${deleteConfirmation.name} has been deleted`,
      error: `Failed to delete ${deleteConfirmation.type}`,
    })
    setDeleteConfirmation({
      isOpen: false,
      id: null,
      name: null,
      type: "user",
    })
  }

  return (
    <div className="@container flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col justify-between gap-4 @md/main:flex-row @md/main:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
          <p className="text-muted-foreground text-sm">
            Manage users, groups, and permissions
          </p>
        </div>
      </div>
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="user-roles">User Roles</TabsTrigger>
          <TabsTrigger value="user-groups">User Groups</TabsTrigger>
          <TabsTrigger value="user-rights">User Rights</TabsTrigger>
          <TabsTrigger value="user-wise-rights">User Wise Rights</TabsTrigger>
          <TabsTrigger value="group-rights">Group Rights</TabsTrigger>
          <TabsTrigger value="report-rights">Report Rights</TabsTrigger>
          <TabsTrigger value="notification-preferences">
            Notification Preferences
          </TabsTrigger>

          <TabsTrigger value="share-data">Company Share Data</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="user-roles" className="space-y-4">
          {isLoadingUserRoles || isRefetchingUserRoles ? (
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
                onUserRoleSelect={
                  canViewUserRole ? handleViewUserRole : undefined
                }
                onDeleteUserRole={
                  canDeleteUserRole ? handleDeleteUserRole : undefined
                }
                onEditUserRole={
                  canEditUserRole ? handleEditUserRole : undefined
                }
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
              onUserRoleSelect={
                canViewUserRole ? handleViewUserRole : undefined
              }
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
        </TabsContent>

        <TabsContent value="user-groups" className="space-y-4">
          {isLoadingUserGroups || isRefetchingUserGroups ? (
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
                data={userGroupsData || []}
                isLoading={isLoadingUserGroups}
                onUserGroupSelect={
                  canViewUserGroup ? handleViewUserGroup : undefined
                }
                onDeleteUserGroup={
                  canDeleteUserGroup ? handleDeleteUserGroup : undefined
                }
                onEditUserGroup={
                  canEditUserGroup ? handleEditUserGroup : undefined
                }
                onCreateUserGroup={
                  canCreateUserGroup ? handleCreateUserGroup : undefined
                }
                onRefresh={refetchUserGroups}
                onFilterChange={setGroupFilters}
                moduleId={moduleId}
                transactionId={transactionIdGroup}
              />
            </LockSkeleton>
          ) : (
            <UserGroupTable
              data={userGroupsData || []}
              isLoading={isLoadingUserGroups}
              onUserGroupSelect={
                canViewUserGroup ? handleViewUserGroup : undefined
              }
              onDeleteUserGroup={
                canDeleteUserGroup ? handleDeleteUserGroup : undefined
              }
              onEditUserGroup={
                canEditUserGroup ? handleEditUserGroup : undefined
              }
              onCreateUserGroup={
                canCreateUserGroup ? handleCreateUserGroup : undefined
              }
              onRefresh={refetchUserGroups}
              onFilterChange={setGroupFilters}
              moduleId={moduleId}
              transactionId={transactionIdGroup}
            />
          )}
        </TabsContent>

        <TabsContent value="user-rights">
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
          ) : (
            <UserRightsTable />
          )}
        </TabsContent>

        <TabsContent value="user-wise-rights">
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
          ) : (
            <UserWiseRightsTable />
          )}
        </TabsContent>

        <TabsContent value="group-rights">
          {isLoadingUserGroups || isRefetchingUserGroups ? (
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
          ) : (
            <UserGroupRightsTable />
          )}
        </TabsContent>

        <TabsContent value="report-rights">
          {isLoadingUserGroups || isRefetchingUserGroups ? (
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
          ) : (
            <UserGroupReportRightsTable />
          )}
        </TabsContent>

        <TabsContent value="notification-preferences">
          <NotificationPreferencesTable />
        </TabsContent>

        <TabsContent value="share-data">
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
          ) : (
            <ShareDataTable />
          )}
        </TabsContent>
      </Tabs>

      {/* User Dialog */}
      <Dialog
        open={isUserModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsUserModalOpen(false)
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

      {/* User Group Dialog */}
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
          />
        </DialogContent>
      </Dialog>

      {/* User Role Dialog */}
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

      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title={`Delete ${deleteConfirmation.type.toUpperCase()}`}
        description={`This action cannot be undone. This will permanently delete the ${deleteConfirmation.type} from our servers.`}
        itemName={deleteConfirmation.name || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            id: null,
            name: null,
            type: "user",
          })
        }
        isDeleting={
          deleteConfirmation.type === "user"
            ? deleteMutation.isPending
            : deleteConfirmation.type === "usergroup"
              ? deleteGroupMutation.isPending
              : deleteRoleMutation.isPending
        }
      />
    </div>
  )
}
